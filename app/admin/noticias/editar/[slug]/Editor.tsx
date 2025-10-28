"use client";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo,
  Redo,
  Quote,
  Link2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useEffect } from "react";
import "./editor.css";
import ButtonEditor from "../ButtonEditor";

export interface ToolbarButton {
  name: string;
  command: () => void;
  isActive: boolean;
  Icon: React.ElementType;
}

interface EditorProps {
  content?: string;
  onChange?: (html: string) => void;
}

export default function Editor({ content = "<p>Escribe algo asombroso...</p>", onChange }: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Image.configure({
        inline: false,
        HTMLAttributes: { class: "mx-auto my-2 rounded-lg max-w-full" },
      }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate({ editor }) {
      if (onChange) onChange(editor.getHTML());
    },
  });

  // Actualizar contenido si cambia la prop externa
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor?.isActive("bold") ?? false,
      isItalic: ctx.editor?.isActive("italic") ?? false,
      isUnderline: ctx.editor?.isActive("underline") ?? false,
      isStrike: ctx.editor?.isActive("strike") ?? false,
      isH1: ctx.editor?.isActive("heading", { level: 1 }) ?? false,
      isH2: ctx.editor?.isActive("heading", { level: 2 }) ?? false,
      isH3: ctx.editor?.isActive("heading", { level: 3 }) ?? false,
      isAlignLeft: ctx.editor?.isActive({ textAlign: "left" }) ?? false,
      isAlignCenter: ctx.editor?.isActive({ textAlign: "center" }) ?? false,
      isAlignRight: ctx.editor?.isActive({ textAlign: "right" }) ?? false,
      isAlignJustify: ctx.editor?.isActive({ textAlign: "justify" }) ?? false,
      isBulletList: ctx.editor?.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor?.isActive("orderedList") ?? false,
      isQuote: ctx.editor?.isActive("blockquote") ?? false,
      hasLink: ctx.editor?.isActive("link") ?? false,
    }),
  });

  if (!editor) return null;

  const toolbarButtons: ToolbarButton[] = [
    { name: "Bold", command: () => editor.chain().focus().toggleBold().run(), isActive: editorState!.isBold, Icon: Bold },
    { name: "Italic", command: () => editor.chain().focus().toggleItalic().run(), isActive: editorState!.isItalic, Icon: Italic },
    { name: "Underline", command: () => editor.chain().focus().toggleUnderline().run(), isActive: editorState!.isUnderline, Icon: UnderlineIcon },
    { name: "Strike", command: () => editor.chain().focus().toggleStrike().run(), isActive: editorState!.isStrike, Icon: Strikethrough },
    { name: "H1", command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editorState!.isH1, Icon: Heading1 },
    { name: "H2", command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editorState!.isH2, Icon: Heading2 },
    { name: "H3", command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editorState!.isH3, Icon: Heading3 },
    { name: "BulletList", command: () => editor.chain().focus().toggleBulletList().run(), isActive: editorState!.isBulletList, Icon: List },
    { name: "OrderedList", command: () => editor.chain().focus().toggleOrderedList().run(), isActive: editorState!.isOrderedList, Icon: ListOrdered },
    { name: "Quote", command: () => editor.chain().focus().toggleBlockquote().run(), isActive: editorState!.isQuote, Icon: Quote },
    { name: "AlignLeft", command: () => editor.chain().focus().setTextAlign("left").run(), isActive: editorState!.isAlignLeft, Icon: AlignLeft },
    { name: "AlignCenter", command: () => editor.chain().focus().setTextAlign("center").run(), isActive: editorState!.isAlignCenter, Icon: AlignCenter },
    { name: "AlignRight", command: () => editor.chain().focus().setTextAlign("right").run(), isActive: editorState!.isAlignRight, Icon: AlignRight },
    { name: "AlignJustify", command: () => editor.chain().focus().setTextAlign("justify").run(), isActive: editorState!.isAlignJustify, Icon: AlignJustify },
    {
      name: "AddLink",
      command: () => {
        const url = prompt("Introduce una URL:");
        if (url) editor.chain().focus().setLink({ href: url }).run();
      },
      isActive: editorState!.hasLink,
      Icon: Link2,
    },
    { name: "RemoveLink", command: () => editor.chain().focus().unsetLink().run(), isActive: false, Icon: X },
    {
      name: "AddImage",
      command: () => {
        const url = prompt("Introduce la URL de la imagen:");
        if (url) editor.chain().focus().setImage({ src: url }).run();
      },
      isActive: false,
      Icon: ImageIcon,
    },
    { name: "Undo", command: () => editor.chain().focus().undo().run(), isActive: false, Icon: Undo },
    { name: "Redo", command: () => editor.chain().focus().redo().run(), isActive: false, Icon: Redo },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 mb-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm sticky top-0 z-10">
        {toolbarButtons.map((button) => (
          <ButtonEditor key={button.name} name={button.name} command={button.command} isActive={button.isActive} Icon={button.Icon} />
        ))}
      </div>

      {/* Editor con scroll interno */}
      <div className="border rounded-lg shadow-sm bg-white dark:bg-gray-900 min-h-[400px] max-h-[600px] overflow-y-auto">
        <EditorContent
          editor={editor}
          className="prose dark:prose-invert max-w-none focus:outline-none w-full h-full p-4"
        />
      </div>
    </div>
  );
}
