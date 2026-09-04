/**
 * Upload validation tests.
 *
 * Exercises the rules that keep a malicious or malformed file out of the
 * document store: renamed executables, path traversal in filenames, oversized
 * files and type mismatches. Run with `pnpm test:uploads`.
 */

import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_BYTES,
  extensionOf,
  sanitiseFilename,
  validateUpload,
  type UploadVerdict,
} from '../lib/leads/upload-validation';

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    passed += 1;
    console.log(`  ${green('ok')}   ${label}`);
  } else {
    failed += 1;
    console.log(`  ${red('FAIL')} ${label}`);
    if (detail) console.log(dim(`         ${detail}`));
  }
}

/** Build a byte array from a magic-number prefix plus filler. */
function bytesWith(prefix: number[], totalLength = 600): Uint8Array {
  const out = new Uint8Array(totalLength);
  out.set(prefix, 0);
  // Fill the remainder with printable ASCII so text heuristics see valid data.
  for (let i = prefix.length; i < totalLength; i++) out[i] = 0x41;
  return out;
}

const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]; // %PDF-1.7
const ZIP = [0x50, 0x4b, 0x03, 0x04];
const OLE2 = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const ELF = [0x7f, 0x45, 0x4c, 0x46]; // Linux executable
const MZ = [0x4d, 0x5a, 0x90, 0x00]; // Windows PE executable
const SHEBANG = [0x23, 0x21, 0x2f, 0x62, 0x69, 0x6e, 0x2f, 0x73, 0x68]; // #!/bin/sh

function check(
  filename: string,
  contentType: string,
  bytes: Uint8Array,
  byteSize = bytes.byteLength,
): UploadVerdict {
  return validateUpload({
    filename,
    contentType,
    byteSize,
    head: bytes.subarray(0, 512),
  });
}

console.log(`\n${bold('Upload validation')}`);

/* -------------------------------------------------------------------------- */
console.log(`\n${bold('Accepts genuine documents')}`);

assert(
  'a real PDF',
  check('BOQ Package 4.pdf', 'application/pdf', bytesWith(PDF)).ok,
);
assert(
  'an xlsx (OOXML is a zip)',
  check(
    'quantities.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    bytesWith(ZIP),
  ).ok,
);
assert(
  'a legacy xls (OLE2)',
  check('quantities.xls', 'application/vnd.ms-excel', bytesWith(OLE2)).ok,
);
assert(
  'a docx',
  check(
    'method-statement.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    bytesWith(ZIP),
  ).ok,
);
assert(
  'a CSV of plain text',
  check(
    'items.csv',
    'text/csv',
    new TextEncoder().encode('item,unit,qty\nThermoplastic marking,sqm,12500\n'),
  ).ok,
);
assert('a PNG site photo', check('site.png', 'image/png', bytesWith(PNG)).ok);
assert('a JPEG site photo', check('site.jpg', 'image/jpeg', bytesWith(JPEG)).ok);
assert(
  'a zipped tender pack',
  check('tender-pack.zip', 'application/zip', bytesWith(ZIP)).ok,
);
assert(
  'a PDF the browser reported as octet-stream',
  check('boq.pdf', 'application/octet-stream', bytesWith(PDF)).ok,
);
assert(
  'a PDF with no reported content type',
  check('boq.pdf', '', bytesWith(PDF)).ok,
);

/* -------------------------------------------------------------------------- */
console.log(`\n${bold('Rejects renamed executables and scripts')}`);

{
  const v = check('boq.pdf', 'application/pdf', bytesWith(ELF));
  assert(
    'a Linux executable renamed to .pdf',
    !v.ok && v.reason === 'content-mismatch',
    v.ok ? 'accepted' : `reason was ${v.reason}`,
  );
}
{
  const v = check('quantities.xlsx', 'application/vnd.ms-excel', bytesWith(MZ));
  assert(
    'a Windows executable renamed to .xlsx',
    !v.ok && v.reason === 'content-mismatch',
    v.ok ? 'accepted' : `reason was ${v.reason}`,
  );
}
{
  // Printable filler, so the statistical text test alone would pass it.
  // The binary-signature blocklist is what rejects it.
  const v = check('items.csv', 'text/csv', bytesWith(ELF));
  assert(
    'an ELF binary with printable padding renamed to .csv',
    !v.ok && v.reason === 'content-mismatch',
    v.ok ? 'accepted' : `reason was ${v.reason}`,
  );
}
{
  // A realistic binary: NUL padding after the header.
  const realistic = new Uint8Array(600);
  realistic.set(ELF, 0);
  const v = check('items.csv', 'text/csv', realistic);
  assert(
    'a realistic NUL-padded binary renamed to .csv',
    !v.ok && v.reason === 'content-mismatch',
    v.ok ? 'accepted' : `reason was ${v.reason}`,
  );
}
{
  const v = check('items.csv', 'text/csv', bytesWith(MZ));
  assert(
    'a Windows executable renamed to .csv',
    !v.ok && v.reason === 'content-mismatch',
    v.ok ? 'accepted' : `reason was ${v.reason}`,
  );
}
{
  const v = check('items.csv', 'text/csv', new Uint8Array(SHEBANG));
  assert(
    'a shell script renamed to .csv',
    !v.ok && v.reason === 'content-mismatch',
    v.ok ? 'accepted' : `reason was ${v.reason}`,
  );
}
{
  // A shell script IS plain text, so the text heuristic cannot catch it. The
  // extension allowlist is what stops it — .sh is not accepted at all.
  const v = check('deploy.sh', 'text/plain', new Uint8Array(SHEBANG));
  assert(
    'a shell script (blocked by the extension allowlist)',
    !v.ok && v.reason === 'unsupported-extension',
    v.ok ? 'accepted' : `reason was ${v.reason}`,
  );
}
{
  const v = check('payload.exe', 'application/octet-stream', bytesWith(MZ));
  assert(
    'an .exe',
    !v.ok && v.reason === 'unsupported-extension',
    v.ok ? 'accepted' : `reason was ${v.reason}`,
  );
}
{
  const v = check('index.html', 'text/html', new TextEncoder().encode('<script>x</script>'));
  assert(
    'an HTML file',
    !v.ok && v.reason === 'unsupported-extension',
    v.ok ? 'accepted' : `reason was ${v.reason}`,
  );
}
{
  const v = check('macro.xlsx.js', 'text/javascript', new TextEncoder().encode('alert(1)'));
  assert(
    'a double extension ending in .js',
    !v.ok && v.reason === 'unsupported-extension',
    v.ok ? 'accepted' : `reason was ${v.reason}`,
  );
}

/* -------------------------------------------------------------------------- */
console.log(`\n${bold('Rejects size and content problems')}`);

{
  const v = check('huge.pdf', 'application/pdf', bytesWith(PDF), MAX_FILE_BYTES + 1);
  assert('a file over the size cap', !v.ok && v.reason === 'too-large');
}
{
  const v = check('empty.pdf', 'application/pdf', new Uint8Array(0), 0);
  assert('an empty file', !v.ok && v.reason === 'empty');
}
{
  const v = check('noext', 'application/pdf', bytesWith(PDF));
  assert('a file with no extension', !v.ok && v.reason === 'unsupported-extension');
}
{
  const v = check('report.pdf', 'image/png', bytesWith(PDF));
  assert(
    'a PDF declared as image/png',
    !v.ok && v.reason === 'content-mismatch',
    v.ok ? 'accepted' : `reason was ${v.reason}`,
  );
}
{
  // Truncated below the signature length: cannot be confirmed, so refused.
  const v = check('tiny.png', 'image/png', new Uint8Array([0x89, 0x50]));
  assert('a file too short to carry its signature', !v.ok && v.reason === 'content-mismatch');
}

/* -------------------------------------------------------------------------- */
console.log(`\n${bold('Filename handling')}`);

assert(
  'strips a POSIX path',
  sanitiseFilename('/etc/passwd') === 'passwd',
  `got ${JSON.stringify(sanitiseFilename('/etc/passwd'))}`,
);
assert(
  'strips a Windows path',
  sanitiseFilename('C:\\Users\\me\\boq.pdf') === 'boq.pdf',
  `got ${JSON.stringify(sanitiseFilename('C:\\Users\\me\\boq.pdf'))}`,
);
assert(
  'strips traversal segments',
  sanitiseFilename('../../../../etc/shadow') === 'shadow',
  `got ${JSON.stringify(sanitiseFilename('../../../../etc/shadow'))}`,
);
assert(
  'strips leading dots so no dotfile is produced',
  sanitiseFilename('.htaccess') === 'htaccess',
  `got ${JSON.stringify(sanitiseFilename('.htaccess'))}`,
);
assert(
  'strips control characters',
  sanitiseFilename('boq\u0000\u001b[2J.pdf') === 'boq[2J.pdf',
  `got ${JSON.stringify(sanitiseFilename('boq\u0000\u001b[2J.pdf'))}`,
);
assert(
  'caps the length',
  sanitiseFilename('a'.repeat(500) + '.pdf').length <= 200,
);
{
  const v = check('../../../../etc/passwd.pdf', 'application/pdf', bytesWith(PDF));
  assert(
    'a traversal filename is accepted only after being reduced to its basename',
    v.ok && v.safeName === 'passwd.pdf',
    v.ok ? `safeName was ${v.safeName}` : `rejected: ${v.reason}`,
  );
}
assert(
  'extension parsing is case-insensitive',
  extensionOf('BOQ.PDF') === 'pdf',
);
{
  const v = check('BOQ.PDF', 'application/pdf', bytesWith(PDF));
  assert('an uppercase extension is accepted', v.ok);
}

/* -------------------------------------------------------------------------- */
console.log(`\n${bold('Allowlist shape')}`);

assert(
  'no executable or script extension is accepted',
  !['exe', 'sh', 'bat', 'cmd', 'js', 'php', 'html', 'svg', 'dll', 'so'].some((e) =>
    ACCEPTED_EXTENSIONS.includes(e),
  ),
  `allowlist: ${ACCEPTED_EXTENSIONS.join(', ')}`,
);
assert(
  'the formats a BOQ actually arrives in are accepted',
  ['pdf', 'xlsx', 'xls', 'docx', 'csv', 'zip'].every((e) =>
    ACCEPTED_EXTENSIONS.includes(e),
  ),
);

/* -------------------------------------------------------------------------- */
console.log('');
console.log(dim(`${passed} passed, ${failed} failed.`));
console.log('');

if (failed > 0) {
  console.log(red('Upload validation tests failed.\n'));
  process.exit(1);
}
console.log(green('All upload validation tests passed.\n'));
