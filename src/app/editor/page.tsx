"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import "./editor.css";

export default function Page() {
  return (
    <div className="editor-page">
      <div className="editor-page__header">
        <h1 className="editor-page__title">Editor Playground</h1>
        <p className="editor-page__lead">
          Compose rich stories, capture notes, and experiment with formatting
          using the controls below.
        </p>
      </div>
      <Tiptap />
    </div>
  );
}

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content:
      "<p>Capture a wild idea, draft a post, or remix something you have been tinkering with.</p>",
    editorProps: {
      attributes: {
        class: "tiptap-editor__content",
      },
    },
    immediatelyRender: false,
  });

  console.log("JSON", editor?.getJSON());

  const [isEmpty, setIsEmpty] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const updateEmptyState = () => setIsEmpty(editor.isEmpty);
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    updateEmptyState();

    editor.on("update", updateEmptyState);
    editor.on("selectionUpdate", updateEmptyState);
    editor.on("create", updateEmptyState);
    editor.on("focus", handleFocus);
    editor.on("blur", handleBlur);

    return () => {
      editor.off("update", updateEmptyState);
      editor.off("selectionUpdate", updateEmptyState);
      editor.off("create", updateEmptyState);
      editor.off("focus", handleFocus);
      editor.off("blur", handleBlur);
    };
  }, [editor]);

  return (
    <div className="tiptap-shell">
      <FormatToolbar editor={editor} />
      <div
        className={`tiptap-editor__surface${isFocused ? " is-focused" : ""}`}
      >
        {editor && isEmpty ? (
          <span className="tiptap-editor__placeholder">
            Write something unforgettable...
          </span>
        ) : null}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

type ToolbarButtonProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  shortcut?: string;
};

const FormatToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const groups: ToolbarButtonProps[][] = [
    [
      {
        icon: <span className="tiptap-button__icon">B</span>,
        label: "Bold",
        shortcut: "Mod+B",
        isActive: editor.isActive("bold"),
        disabled: !editor.can().chain().focus().toggleBold().run(),
        onClick: () => editor.chain().focus().toggleBold().run(),
      },
      {
        icon: (
          <span className="tiptap-button__icon tiptap-button__icon--italic">
            I
          </span>
        ),
        label: "Italic",
        shortcut: "Mod+I",
        isActive: editor.isActive("italic"),
        disabled: !editor.can().chain().focus().toggleItalic().run(),
        onClick: () => editor.chain().focus().toggleItalic().run(),
      },
      {
        icon: (
          <span className="tiptap-button__icon tiptap-button__icon--strike">
            S
          </span>
        ),
        label: "Strikethrough",
        shortcut: "Mod+Shift+X",
        isActive: editor.isActive("strike"),
        disabled: !editor.can().chain().focus().toggleStrike().run(),
        onClick: () => editor.chain().focus().toggleStrike().run(),
      },
      {
        icon: <span className="tiptap-button__icon">{`</>`}</span>,
        label: "Code",
        shortcut: "Mod+E",
        isActive: editor.isActive("code"),
        disabled: !editor.can().chain().focus().toggleCode().run(),
        onClick: () => editor.chain().focus().toggleCode().run(),
      },
    ],
    [
      {
        icon: <span className="tiptap-button__icon">P</span>,
        label: "Paragraph",
        isActive: editor.isActive("paragraph"),
        disabled: !editor.can().chain().focus().setParagraph().run(),
        onClick: () => editor.chain().focus().setParagraph().run(),
      },
      ...([1, 2, 3] as const).map<ToolbarButtonProps>((level) => ({
        icon: <span className="tiptap-button__icon">{`H${level}`}</span>,
        label: `Heading ${level}`,
        isActive: editor.isActive("heading", { level }),
        disabled: !editor.can().chain().focus().toggleHeading({ level }).run(),
        onClick: () => editor.chain().focus().toggleHeading({ level }).run(),
      })),
    ],
    [
      {
        icon: <span className="tiptap-button__icon">UL</span>,
        label: "Bullet List",
        shortcut: "Mod+Shift+8",
        isActive: editor.isActive("bulletList"),
        disabled: !editor.can().chain().focus().toggleBulletList().run(),
        onClick: () => editor.chain().focus().toggleBulletList().run(),
      },
      {
        icon: <span className="tiptap-button__icon">OL</span>,
        label: "Ordered List",
        shortcut: "Mod+Shift+7",
        isActive: editor.isActive("orderedList"),
        disabled: !editor.can().chain().focus().toggleOrderedList().run(),
        onClick: () => editor.chain().focus().toggleOrderedList().run(),
      },
      {
        icon: <span className="tiptap-button__icon"></span>,
        label: "Quote",
        isActive: editor.isActive("blockquote"),
        disabled: !editor.can().chain().focus().toggleBlockquote().run(),
        onClick: () => editor.chain().focus().toggleBlockquote().run(),
      },
      {
        icon: <span className="tiptap-button__icon">{`{}`}</span>,
        label: "Code Block",
        shortcut: "Mod+Alt+C",
        isActive: editor.isActive("codeBlock"),
        disabled: !editor.can().chain().focus().toggleCodeBlock().run(),
        onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      },
      {
        icon: <span className="tiptap-button__icon">HR</span>,
        label: "Horizontal Rule",
        disabled: !editor.can().chain().focus().setHorizontalRule().run(),
        onClick: () => editor.chain().focus().setHorizontalRule().run(),
      },
    ],
    [
      {
        icon: <span className="tiptap-button__icon">Undo</span>,
        label: "Undo",
        shortcut: "Mod+Z",
        disabled: !editor.can().chain().focus().undo().run(),
        onClick: () => editor.chain().focus().undo().run(),
      },
      {
        icon: <span className="tiptap-button__icon">Redo</span>,
        label: "Redo",
        shortcut: "Mod+Shift+Z",
        disabled: !editor.can().chain().focus().redo().run(),
        onClick: () => editor.chain().focus().redo().run(),
      },
      {
        icon: <span className="tiptap-button__icon">Clear</span>,
        label: "Clear",
        disabled: editor.isEmpty,
        onClick: () => editor.chain().focus().clearContent(true).run(),
      },
    ],
  ];

  return (
    <div
      className="tiptap-toolbar"
      role="toolbar"
      aria-label="Formatting options"
    >
      {groups.map((group, groupIndex) => (
        <div className="tiptap-toolbar__group" key={`group-${groupIndex}`}>
          {group.map((item) => (
            <ToolbarButton key={item.label} {...item} />
          ))}
        </div>
      ))}
    </div>
  );
};

const ToolbarButton = ({
  icon,
  label,
  onClick,
  disabled = false,
  isActive = false,
  shortcut,
}: ToolbarButtonProps) => (
  <button
    type="button"
    className={`tiptap-button${isActive ? " is-active" : ""}`}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    aria-pressed={isActive}
    title={shortcut ? `${label} (${shortcut})` : label}
  >
    {icon}
  </button>
);
