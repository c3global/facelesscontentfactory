import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

// Thin wrapper around TipTap with a small inline toolbar.
// Receives `value` (HTML), emits `onChange(html)`. Resets when `editorKey` changes
// so navigating between pieces loads fresh content cleanly.

export default function TipTapEditor({ value, onChange, editorKey, placeholder, autoFocus = false }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder || 'Start writing…' }),
    ],
    content: value || '',
    autofocus: autoFocus ? 'end' : false,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  // re-create the editor instance when switching pieces; this is how TipTap
  // resets cleanly without manually diffing JSON.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorKey]);

  // If the parent updates `value` externally (e.g., regenerate), sync it.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editorKey]);

  return (
    <div className="tiptap-shell">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />

      <style>{`
        .tiptap-shell { display: flex; flex-direction: column; gap: 10px; }
        .tiptap-toolbar {
          display: flex; flex-wrap: wrap; gap: 4px;
          padding: 6px;
          background: var(--surface-alt);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          position: sticky; top: 12px; z-index: 2;
        }
        .tiptap-btn {
          padding: 6px 10px;
          font-family: var(--font-ui);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          background: transparent;
          color: var(--text-muted);
          border: 1px solid transparent;
          border-radius: var(--radius-sm);
          cursor: pointer;
          line-height: 1;
        }
        .tiptap-btn:hover { color: var(--text); background: var(--surface); }
        .tiptap-btn.is-active { color: var(--text); background: var(--surface); border-color: var(--border); }
        .tiptap-sep { width: 1px; background: var(--border); margin: 0 4px; }

        .ProseMirror {
          min-height: 320px;
          padding: 26px 28px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          color: var(--text);
          font-family: var(--font-body);
          font-size: 18px;
          line-height: 1.7;
          outline: none;
          transition: border-color 120ms;
        }
        .ProseMirror:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(102,241,217,0.15); }
        .ProseMirror p { margin: 0 0 16px; }
        .ProseMirror p:last-child { margin-bottom: 0; }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
          font-family: var(--font-display);
          font-weight: 600;
          letter-spacing: -0.015em;
          margin: 28px 0 12px;
          line-height: 1.2;
        }
        .ProseMirror h1 { font-size: 32px; }
        .ProseMirror h2 { font-size: 26px; }
        .ProseMirror h3 { font-size: 21px; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 24px; margin: 0 0 16px; }
        .ProseMirror li { margin-bottom: 6px; }
        .ProseMirror blockquote {
          margin: 0 0 14px;
          padding: 4px 0 4px 16px;
          border-left: 3px solid var(--accent);
          color: var(--text-muted);
          font-style: italic;
        }
        .ProseMirror code {
          background: var(--surface-alt);
          padding: 1px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.92em;
        }
        .ProseMirror pre {
          background: var(--surface-alt);
          padding: 14px 16px;
          border-radius: var(--radius-md);
          overflow-x: auto;
          font-family: 'Courier New', monospace;
          font-size: 14px;
          margin: 0 0 14px;
        }
        .ProseMirror a { color: var(--accent); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 2px; }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: var(--text-faint);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

function Toolbar({ editor }) {
  if (!editor) return null;
  const Btn = ({ active, onClick, children, title }) => (
    <button
      type="button"
      className={`tiptap-btn${active ? ' is-active' : ''}`}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
    >
      {children}
    </button>
  );
  return (
    <div className="tiptap-toolbar">
      <Btn active={editor.isActive('bold')}    onClick={() => editor.chain().focus().toggleBold().run()}    title="Bold (⌘B)"><b>B</b></Btn>
      <Btn active={editor.isActive('italic')}  onClick={() => editor.chain().focus().toggleItalic().run()}  title="Italic (⌘I)"><i>I</i></Btn>
      <Btn active={editor.isActive('strike')}  onClick={() => editor.chain().focus().toggleStrike().run()}  title="Strikethrough"><s>S</s></Btn>
      <Btn active={editor.isActive('code')}    onClick={() => editor.chain().focus().toggleCode().run()}    title="Inline code">{'</>'}</Btn>
      <span className="tiptap-sep" />
      <Btn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">H1</Btn>
      <Btn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</Btn>
      <Btn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</Btn>
      <span className="tiptap-sep" />
      <Btn active={editor.isActive('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Bulleted list">• List</Btn>
      <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">1. List</Btn>
      <Btn active={editor.isActive('blockquote')}  onClick={() => editor.chain().focus().toggleBlockquote().run()}  title="Quote">❝</Btn>
      <span className="tiptap-sep" />
      <Btn
        active={editor.isActive('link')}
        onClick={() => {
          const previous = editor.getAttributes('link').href;
          const url = window.prompt('Link URL', previous || 'https://');
          if (url === null) return;
          if (url === '') editor.chain().focus().unsetLink().run();
          else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }}
        title="Link"
      >🔗</Btn>
      <span className="tiptap-sep" />
      <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo (⌘Z)">↶</Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo (⌘⇧Z)">↷</Btn>
    </div>
  );
}
