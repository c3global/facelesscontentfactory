// Extract plain text from uploaded files for the brand sample trainer.
//
// Plain-text formats parse inline; DOCX lazy-imports `mammoth` so the
// bundle only pays the cost when a user actually uploads one.
//
// Returns { text, source_type } on success or throws with a friendly message.

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function parseFile(file) {
  if (!file) throw new Error('No file selected');
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`File is larger than ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB. Try pasting the text directly.`);
  }

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const mime = file.type || '';

  if (ext === 'txt' || mime === 'text/plain') {
    return { text: await file.text(), source_type: 'txt' };
  }
  if (ext === 'md' || ext === 'markdown' || mime === 'text/markdown') {
    return { text: await file.text(), source_type: 'md' };
  }
  if (ext === 'docx' || mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const text = await parseDocx(file);
    return { text, source_type: 'docx' };
  }
  if (ext === 'pdf' || mime === 'application/pdf') {
    const text = await parsePdf(file);
    return { text, source_type: 'pdf' };
  }
  throw new Error(`Unsupported file type: ${ext || mime}. Supported: .txt, .md, .docx, .pdf`);
}

async function parseDocx(file) {
  const mammoth = await import('mammoth');
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return (result.value || '').trim();
}

async function parsePdf(file) {
  // pdfjs-dist is large (~2MB); lazy-import so the bundle only pays the cost
  // when a user actually uploads a PDF.
  const pdfjs = await import('pdfjs-dist');
  // Provide an inline worker so we don't need a separate URL for the worker
  // script (avoids CSP / cross-origin headaches on Netlify).
  const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((it) => ('str' in it ? it.str : '')).filter(Boolean);
    pages.push(strings.join(' '));
  }
  return pages.join('\n\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
