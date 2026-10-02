"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { IssueList } from "@/types";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  List,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LIST_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#64748b",
];

interface ListRowProps {
  list: IssueList;
  onUpdate: (id: string, updates: Partial<IssueList>) => void;
  onDelete: (id: string) => void;
}

const ListRow: React.FC<ListRowProps> = ({ list, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(list.name);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (!editName.trim()) {
      setEditName(list.name);
      setIsEditing(false);
      return;
    }
    onUpdate(list.id, { name: editName.trim() });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setEditName(list.name);
      setIsEditing(false);
    }
  };

  return (
    <div className="group flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-zinc-900/40 transition-colors">
      {/* Color dot / picker trigger */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setShowColorPicker((v) => !v)}
          className="w-3 h-3 rounded-full ring-1 ring-white/20 hover:ring-white/50 transition-all cursor-pointer"
          style={{ backgroundColor: list.color || "#64748b" }}
          title="Cambia colore"
        />
        {showColorPicker && (
          <div
            className="absolute left-0 top-5 z-20 p-2 rounded-lg bg-[#18191d] border border-white/10 shadow-xl flex flex-wrap gap-1.5"
            style={{ width: 112 }}
          >
            {LIST_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onUpdate(list.id, { color: c });
                  setShowColorPicker(false);
                }}
                className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: c }}
              >
                {list.color === c && (
                  <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-white text-xs font-medium focus:outline-none border-b border-white/20 pb-0.5"
          />
        ) : (
          <span
            className="text-xs font-medium text-zinc-200 truncate block cursor-text"
            onDoubleClick={() => setIsEditing(true)}
          >
            {list.name}
          </span>
        )}
      </div>

      {/* Issue count */}
      <span className="text-[10px] font-mono text-zinc-600 shrink-0">
        {/* placeholder - will be wired to filtered issues count */}
        0 issue
      </span>

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={handleSave}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Salva"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditName(list.name);
                setIsEditing(false);
              }}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Annulla"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Rinomina"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-zinc-400">Eliminare?</span>
                <button
                  type="button"
                  onClick={() => onDelete(list.id)}
                  className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Conferma eliminazione"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Annulla"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Elimina lista"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const ListsManagerView: React.FC = () => {
  const {
    issueLists,
    currentWorkspaceId,
    createIssueList,
    updateIssueList,
    deleteIssueList,
    addToast,
  } = useLinearStore();

  const [newListName, setNewListName] = useState("");
  const [newListColor, setNewListColor] = useState(LIST_COLORS[0]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showNewColorPicker, setShowNewColorPicker] = useState(false);
  const newInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNewForm && newInputRef.current) {
      newInputRef.current.focus();
    }
  }, [showNewForm]);

  const workspaceLists = issueLists.filter(
    (l) => l.workspaceId === currentWorkspaceId
  );

  const handleCreate = () => {
    if (!newListName.trim()) return;
    createIssueList({
      name: newListName.trim(),
      color: newListColor,
      workspaceId: currentWorkspaceId,
    });
    addToast({ title: `Lista "${newListName.trim()}" creata`, type: "success" });
    setNewListName("");
    setNewListColor(LIST_COLORS[0]);
    setShowNewForm(false);
  };

  const handleDelete = (id: string) => {
    const list = issueLists.find((l) => l.id === id);
    deleteIssueList(id);
    addToast({
      title: `Lista "${list?.name}" eliminata`,
      type: "info",
    });
  };

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-6 md:px-8 py-10 flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
            <List className="w-5 h-5 text-zinc-400" />
            Liste
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Organizza le issue in liste personalizzate.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Nuova lista
        </button>
      </div>

      {/* New list form */}
      {showNewForm && (
        <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {/* Color picker for new list */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowNewColorPicker((v) => !v)}
                className="w-8 h-8 rounded-lg border border-white/15 flex items-center justify-center hover:border-white/30 transition-colors cursor-pointer"
                style={{ backgroundColor: newListColor + "20" }}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: newListColor }}
                />
                <ChevronDown className="w-2.5 h-2.5 text-zinc-400 ml-0.5" />
              </button>
              {showNewColorPicker && (
                <div
                  className="absolute left-0 top-10 z-20 p-2 rounded-lg bg-[#18191d] border border-white/10 shadow-xl flex flex-wrap gap-1.5"
                  style={{ width: 112 }}
                >
                  {LIST_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setNewListColor(c);
                        setShowNewColorPicker(false);
                      }}
                      className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: c }}
                    >
                      {newListColor === c && (
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              ref={newInputRef}
              type="text"
              placeholder="Nome della lista"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setShowNewForm(false);
              }}
              className="flex-1 h-9 px-3 rounded-lg bg-zinc-800 border border-white/10 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowNewForm(false);
                setNewListName("");
              }}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newListName.trim()}
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 text-black font-semibold text-xs transition-colors cursor-pointer"
            >
              Crea lista
            </button>
          </div>
        </div>
      )}

      {/* Lists table */}
      <div className="rounded-lg border border-white/10 bg-zinc-900/30 overflow-hidden">
        {workspaceLists.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-center">
            <List className="w-7 h-7 text-zinc-700" />
            <p className="text-sm font-medium text-zinc-400">
              Nessuna lista creata
            </p>
            <p className="text-xs text-zinc-600">
              Crea una lista per organizzare le tue issue.
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              <span className="w-3" />
              <span className="flex-1">Nome</span>
              <span className="text-right">Issue</span>
              <span className="w-16" />
            </div>
            {workspaceLists.map((list) => (
              <ListRow
                key={list.id}
                list={list}
                onUpdate={updateIssueList}
                onDelete={handleDelete}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
