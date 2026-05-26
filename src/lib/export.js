// Export utilities for Cadence content pieces.
//
// Each piece carries: title, optional hook, body (HTML from the TipTap editor),
// optional hashtags. These helpers compose the whole piece into the requested
// format and either copy it to the clipboard or trigger a file download.

import TurndownService from 'turndown';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
} from 'docx';
import { jsPDF } from 'jspdf';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});

// ---------------------------------------------------------------------------
// Format converters
// ---------------------------------------------------------------------------

export function pieceToPlainText(piece) {
  const parts = [];
  if (piece.title) parts.push(piece.title.toUpperCase(), '');
  if (piece.hook)  parts.push(piece.hook, '');
  if (piece.bodyHtml) parts.push(htmlToPlain(piece.bodyHtml));
  if (piece.hashtags?.length) {
    parts.push('', piece.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' '));
  }
  return parts.join('\n');
}

export function pieceToMarkdown(piece) {
  const parts = [];
  if (piece.title) parts.push(`# ${piece.title}`, '');
  if (piece.hook)  parts.push(`> ${piece.hook}`, '');
  if (piece.bodyHtml) parts.push(turndown.turndown(piece.bodyHtml));
  if (piece.hashtags?.length) {
    parts.push('', piece.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' '));
  }
  return parts.join('\n');
}

export function pieceToHtml(piece) {
  const parts = [];
  if (piece.title) parts.push(`<h1>${escapeHtml(piece.title)}</h1>`);
  if (piece.hook)  parts.push(`<blockquote>${escapeHtml(piece.hook)}</blockquote>`);
  if (piece.bodyHtml) parts.push(piece.bodyHtml);
  if (piece.hashtags?.length) {
    const tags = piece.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ');
    parts.push(`<p>${escapeHtml(tags)}</p>`);
  }
  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Clipboard helpers
// ---------------------------------------------------------------------------

export async function copyPlainText(piece) {
  await navigator.clipboard.writeText(pieceToPlainText(piece));
}

export async function copyMarkdown(piece) {
  await navigator.clipboard.writeText(pieceToMarkdown(piece));
}

export async function copyHtml(piece) {
  const html = pieceToHtml(piece);
  // Rich copy: place HTML in clipboard so it pastes formatted into Docs/Notion/etc.
  if (window.ClipboardItem) {
    const blob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([pieceToPlainText(piece)], { type: 'text/plain' });
    await navigator.clipboard.write([
      new ClipboardItem({ 'text/html': blob, 'text/plain': textBlob }),
    ]);
  } else {
    await navigator.clipboard.writeText(html);
  }
}

// ---------------------------------------------------------------------------
// File downloads
// ---------------------------------------------------------------------------

export function downloadTxt(piece) {
  triggerDownload(
    new Blob([pieceToPlainText(piece)], { type: 'text/plain;charset=utf-8' }),
    `${filenameFor(piece)}.txt`,
  );
}

export function downloadMarkdown(piece) {
  triggerDownload(
    new Blob([pieceToMarkdown(piece)], { type: 'text/markdown;charset=utf-8' }),
    `${filenameFor(piece)}.md`,
  );
}

export async function downloadDocx(piece) {
  const children = htmlToDocxParagraphs(piece);
  const doc = new Document({
    creator: 'Cadence',
    title: piece.title || filenameFor(piece),
    sections: [{ properties: {}, children }],
  });
  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${filenameFor(piece)}.docx`);
}

export function downloadPdf(piece) {
  const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 56; // ~0.78"
  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const writable = pageWidth - margin * 2;
  let y = margin;

  function ensureRoom(h) {
    if (y + h > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  }
  function writeBlock(text, opts = {}) {
    const { size = 11, style = 'normal', spaceAfter = 6, font = 'helvetica' } = opts;
    pdf.setFont(font, style);
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(text, writable);
    const lineHeight = size * 1.35;
    for (const line of lines) {
      ensureRoom(lineHeight);
      pdf.text(line, margin, y);
      y += lineHeight;
    }
    y += spaceAfter;
  }

  if (piece.title) writeBlock(piece.title, { size: 20, style: 'bold', spaceAfter: 12 });
  if (piece.hook)  writeBlock(piece.hook, { size: 12, style: 'italic', spaceAfter: 14 });

  const blocks = htmlToTextBlocks(piece.bodyHtml || '');
  for (const b of blocks) {
    writeBlock(b.text, {
      size: b.heading ? 16 - b.heading : 11,
      style: b.heading ? 'bold' : b.bold ? 'bold' : b.italic ? 'italic' : 'normal',
      spaceAfter: b.heading ? 10 : 7,
    });
  }

  if (piece.hashtags?.length) {
    writeBlock(
      piece.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' '),
      { size: 10, style: 'italic', spaceAfter: 0 }
    );
  }

  pdf.save(`${filenameFor(piece)}.pdf`);
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function filenameFor(piece) {
  const parts = [];
  if (piece.platform) parts.push(piece.platform);
  if (piece.day != null) parts.push(`day-${String(piece.day).padStart(2, '0')}`);
  const title = (piece.title || 'cadence').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  parts.push(title.slice(0, 40));
  return parts.filter(Boolean).join('_') || 'cadence-piece';
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function htmlToPlain(html) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstChild;
  const out = [];
  for (const node of root.childNodes) {
    out.push(blockNodeToText(node));
  }
  return out.filter(Boolean).join('\n\n');
}

function blockNodeToText(node) {
  if (node.nodeType === 3) return node.textContent;
  if (node.nodeType !== 1) return '';
  const tag = node.tagName.toLowerCase();
  if (tag === 'ul' || tag === 'ol') {
    return Array.from(node.children).map((li, i) => {
      const bullet = tag === 'ol' ? `${i + 1}. ` : '- ';
      return bullet + (li.textContent || '').trim();
    }).join('\n');
  }
  if (tag === 'br') return '';
  return (node.textContent || '').trim();
}

// Lightweight HTML walker → docx Paragraph[]
function htmlToDocxParagraphs(piece) {
  const out = [];
  if (piece.title) {
    out.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: piece.title, bold: true, size: 40 })],
      spacing: { after: 240 },
    }));
  }
  if (piece.hook) {
    out.push(new Paragraph({
      children: [new TextRun({ text: piece.hook, italics: true, size: 26 })],
      spacing: { after: 240 },
    }));
  }
  if (piece.bodyHtml) {
    const doc = new DOMParser().parseFromString(`<div>${piece.bodyHtml}</div>`, 'text/html');
    for (const node of doc.body.firstChild.childNodes) {
      out.push(...domBlockToDocxParagraphs(node));
    }
  }
  if (piece.hashtags?.length) {
    const tags = piece.hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ');
    out.push(new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: tags, italics: true, color: '888888', size: 20 })],
      spacing: { before: 240 },
    }));
  }
  return out;
}

function domBlockToDocxParagraphs(node) {
  if (node.nodeType === 3) {
    const text = node.textContent;
    if (!text.trim()) return [];
    return [new Paragraph({ children: [new TextRun(text)] })];
  }
  if (node.nodeType !== 1) return [];
  const tag = node.tagName.toLowerCase();

  if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
    const level = {
      h1: HeadingLevel.HEADING_1, h2: HeadingLevel.HEADING_2,
      h3: HeadingLevel.HEADING_3, h4: HeadingLevel.HEADING_4,
    }[tag];
    return [new Paragraph({
      heading: level,
      children: inlineToRuns(node),
      spacing: { before: 240, after: 120 },
    })];
  }
  if (tag === 'blockquote') {
    return Array.from(node.children).flatMap((child) =>
      domBlockToDocxParagraphs(child).map((p) => {
        p.options = { ...p.options, indent: { left: 480 } };
        return p;
      })
    ).filter(Boolean);
  }
  if (tag === 'ul' || tag === 'ol') {
    return Array.from(node.children).map((li, i) => new Paragraph({
      bullet: tag === 'ul' ? { level: 0 } : undefined,
      numbering: tag === 'ol' ? { reference: 'cadence-ol', level: 0 } : undefined,
      children: inlineToRuns(li),
    }));
  }
  if (tag === 'pre') {
    return [new Paragraph({
      children: [new TextRun({ text: node.textContent, font: 'Courier New', size: 20 })],
    })];
  }
  // default: paragraph
  return [new Paragraph({ children: inlineToRuns(node) })];
}

function inlineToRuns(node) {
  const runs = [];
  walkInline(node, { bold: false, italic: false, code: false }, runs);
  return runs.length ? runs : [new TextRun('')];
}

function walkInline(node, style, out) {
  if (node.nodeType === 3) {
    out.push(new TextRun({
      text: node.textContent,
      bold: style.bold || undefined,
      italics: style.italic || undefined,
      font: style.code ? 'Courier New' : undefined,
    }));
    return;
  }
  if (node.nodeType !== 1) return;
  const tag = node.tagName.toLowerCase();
  const next = { ...style };
  if (tag === 'strong' || tag === 'b') next.bold = true;
  if (tag === 'em' || tag === 'i')     next.italic = true;
  if (tag === 'code')                  next.code = true;
  if (tag === 'br') { out.push(new TextRun({ break: 1 })); return; }
  for (const child of node.childNodes) walkInline(child, next, out);
}

// Simple paragraph extraction for PDF — flat list of {text, heading?, bold?, italic?}
function htmlToTextBlocks(html) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const out = [];
  for (const node of doc.body.firstChild.childNodes) {
    if (node.nodeType !== 1) {
      if (node.nodeType === 3 && node.textContent.trim()) out.push({ text: node.textContent });
      continue;
    }
    const tag = node.tagName.toLowerCase();
    const text = (node.textContent || '').trim();
    if (!text) continue;
    if (tag === 'h1') out.push({ text, heading: 1 });
    else if (tag === 'h2') out.push({ text, heading: 2 });
    else if (tag === 'h3') out.push({ text, heading: 3 });
    else if (tag === 'blockquote') out.push({ text, italic: true });
    else if (tag === 'ul' || tag === 'ol') {
      Array.from(node.children).forEach((li, i) => {
        const bullet = tag === 'ol' ? `${i + 1}. ` : '• ';
        out.push({ text: bullet + (li.textContent || '').trim() });
      });
    }
    else if (tag === 'pre') out.push({ text });
    else out.push({ text });
  }
  return out;
}
