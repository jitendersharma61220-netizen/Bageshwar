/**
 * Upload validation.
 *
 * Three rules, in order of how much they can be trusted:
 *
 *  1. The extension is visitor-controlled and trivially spoofed.
 *  2. The Content-Type the browser reports is a hint, not evidence.
 *  3. The bytes at the head of the file are the only thing worth believing.
 *
 * So all three must agree before a file is accepted, and it is the third that
 * decides. A file named "boq.pdf" that is actually an executable is rejected
 * here rather than stored and discovered later.
 */

export const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MiB
export const MAX_FILES_PER_ENQUIRY = 6;
export const MAX_TOTAL_BYTES = 60 * 1024 * 1024; // 60 MiB across all files

interface FileKind {
  readonly extensions: readonly string[];
  readonly contentTypes: readonly string[];
  /**
   * Byte signatures, any one of which identifies the format. `offset` is where
   * the signature starts. An empty list means the format has no reliable magic
   * number and is validated structurally instead.
   */
  readonly signatures: readonly { offset: number; bytes: readonly number[] }[];
  readonly label: string;
}

const ZIP_LOCAL_HEADER = { offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] } as const;
const ZIP_EMPTY = { offset: 0, bytes: [0x50, 0x4b, 0x05, 0x06] } as const;
const ZIP_SPANNED = { offset: 0, bytes: [0x50, 0x4b, 0x07, 0x08] } as const;

/**
 * Accepted formats.
 *
 * Deliberately excludes executables, scripts and disk images. ZIP is accepted
 * because tender packs are routinely distributed that way, and it is safe here
 * because the archive is only ever stored - never extracted, never executed,
 * never served to a browser from our origin.
 */
const ACCEPTED: readonly FileKind[] = [
  {
    label: 'PDF',
    extensions: ['pdf'],
    contentTypes: ['application/pdf'],
    signatures: [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }], // %PDF
  },
  {
    label: 'Excel workbook',
    extensions: ['xlsx', 'xlsm'],
    contentTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
    ],
    signatures: [ZIP_LOCAL_HEADER, ZIP_EMPTY, ZIP_SPANNED], // OOXML is a zip
  },
  {
    label: 'Legacy Excel workbook',
    extensions: ['xls'],
    contentTypes: ['application/vnd.ms-excel'],
    signatures: [{ offset: 0, bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] }], // OLE2
  },
  {
    label: 'Word document',
    extensions: ['docx'],
    contentTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    signatures: [ZIP_LOCAL_HEADER, ZIP_EMPTY, ZIP_SPANNED],
  },
  {
    label: 'Legacy Word document',
    extensions: ['doc'],
    contentTypes: ['application/msword'],
    signatures: [{ offset: 0, bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] }],
  },
  {
    label: 'CSV',
    extensions: ['csv'],
    contentTypes: ['text/csv', 'application/csv', 'text/plain'],
    signatures: [], // Plain text: validated as text below.
  },
  {
    label: 'JPEG image',
    extensions: ['jpg', 'jpeg'],
    contentTypes: ['image/jpeg'],
    signatures: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  },
  {
    label: 'PNG image',
    extensions: ['png'],
    contentTypes: ['image/png'],
    signatures: [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  },
  {
    label: 'ZIP archive',
    extensions: ['zip'],
    contentTypes: ['application/zip', 'application/x-zip-compressed'],
    signatures: [ZIP_LOCAL_HEADER, ZIP_EMPTY, ZIP_SPANNED],
  },
];

export const ACCEPTED_EXTENSIONS = ACCEPTED.flatMap((k) => k.extensions);

/** For the file input's `accept` attribute. */
export const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(',');

export type UploadRejectionReason =
  | 'too-large'
  | 'empty'
  | 'unsupported-extension'
  | 'content-mismatch'
  | 'suspicious-name';

export interface AcceptedUpload {
  readonly ok: true;
  readonly label: string;
  /** Normalised, path-free display name. */
  readonly safeName: string;
  readonly extension: string;
}

export interface RejectedUpload {
  readonly ok: false;
  readonly reason: UploadRejectionReason;
  readonly detail: string;
}

export type UploadVerdict = AcceptedUpload | RejectedUpload;

function matchesSignature(
  head: Uint8Array,
  sig: { offset: number; bytes: readonly number[] },
): boolean {
  if (head.length < sig.offset + sig.bytes.length) return false;
  return sig.bytes.every((byte, i) => head[sig.offset + i] === byte);
}

/**
 * Signatures of formats that must never be accepted as text.
 *
 * The statistical text heuristic below can be defeated by a binary whose
 * payload happens to be printable, so a file claiming to be CSV is first
 * checked against these outright. A real CSV never begins with any of them.
 */
const BINARY_SIGNATURES: readonly (readonly number[])[] = [
  [0x7f, 0x45, 0x4c, 0x46], // ELF executable
  [0x4d, 0x5a], // Windows PE / DOS executable
  [0xd0, 0xcf, 0x11, 0xe0], // OLE2 compound document
  [0x50, 0x4b, 0x03, 0x04], // ZIP
  [0x25, 0x50, 0x44, 0x46], // PDF
  [0x89, 0x50, 0x4e, 0x47], // PNG
  [0xff, 0xd8, 0xff], // JPEG
  [0x47, 0x49, 0x46, 0x38], // GIF
  [0x1f, 0x8b], // gzip
  [0x42, 0x5a, 0x68], // bzip2
  [0xfd, 0x37, 0x7a, 0x58], // xz
  [0x37, 0x7a, 0xbc, 0xaf], // 7z
  [0x52, 0x61, 0x72, 0x21], // RAR
  [0xca, 0xfe, 0xba, 0xbe], // Java class / Mach-O fat
  [0xcf, 0xfa, 0xed, 0xfe], // Mach-O
  [0x23, 0x21], // #! shebang
];

function hasBinarySignature(head: Uint8Array): boolean {
  return BINARY_SIGNATURES.some(
    (sig) => head.length >= sig.length && sig.every((byte, i) => head[i] === byte),
  );
}

/**
 * Does this look like text? Used for CSV, which has no magic number.
 *
 * Two gates. First, the head must not carry a known binary or script
 * signature — a statistical test alone can be defeated by a binary with a
 * printable payload. Second, NUL bytes and a high proportion of non-printable
 * ASCII are rejected, which is what separates a spreadsheet export from a
 * renamed binary in the general case.
 */
function looksLikeText(head: Uint8Array): boolean {
  if (head.length === 0) return false;
  if (hasBinarySignature(head)) return false;

  let suspicious = 0;
  for (const byte of head) {
    if (byte === 0x00) return false;
    const printable =
      byte === 0x09 || byte === 0x0a || byte === 0x0d || (byte >= 0x20 && byte <= 0x7e);
    // Bytes above 0x7f are legitimate in UTF-8 text, so they are not counted.
    if (!printable && byte < 0x80) suspicious += 1;
  }
  return suspicious / head.length < 0.1;
}

/** Control characters, stripped from display names. */
const CONTROL_CHARS = /[\u0000-\u001f\u007f-\u009f]/g;

/**
 * Strip any path the client supplied and reduce the name to safe display text.
 *
 * The result is never used to build a storage path - that key is generated
 * server-side - but it is stored and shown, so it must not carry traversal
 * sequences or control characters.
 */
export function sanitiseFilename(input: string): string {
  const base = input.split(/[\\/]/).pop() ?? '';
  return base.replace(CONTROL_CHARS, '').replace(/^\.+/, '').trim().slice(0, 200);
}

export function extensionOf(name: string): string {
  const match = /\.([a-z0-9]{1,8})$/i.exec(name);
  return match ? match[1]!.toLowerCase() : '';
}

/**
 * Validate one upload against its declared name, type and leading bytes.
 *
 * `head` should be at least the first 512 bytes of the file.
 */
export function validateUpload({
  filename,
  contentType,
  byteSize,
  head,
}: {
  filename: string;
  contentType: string;
  byteSize: number;
  head: Uint8Array;
}): UploadVerdict {
  const safeName = sanitiseFilename(filename);

  if (!safeName) {
    return { ok: false, reason: 'suspicious-name', detail: 'The file name is not usable.' };
  }
  if (byteSize <= 0) {
    return { ok: false, reason: 'empty', detail: `${safeName} is empty.` };
  }
  if (byteSize > MAX_FILE_BYTES) {
    return {
      ok: false,
      reason: 'too-large',
      detail: `${safeName} is larger than ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB.`,
    };
  }

  const extension = extensionOf(safeName);
  const kind = ACCEPTED.find((k) => k.extensions.includes(extension));
  if (!kind) {
    return {
      ok: false,
      reason: 'unsupported-extension',
      detail: `${safeName} is not a supported file type. Accepted: ${ACCEPTED_EXTENSIONS.join(', ')}.`,
    };
  }

  // The declared content type is only a hint, so a mismatch is tolerated when
  // the bytes agree. Browsers report inconsistent types for Office formats.
  const declaredType = contentType.toLowerCase().split(';')[0]!.trim();
  const declaredTypeIsPlausible =
    declaredType === '' ||
    declaredType === 'application/octet-stream' ||
    kind.contentTypes.includes(declaredType);

  const bytesAgree =
    kind.signatures.length > 0
      ? kind.signatures.some((sig) => matchesSignature(head, sig))
      : looksLikeText(head);

  if (!bytesAgree) {
    return {
      ok: false,
      reason: 'content-mismatch',
      detail: `${safeName} does not contain valid ${kind.label} data. It may have been renamed or is corrupt.`,
    };
  }

  if (!declaredTypeIsPlausible) {
    return {
      ok: false,
      reason: 'content-mismatch',
      detail: `${safeName} was reported as ${declaredType}, which does not match a ${kind.label}.`,
    };
  }

  return { ok: true, label: kind.label, safeName, extension };
}
