"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Clock,
  Edit2,
  NotebookPen,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import { useLms } from "@/lib/store";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtTimecode(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface NotesPanelProps {
  courseId: string;
  lessonId: string;
  /** Current playback time in seconds (so new notes can capture a timestamp). */
  currentTimestamp: number;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function NotesPanel({
  courseId,
  lessonId,
  currentTimestamp,
  className,
}: NotesPanelProps) {
  const notes = useLms((s) => s.notes);
  const addNote = useLms((s) => s.addNote);
  const updateNote = useLms((s) => s.updateNote);
  const deleteNote = useLms((s) => s.deleteNote);

  const [draft, setDraft] = useState("");
  const [capturedTs, setCapturedTs] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [prevLessonId, setPrevLessonId] = useState(lessonId);
  const draftRef = useRef<HTMLTextAreaElement>(null);

  // Reset draft + capturedTs when lesson changes (during-render adjustment,
  // avoids setState-in-effect cascading renders).
  if (prevLessonId !== lessonId) {
    setPrevLessonId(lessonId);
    setDraft("");
    setCapturedTs(null);
    setEditingId(null);
    setEditText("");
  }

  const lessonNotes = notes
    .filter((n) => n.lessonId === lessonId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleCaptureTimestamp = () => {
    setCapturedTs(Math.floor(currentTimestamp));
  };

  const handleAdd = () => {
    const text = draft.trim();
    if (!text) return;
    addNote(
      lessonId,
      courseId,
      text,
      capturedTs ?? Math.floor(currentTimestamp)
    );
    setDraft("");
    setCapturedTs(null);
    draftRef.current?.focus();
  };

  const handleEditStart = (id: string, content: string) => {
    setEditingId(id);
    setEditText(content);
  };

  const handleEditSave = (id: string) => {
    const text = editText.trim();
    if (!text) return;
    updateNote(id, text);
    setEditingId(null);
    setEditText("");
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className={cn("flex h-full flex-col gap-3", className)}>
      {/* Composer */}
      <div className="rounded-xl border border-border bg-card p-3 shadow-premium">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <NotebookPen className="size-4 text-primary" />
            Take a note
          </div>
          {capturedTs != null ? (
            <Badge
              variant="secondary"
              className="gap-1 bg-primary/10 px-2 py-1 text-primary"
            >
              <Clock className="size-3" />
              {fmtTimecode(capturedTs)}
              <button
                type="button"
                onClick={() => setCapturedTs(null)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-primary/15"
                aria-label="Remove timestamp"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ) : (
            <button
              type="button"
              onClick={handleCaptureTimestamp}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Clock className="size-3" />
              {fmtTimecode(currentTimestamp)}
            </button>
          )}
        </div>

        <Textarea
          ref={draftRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write your note for this lesson…"
          className="min-h-[80px] resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />

        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
              ⌘
            </kbd>{" "}
            +{" "}
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">
              Enter
            </kbd>{" "}
            to save
          </p>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!draft.trim()}
            className="gap-1"
          >
            <Plus className="size-4" />
            Save note
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pr-1">
        {lessonNotes.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {lessonNotes.map((note) => {
                const isEditing = editingId === note.id;
                return (
                  <motion.li
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="group relative rounded-xl border border-border bg-card p-3 shadow-premium transition-colors hover:border-primary/30"
                  >
                    {isEditing ? (
                      <>
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="min-h-[80px] resize-none"
                          autoFocus
                        />
                        <div className="mt-2 flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(null);
                              setEditText("");
                            }}
                          >
                            <X className="size-4" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleEditSave(note.id)}
                          >
                            <Check className="size-4" />
                            Save
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-1.5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCaptureTimestamp}
                            className="flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
                            title={`Note captured at ${fmtTimecode(
                              note.timestamp
                            )}`}
                          >
                            <Clock className="size-3" />
                            {fmtTimecode(note.timestamp)}
                          </button>
                          <span className="text-[11px] text-muted-foreground">
                            {timeAgo(note.createdAt)}
                          </span>
                          {note.updatedAt !== note.createdAt && (
                            <span className="text-[10px] italic text-muted-foreground">
                              · edited
                            </span>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                          {note.content}
                        </p>

                        <div className="mt-2 flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              handleEditStart(note.id, note.content)
                            }
                          >
                            <Edit2 className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </Button>
                        </div>
                      </>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <NotebookPen className="size-6" />
      </div>
      <div>
        <p className="text-sm font-semibold">No notes yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Start taking notes — capture insights, code snippets, or questions as
          you learn.
        </p>
      </div>
    </div>
  );
}
