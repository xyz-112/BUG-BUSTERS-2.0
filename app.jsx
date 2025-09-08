import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Trash2, Pencil, Check, X, GripVertical, Calendar, UserPlus, Search, Filter, Download, Upload, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Trello-like Project Board (Enhanced)
 * Features added:
 * - Drag & Drop (columns + cards)
 * - Team collaboration: assignees, comments per card, simple activity log
 * - Progress tracking: checklists on cards, card-level and column-level progress bars
 * - Export / Import JSON (share board with teammates)
 * - Local persistence (localStorage)
 *
 * Drop into a React + Tailwind app as a single-file component.
 * Install: `npm i @hello-pangea/dnd framer-motion lucide-react`
 */

const uid = (prefix = "id") => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
const STORAGE_KEY = "trello_like_board_v2";

const defaultUsers = () => ({
  u_me: { id: "u_me", name: "You", avatarColor: "#f97316" },
  u_alex: { id: "u_alex", name: "Alex", avatarColor: "#06b6d4" },
  u_sam: { id: "u_sam", name: "Sam", avatarColor: "#8b5cf6" },
});

const defaultData = () => {
  const c1 = uid("card");
  const c2 = uid("card");
  const c3 = uid("card");
  return {
    users: defaultUsers(),
    cards: {
      [c1]: {
        id: c1,
        title: "Set up project repo",
        description: "Initialize git, create README, add gitignore",
        labels: ["setup"],
        due: null,
        assignees: ["u_me"],
        checklist: [
          { id: uid("chk"), text: "Create repo", done: true },
          { id: uid("chk"), text: "Add README", done: false },
        ],
        comments: [
          { id: uid("cmt"), user: "u_alex", text: "I'll add the CI config.", ts: Date.now() - 1000 * 60 * 60 },
        ],
      },
      [c2]: {
        id: c2,
        title: "Design wireframes",
        description: "Low fidelity mockups for the main screens",
        labels: ["design"],
        assignees: ["u_alex"],
        checklist: [],
        comments: [],
      },
      [c3]: {
        id: c3,
        title: "Implement auth flow",
        description: "Login, signup, password reset",
        labels: ["backend", "priority"],
        assignees: ["u_sam", "u_me"],
        checklist: [
          { id: uid("chk"), text: "Create endpoints", done: false },
          { id: uid("chk"), text: "Add middleware", done: false },
        ],
        comments: [],
      },
    },
    columns: {
      col_todo: { id: "col_todo", title: "To Do", cardIds: [c1, c2] },
      col_inprog: { id: "col_inprog", title: "In Progress", cardIds: [c3] },
      col_done: { id: "col_done", title: "Done", cardIds: [] },
    },
    columnOrder: ["col_todo", "col_inprog", "col_done"],
    activity: [], // simple activity log
  };
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load board from storage, using default.");
    return defaultData();
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save board to storage.");
  }
}

function formatAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function ProgressBar({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="w-full rounded-full bg-gray-200 h-2 overflow-hidden">
      <div style={{ width: `${p}%` }} className="h-2 bg-gradient-to-r from-green-400 to-blue-500" />
    </div>
  );
}

function Avatar({ user }: { user: any }) {
  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: user.avatarColor }} title={user.name}>
      {initials}
    </div>
  );
}

function CardEditor({ card, onSave, onCancel, users, onAddComment, onToggleChecklist }: any) {
  const [draft, setDraft] = useState({ ...card });
  const [commentText, setCommentText] = useState("");

  useEffect(() => setDraft({ ...card }), [card]);

  const progress = useMemo(() => {
    const total = (draft.checklist || []).length;
    if (total === 0) return 0;
    const done = (draft.checklist || []).filter((c) => c.done).length;
    return (done / total) * 100;
  }, [draft.checklist]);

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2" />
        <div className="flex gap-2">
          <button className="rounded-xl px-3 py-1 bg-gray-100" onClick={() => { onSave(draft); }}>
            <Check className="inline w-4 h-4 mr-1" /> Save
          </button>
          <button className="rounded-xl px-3 py-1" onClick={onCancel}><X className="inline w-4 h-4 mr-1" /> Close</button>
        </div>
      </div>

      <textarea value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2" rows={3} />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-xs text-gray-500">Assignees</div>
          <div className="flex gap-2">
            {(draft.assignees || []).map((a: string) => (
              <div key={a} className="flex items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-xs">
                <Avatar user={users[a]} />
                <div>{users[a].name}</div>
                <button onClick={() => setDraft({ ...draft, assignees: (draft.assignees || []).filter((x: string) => x !== a) })} className="ml-2 text-gray-500">×</button>
              </div>
            ))}
            <select className="rounded-xl border border-gray-200 px-2" onChange={(e) => { const v = e.target.value; if (!v) return; setDraft({ ...draft, assignees: Array.from(new Set([...(draft.assignees || []), v])) }); }}>
              <option value="">Assign…</option>
              {Object.values(users).map((u: any) => <option value={u.id} key={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs text-gray-500">Due date</div>
          <input type="date" value={draft.due || ""} onChange={(e) => setDraft({ ...draft, due: e.target.value })} className="rounded-xl border border-gray-200 px-2 py-2" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Checklist</div>
          <div className="text-xs text-gray-500">{Math.round(progress)}%</div>
        </div>
        <ProgressBar percent={progress} />
        <div className="space-y-2 pt-2">
          {(draft.checklist || []).map((chk: any) => (
            <div key={chk.id} className="flex items-center gap-2">
              <input type="checkbox" checked={chk.done} onChange={() => { const newList = (draft.checklist || []).map((c: any) => c.id === chk.id ? { ...c, done: !c.done } : c); setDraft({ ...draft, checklist: newList }); onToggleChecklist && onToggleChecklist(draft.id, chk.id); }} />
              <input value={chk.text} onChange={(e) => { const newList = (draft.checklist || []).map((c: any) => c.id === chk.id ? { ...c, text: e.target.value } : c); setDraft({ ...draft, checklist: newList }); }} className="w-full rounded-xl border border-gray-100 px-2 py-1" />
              <button onClick={() => setDraft({ ...draft, checklist: (draft.checklist || []).filter((c: any) => c.id !== chk.id) })} className="text-gray-500">Delete</button>
            </div>
          ))}
          <div className="flex gap-2">
            <input placeholder="New checklist item…" id="newChk" className="w-full rounded-xl border border-gray-100 px-2 py-1" />
            <button onClick={() => { const el: any = document.getElementById("newChk"); if (!el || !el.value.trim()) return; const item = { id: uid("chk"), text: el.value.trim(), done: false }; setDraft({ ...draft, checklist: [...(draft.checklist || []), item] }); el.value = ""; }} className="rounded-xl bg-gray-100 px-3">Add</button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-gray-500" />
          <div className="text-sm font-medium">Comments</div>
        </div>
        <div className="space-y-2 max-h-36 overflow-y-auto">
          {(draft.comments || []).map((c: any) => (
            <div key={c.id} className="rounded-xl border border-gray-100 p-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div><strong>{users[c.user].name}</strong> • {formatAgo(c.ts)}</div>
                <div></div>
              </div>
              <div className="mt-1 text-sm">{c.text}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment…" className="w-full rounded-xl border border-gray-200 px-2 py-1" />
          <button onClick={() => { if (!commentText.trim()) return; const newC = { id: uid("cmt"), user: "u_me", text: commentText.trim(), ts: Date.now() }; setDraft({ ...draft, comments: [...(draft.comments || []), newC] }); onAddComment && onAddComment(draft.id, newC); setCommentText(""); }} className="rounded-xl bg-gray-100 px-3">Comment</button>
        </div>
      </div>
    </div>
  );
}

function CardView({ card, onEdit, onDelete, users }: any) {
  const checklistTotal = (card.checklist || []).length;
  const checklistDone = (card.checklist || []).filter((c: any) => c.done).length;
  const percent = checklistTotal === 0 ? 0 : (checklistDone / checklistTotal) * 100;

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium leading-5">{card.title}</div>
          <div className="mt-1 text-xs text-gray-500">{card.description?.slice(0, 80)}</div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} title="Edit" className="mr-1">✏️</button>
          <button onClick={onDelete} title="Delete">🗑️</button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {(card.labels || []).map((l: string) => <div key={l} className="rounded-full border px-2 py-0.5 text-xxs">{l}</div>)}
          {card.due && <div className="rounded-full bg-gray-50 px-2 py-0.5 text-xxs">Due {card.due}</div>}
        </div>
        <div className="flex items-center gap-2">
          {(card.assignees || []).slice(0, 3).map((a: string) => <Avatar key={a} user={users[a]} />)}
        </div>
      </div>

      <div className="mt-3">
        <ProgressBar percent={percent} />
      </div>
    </div>
  );
}

function ColumnView({ column, cards, onAddCard, onEditCard, onDeleteCard, onRename, onDelete, users, filterText }: any) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);
  useEffect(() => setTitleDraft(column.title), [column.title]);

  const filteredCards = useMemo(() => {
    if (!filterText) return cards;
    const q = filterText.toLowerCase();
    return cards.filter((c: any) => [c.title, c.description, ...(c.labels || [])].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [cards, filterText]);

  const columnProgress = useMemo(() => {
    if (cards.length === 0) return 0;
    const pct = cards.reduce((acc: number, c: any) => acc + (c.checklist && c.checklist.length ? (c.checklist.filter((x: any) => x.done).length / c.checklist.length) * 100 : 0), 0);
    return pct / cards.length;
  }, [cards]);

  return (
    <div className="flex h-full w-[320px] flex-shrink-0 flex-col rounded-3xl bg-gray-50 p-3 ring-1 ring-gray-200">
      <div className="mb-2 flex items-center justify-between gap-2">
        {editingTitle ? (
          <div className="flex w-full items-center gap-2">
            <input value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} className="h-9 w-full rounded-xl border border-gray-200 px-3" />
            <button onClick={() => { onRename(column.id, titleDraft.trim() || column.title); setEditingTitle(false); }} className="rounded-xl px-2">Save</button>
            <button onClick={() => setEditingTitle(false)} className="rounded-xl px-2">Cancel</button>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <span className="rounded-full bg-gray-200 px-2 text-xxs">{cards.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setEditingTitle(true)} title="Rename">✏️</button>
              <button onClick={() => onDelete(column.id)} title="Delete">🗑️</button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-gray-500">Progress</div>
          <div className="text-xs text-gray-500">{Math.round(columnProgress)}%</div>
        </div>
        <ProgressBar percent={columnProgress} />
      </div>

      <Droppable droppableId={column.id} type="CARD">
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 space-y-2 overflow-y-auto rounded-2xl p-1 ${snapshot.isDraggingOver ? "bg-gray-100" : ""}`}>
            <AnimatePresence>
              {filteredCards.map((card: any, index: number) => (
                <Draggable draggableId={card.id} index={index} key={card.id}>
                  {(dragProvided) => (
                    <motion.div initial={{ opacity: 0.6, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.12 }} ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                      <CardView card={card} users={users} onEdit={() => onEditCard(card.id)} onDelete={() => onDeleteCard(card.id)} />
                    </motion.div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </AnimatePresence>
          </div>
        )}
      </Droppable>

      <button className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm ring-1 ring-gray-200 hover:bg-gray-100" onClick={() => onAddCard(column.id)}>
        <Plus className="w-4 h-4" /> Add card
      </button>
    </div>
  );
}

export default function TrelloLikeBoard() {
  const [data, setData] = useState(() => loadData());
  const [editingCardId, setEditingCardId] = useState(null);
  const [filterText, setFilterText] = useState("");

  useEffect(() => saveData(data), [data]);

  const cardsForColumn = (col) => col.cardIds.map((id) => data.cards[id]).filter(Boolean);

  function logActivity(text) {
    const item = { id: uid("act"), text, ts: Date.now() };
    setData((d) => ({ ...d, activity: [item, ...(d.activity || [])].slice(0, 200) }));
  }

  function onDragEnd(result) {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (type === "COLUMN") {
      const newOrder = Array.from(data.columnOrder);
      newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, data.columnOrder[source.index]);
      setData({ ...data, columnOrder: newOrder });
      logActivity(`Moved list ` + `${data.columns[data.columnOrder[source.index]].title} to position ${destination.index + 1}`);
      return;
    }

    const startCol = data.columns[source.droppableId];
    const endCol = data.columns[destination.droppableId];

    if (startCol === endCol) {
      const newCardIds = Array.from(startCol.cardIds);
      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);
      const newCol = { ...startCol, cardIds: newCardIds };
      setData({ ...data, columns: { ...data.columns, [newCol.id]: newCol } });
      logActivity(`Reordered cards in ${startCol.title}`);
    } else {
      const startIds = Array.from(startCol.cardIds);
      startIds.splice(source.index, 1);
      const endIds = Array.from(endCol.cardIds);
      endIds.splice(destination.index, 0, draggableId);

      setData({ ...data, columns: { ...data.columns, [startCol.id]: { ...startCol, cardIds: startIds }, [endCol.id]: { ...endCol, cardIds: endIds } } });
      logActivity(`Moved card ${data.cards[draggableId].title} from ${startCol.title} to ${endCol.title}`);
    }
  }

  function addColumn() {
    const id = uid("col");
    const newCol = { id, title: "New List", cardIds: [] };
    setData((d) => ({ ...d, columns: { ...d.columns, [id]: newCol }, columnOrder: [...d.columnOrder, id] }));
    logActivity("Added list: New List");
  }

  function renameColumn(id, title) { setData((d) => ({ ...d, columns: { ...d.columns, [id]: { ...d.columns[id], title } } })); logActivity(`Renamed list to ${title}`); }
  function deleteColumn(id) { const { [id]: removed, ...rest } = data.columns; setData({ ...data, columns: rest, columnOrder: data.columnOrder.filter((c) => c !== id) }); logActivity(`Deleted list`); }

  function addCard(colId) { const id = uid("card"); const blank = { id, title: "New card", description: "", labels: [], assignees: [], checklist: [], comments: [] }; setData((d) => ({ ...d, cards: { ...d.cards, [id]: blank }, columns: { ...d.columns, [colId]: { ...d.columns[colId], cardIds: [...d.columns[colId].cardIds, id] } } })); setEditingCardId(id); logActivity(`Added card to ${data.columns[colId].title}`); }

  function saveCard(updated) { setData((d) => ({ ...d, cards: { ...d.cards, [updated.id]: updated } })); logActivity(`Updated card: ${updated.title}`); setEditingCardId(null); }

  function deleteCard(cardId) { const newColumns = Object.fromEntries(Object.entries(data.columns).map(([cid, col]) => [cid, { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) }])); const { [cardId]: removed, ...rest } = data.cards; setData({ ...data, columns: newColumns, cards: rest }); logActivity("Deleted card"); }

  function addComment(cardId, comment) { setData((d) => ({ ...d, cards: { ...d.cards, [cardId]: { ...d.cards[cardId], comments: [...(d.cards[cardId].comments || []), comment] } } })); logActivity(`Commented on card ${data.cards[cardId].title}`); }

  function toggleChecklist(cardId, chkId) { setData((d) => { const card = d.cards[cardId]; const checklist = (card.checklist || []).map((c) => c.id === chkId ? { ...c, done: !c.done } : c); return { ...d, cards: { ...d.cards, [cardId]: { ...card, checklist } } }; }); }

  function exportJSON() { const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `board_export_${new Date().toISOString()}.json`; a.click(); URL.revokeObjectURL(url); }

  function importJSON(file) { const reader = new FileReader(); reader.onload = (e) => { try { const parsed = JSON.parse(e.target.result); if (!parsed || !parsed.columns) throw new Error("Invalid board file"); setData(parsed); logActivity("Imported board JSON"); } catch (err) { alert("Failed to import: " + err.message); } }; reader.readAsText(file); }

  const allCards = Object.values(data.cards);
  const totalCards = allCards.length;
  const doneCards = data.columns["col_done"]?.cardIds.length || 0;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Project Board — Mini Task</h1>
            <p className="text-sm text-gray-500">Drag & drop • Team collaboration • Progress tracking</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2">
              <Search className="w-4 h-4" />
              <input value={filterText} onChange={(e) => setFilterText(e.target.value)} placeholder="Search cards, labels, assignees…" className="w-64 outline-none text-sm" />
            </div>

            <button onClick={addColumn} className="rounded-2xl bg-gray-900 text-white px-3 py-2">+ New List</button>

            <button onClick={exportJSON} className="rounded-2xl bg-white px-3 py-2 border"><Download className="inline w-4 h-4 mr-2" />Export</button>
            <label className="rounded-2xl bg-white px-3 py-2 border cursor-pointer">
              <Upload className="inline w-4 h-4 mr-2" />Import
              <input type="file" accept="application/json" onChange={(e) => importJSON(e.target.files[0])} className="hidden" />
            </label>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-gray-200 bg-white p-4">
            <div className="text-xs text-gray-500">Cards</div>
            <div className="text-2xl font-semibold">{totalCards}</div>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-4">
            <div className="text-xs text-gray-500">Done (in "Done" list)</div>
            <div className="text-2xl font-semibold">{doneCards}</div>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-4">
            <div className="text-xs text-gray-500">Lists</div>
            <div className="text-2xl font-semibold">{data.columnOrder.length}</div>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="COLUMN">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="flex gap-3 overflow-x-auto pb-8">
                {data.columnOrder.map((colId, index) => {
                  const col = data.columns[colId];
                  if (!col) return null;
                  return (
                    <Draggable draggableId={col.id} index={index} key={col.id}>
                      {(dragProvided) => (
                        <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                          <ColumnView column={col} cards={cardsForColumn(col)} onAddCard={addCard} onEditCard={(cardId) => setEditingCardId(cardId)} onDeleteCard={deleteCard} onRename={renameColumn} onDelete={deleteColumn} users={data.users} filterText={filterText} />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <AnimatePresence>
          {editingCardId && (
            <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/20 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} transition={{ type: "spring", stiffness: 220, damping: 20 }} className="w-full max-w-2xl">
                <CardEditor card={data.cards[editingCardId]} onSave={saveCard} onCancel={() => setEditingCardId(null)} users={data.users} onAddComment={addComment} onToggleChecklist={toggleChecklist} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="text-sm font-semibold">Activity</div>
            <div className="mt-2 max-h-48 overflow-y-auto text-xs text-gray-600">
              {(data.activity || []).map((a) => (
                <div key={a.id} className="mb-2 border-b pb-2">
                  <div className="text-xxs text-gray-400">{formatAgo(a.ts)}</div>
                  <div>{a.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="text-sm font-semibold">Team</div>
            <div className="mt-2 flex gap-2">
              {Object.values(data.users).map((u) => (
                <div key={u.id} className="flex items-center gap-2 rounded-xl border px-3 py-2">
                  <Avatar user={u} />
                  <div>
                    <div className="text-sm">{u.name}</div>
                    <div className="text-xxs text-gray-400">role: member</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="text-sm font-semibold">Quick actions</div>
            <div className="mt-2 flex flex-col gap-2">
              <button onClick={() => { setData(defaultData()); logActivity("Reset board to default demo state"); }} className="rounded-xl bg-gray-100 px-3 py-2">Reset demo board</button>
              <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(data)); alert("Board JSON copied to clipboard"); }} className="rounded-xl bg-gray-100 px-3 py-2">Copy board JSON</button>
            </div>
          </div>
        </div>

      </div>

      <div className="mx-auto mt-8 max-w-7xl text-center text-xs text-gray-500">Data persists locally in your browser. Use Export/Import to share with teammates.</div>
    </div>
  );
}

