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
    throw new Error('PDF upload is coming soon. For now, copy the text out of your PDF reader and paste it directly.');
  }
  throw new Error(`Unsupported file type: ${ext || mime}. Supported: .txt, .md, .docx`);
}

async function parseDocx(file) {
  const mammoth = await import('mammoth');
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return (result.value || '').trim();
}
