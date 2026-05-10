'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ content, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Heading.configure({ levels: [1, 2, 3] }),
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder: 'Write your knowledge base content here...' }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    label,
    active,
  }: {
    onClick: () => void;
    label: string;
    active?: boolean;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`px-2 py-1 text-sm rounded hover:bg-muted transition-colors ${
        active ? 'bg-muted font-semibold' : ''
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col border rounded-lg overflow-hidden flex-1">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} label="B" active={editor.isActive('bold')} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} label="I" active={editor.isActive('italic')} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} label="H1" active={editor.isActive('heading', { level: 1 })} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="H2" active={editor.isActive('heading', { level: 2 })} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="H3" active={editor.isActive('heading', { level: 3 })} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} label="• List" active={editor.isActive('bulletList')} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} label="1. List" active={editor.isActive('orderedList')} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} label="</>" active={editor.isActive('codeBlock')} />
        <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} label="Table" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} label="↩ Undo" />
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} label="↪ Redo" />
      </div>
      <EditorContent
        editor={editor}
        className="flex-1 p-4 overflow-y-auto prose prose-sm max-w-none min-h-[400px]"
      />
    </div>
  );
}
