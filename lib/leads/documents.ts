import { createHash, randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { getServiceClient, LEAD_DOCUMENTS_BUCKET } from '@/lib/supabase/client';

/**
 * Where uploaded BOQ and tender documents are stored.
 *
 * Two implementations behind one interface, matching the LeadSink pattern:
 * a filesystem store for local development, and Supabase Storage in
 * production. Neither ever serves a file publicly.
 */

export interface StoredDocument {
  /** Key within the store. Server-generated; never derived from the filename. */
  readonly storageKey: string;
  readonly originalName: string;
  readonly contentType: string;
  readonly byteSize: number;
  /** Hex sha256, for integrity and duplicate detection. */
  readonly checksum: string;
}

export interface DocumentStore {
  readonly name: string;
  put(file: {
    bytes: Uint8Array;
    originalName: string;
    contentType: string;
    extension: string;
  }): Promise<StoredDocument>;
}

/**
 * Build a storage key that cannot be influenced by the visitor.
 *
 * The only thing taken from the upload is the validated extension, drawn from
 * a fixed allowlist. Everything else is generated, so no filename can traverse
 * a path or collide with an existing object.
 */
function buildStorageKey(extension: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `leads/${year}/${month}/${randomUUID()}.${extension}`;
}

function checksumOf(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * Local development store. Writes under a directory that is gitignored, so an
 * uploaded client document cannot be committed by accident.
 */
class FilesystemDocumentStore implements DocumentStore {
  readonly name = 'filesystem';

  constructor(private readonly root: string) {}

  async put(file: {
    bytes: Uint8Array;
    originalName: string;
    contentType: string;
    extension: string;
  }): Promise<StoredDocument> {
    const storageKey = buildStorageKey(file.extension);

    // Resolve and confirm the destination stays inside the root, so a future
    // change to key generation cannot silently escape it.
    const destination = resolve(join(this.root, storageKey));
    const rootResolved = resolve(this.root);
    if (!destination.startsWith(rootResolved + '/')) {
      throw new Error('refusing to write outside the upload root');
    }

    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, file.bytes, { mode: 0o600 });

    return {
      storageKey,
      originalName: file.originalName,
      contentType: file.contentType,
      byteSize: file.bytes.byteLength,
      checksum: checksumOf(file.bytes),
    };
  }
}

/** Production store: a private Supabase Storage bucket. */
class SupabaseDocumentStore implements DocumentStore {
  readonly name = 'supabase';

  async put(file: {
    bytes: Uint8Array;
    originalName: string;
    contentType: string;
    extension: string;
  }): Promise<StoredDocument> {
    const client = getServiceClient();
    if (!client) throw new Error('Supabase is not configured');

    const storageKey = buildStorageKey(file.extension);

    const { error } = await client.storage
      .from(LEAD_DOCUMENTS_BUCKET)
      .upload(storageKey, file.bytes, {
        contentType: file.contentType,
        // Never overwrite: a colliding key would mean the generator is broken,
        // and silently replacing a client's document would be worse than failing.
        upsert: false,
      });

    if (error) {
      throw new Error(`document upload failed: ${error.message}`);
    }

    return {
      storageKey,
      originalName: file.originalName,
      contentType: file.contentType,
      byteSize: file.bytes.byteLength,
      checksum: checksumOf(file.bytes),
    };
  }
}

let cached: DocumentStore | null = null;

/**
 * Resolve the configured store.
 *
 * Falls back to the filesystem store when Supabase is selected but not
 * configured, so a misconfigured environment keeps the document rather than
 * losing it.
 */
export function getDocumentStore(): DocumentStore {
  if (cached) return cached;

  const configured = process.env.DOCUMENT_STORE ?? 'filesystem';

  if (configured === 'supabase') {
    if (getServiceClient()) {
      cached = new SupabaseDocumentStore();
      return cached;
    }
    console.warn(
      '[enquiry] DOCUMENT_STORE=supabase but NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is unset. Falling back to the filesystem store.',
    );
  }

  cached = new FilesystemDocumentStore(process.env.UPLOAD_DIR ?? './uploads');
  return cached;
}

/** Reset the memoised store. Tests only. */
export function resetDocumentStoreForTesting(): void {
  cached = null;
}
