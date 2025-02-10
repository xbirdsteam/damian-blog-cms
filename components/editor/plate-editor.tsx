"use client";

import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import type { PlateEditor } from "@udecode/plate-common/react";
import { Plate } from "@udecode/plate-common/react";

import { useCreateEditor } from "@/components/editor/use-create-editor";
import { SettingsDialog } from "@/components/editor/settings";
import { Editor, EditorContainer } from "@/components/plate-ui/editor";

interface IProps {
  initialContent: string;
  editorRef: React.MutableRefObject<PlateEditor | null>;
}

export function PlateEditor({ initialContent, editorRef }: IProps) {
  const editor = useCreateEditor(initialContent);

  // Assign the editor instance to the ref
  editorRef.current = editor;
  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor}>
        <EditorContainer>
          <Editor variant="demo" />
        </EditorContainer>

        <SettingsDialog />
      </Plate>
    </DndProvider>
  );
}
