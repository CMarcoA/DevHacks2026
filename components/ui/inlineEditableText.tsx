"use client";

import { useEffect, useState } from "react";
import "./inlineEditableText.css";

type InlineEditableTextProps = {
  value: string;
  onSave: (value: string) => void;
};

export function InlineEditableText({ value, onSave }: InlineEditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const save = () => {
    const trimmed = draft.trim();
    onSave(trimmed.length > 0 ? trimmed : value);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === "Enter") save();
          if (event.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="inline-editable-input"
      />
    );
  }

  return (
    <button type="button" onClick={() => setEditing(true)} className="inline-editable-button">
      {value}
    </button>
  );
}
