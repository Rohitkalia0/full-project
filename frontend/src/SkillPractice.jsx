import { useState, useEffect, useRef } from "react";
import {
  getSkillsAPI, createSkillAPI, updateSkillAPI,
  createSkillActivitiesAPI, updateSkillActivitiesAPI, deleteSkillActivityAPI
} from "./api";
import Sidebar from "./Sidebar";

const StarIcon = ({ filled }) => (<svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
const ShieldIcon = ({ filled }) => (<svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
const TrashIcon = ({ size = 14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>);
const PencilIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>);
const CheckIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const PlusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const BadgeCheckIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 3.2L18 4l.8 3.8L22 10l-2.4 3.2.4 3.8-3.8.8L14 20l-2-2.4L10 20l-2.2-2.2-3.8-.8.4-3.8L2 10l3.2-2.2L6 4l3.6 1.2z" /><polyline points="9 12 11 14 15 10" /></svg>);
const CloseIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const ClockIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const handleMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.top - 36, left: rect.left + rect.width / 2 });
    }
    setShow(true);
  };
  return (
    <div ref={ref} className="relative flex items-center" onMouseEnter={handleMouseEnter} onMouseLeave={() => setShow(false)}>
      {show && (
        <div className="bg-gray-800 text-white text-[10px] font-medium px-2 py-1 rounded-lg whitespace-nowrap shadow-lg pointer-events-none"
          style={{ position: "fixed", top: pos.top, left: pos.left, transform: "translateX(-50%)", zIndex: 9999 }}>
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}
      {children}
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const colors = { success: "bg-blue-50 border-blue-200 text-blue-700", error: "bg-red-50 border-red-200 text-red-700", warning: "bg-amber-50 border-amber-200 text-amber-700" };
  const icons = {
    success: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    error: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
    warning: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  };
  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${colors[type]}`}>
      {icons[type]}{message}
    </div>
  );
}

function DeleteModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-7 w-80 border border-gray-100">
        <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><TrashIcon size={16} /></div>
        <h3 className="text-gray-800 font-semibold text-base text-center mb-1">Confirm Delete</h3>
        <p className="text-gray-400 text-sm text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition shadow-sm">Delete</button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="h-4 bg-gray-100 rounded-lg w-3/4 mb-3" />
      <div className="h-2 bg-gray-100 rounded-full mb-4" />
      <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
    </div>
  );
}

const sortActivities = (list) => [
  ...list.filter(a => !a.is_completed),
  ...list.filter(a => a.is_completed),
];

// ── Skill Detail Modal ──
function SkillModal({ skill, today, onClose, onSkillUpdated, showToast }) {
  const mapActivity = (a, fromYesterday) => ({
    id: a.id,
    name: a.name,
    is_completed: fromYesterday ? false : (a.is_completed ?? false),
    is_priority: fromYesterday ? false : (a.is_priority ?? false),
    is_habit_to_protect: fromYesterday ? false : (a.is_habit_to_protect ?? false),
    minutes_practised: a.minutes_practised || 0,
    isCarriedOver: fromYesterday && !a.is_completed,
  });

  const firstActivity = skill.activities?.[0];
  const entryDate = firstActivity?.entry_date;
  const isFromYesterday = entryDate ? String(entryDate) !== today : false;

  const [activities, setActivities] = useState(
    sortActivities((skill.activities || []).map(a => mapActivity(a, isFromYesterday)))
  );
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityError, setNewActivityError] = useState("");
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [skillName, setSkillName] = useState(skill.name || "");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingMinutesId, setEditingMinutesId] = useState(null);
  const [minutesText, setMinutesText] = useState("");

  const allDone = activities.length > 0 && activities.every(a => a.is_completed);
  const doneCount = activities.filter(a => a.is_completed).length;

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Notify parent of latest activities when closing
  const handleClose = () => {
    onSkillUpdated(skill.id, { activities: activities.map(a => ({
      id: a.id, name: a.name, is_completed: a.is_completed,
      is_priority: a.is_priority, is_habit_to_protect: a.is_habit_to_protect,
      minutes_practised: a.minutes_practised, entry_date: a.entry_date || today,
      isCarriedOver: a.isCarriedOver
    })) });
    onClose();
  };

  const toggleDone = async (id) => {
    const target = activities.find(a => a.id === id);
    const newVal = !target.is_completed;
    setActivities(prev => sortActivities(prev.map(a => a.id === id ? { ...a, is_completed: newVal } : a)));
    try {
      await updateSkillActivitiesAPI(skill.id, { activities: [{ id, is_completed: newVal }] });
      const updated = activities.map(a => a.id === id ? { ...a, is_completed: newVal } : a);
      if (updated.every(a => a.is_completed) && updated.length > 0) {
        await updateSkillAPI(skill.id, { name: skillName, is_completed: true });
        onSkillUpdated(skill.id, { is_completed: true });
      }
    } catch (err) {
      console.error("Toggle done failed:", err);
      setActivities(prev => sortActivities(prev.map(a => a.id === id ? { ...a, is_completed: !newVal } : a)));
    }
  };

  const togglePriority = async (id) => {
    const current = activities.find(a => a.id === id);
    const updated = activities.map(a => ({ ...a, is_priority: a.id === id ? !current.is_priority : false }));
    setActivities(sortActivities(updated));
    try { await updateSkillActivitiesAPI(skill.id, { activities: updated.map(a => ({ id: a.id, is_priority: a.is_priority })) }); }
    catch (err) { console.error("Toggle priority failed:", err); }
  };

  const toggleHabit = async (id) => {
    const current = activities.find(a => a.id === id);
    const updated = activities.map(a => ({ ...a, is_habit_to_protect: a.id === id ? !current.is_habit_to_protect : false }));
    setActivities(sortActivities(updated));
    try { await updateSkillActivitiesAPI(skill.id, { activities: updated.map(a => ({ id: a.id, is_habit_to_protect: a.is_habit_to_protect })) }); }
    catch (err) { console.error("Toggle habit failed:", err); }
  };

  const saveMinutes = async (id) => {
    const val = Math.max(0, Math.min(1440, parseInt(minutesText) || 0));
    setActivities(prev => sortActivities(prev.map(a => a.id === id ? { ...a, minutes_practised: val } : a)));
    setEditingMinutesId(null);
    try { await updateSkillActivitiesAPI(skill.id, { activities: [{ id, minutes_practised: val }] }); }
    catch (err) { console.error("Save minutes failed:", err); }
  };

  const addActivity = async () => {
    if (!newActivityName.trim()) { setNewActivityError("Activity name cannot be empty"); return; }
    if (newActivityName.trim().length < 2) { setNewActivityError("Activity name must be at least 2 characters"); return; }
    setNewActivityError("");
    try {
      const res = await createSkillActivitiesAPI(skill.id, {
        activities: [{ name: newActivityName.trim(), is_priority: false, is_habit_to_protect: false, is_completed: false, minutes_practised: 0 }]
      });
      const created = res?.data?.activities || res?.activities || [];
      const last = created[created.length - 1];
      if (last) {
        const newItem = {
          id: last.id, name: last.name, is_completed: false,
          is_priority: false, is_habit_to_protect: false, minutes_practised: 0,
          isCarriedOver: false, entry_date: today
        };
        setActivities(prev => sortActivities([newItem, ...prev]));
      }
      setNewActivityName("");
    } catch (err) {
      console.error("Add activity failed:", err);
      showToast("Failed to add activity", "error");
    }
  };

  const startEdit = (a) => { setEditingActivityId(a.id); setEditText(a.name); };
  const saveEdit = async (id) => {
    if (!editText.trim() || editText.trim().length < 2) return;
    const updated = activities.map(a => a.id === id ? { ...a, name: editText.trim() } : a);
    setActivities(sortActivities(updated)); setEditingActivityId(null);
    try { await updateSkillActivitiesAPI(skill.id, { activities: [{ id, name: editText.trim() }] }); }
    catch (err) { console.error("Edit failed:", err); }
  };

  const doDeleteActivity = async () => {
    try {
      await deleteSkillActivityAPI(skill.id, deleteTarget.id);
      setActivities(prev => sortActivities(prev.filter(a => a.id !== deleteTarget.id)));
    } catch (err) { console.error("Delete failed:", err); }
    setDeleteTarget(null);
  };

  const saveSkillName = async () => {
    setEditingTitle(false);
    if (!skillName.trim() || skillName.trim().length < 2) return;
    try {
      await updateSkillAPI(skill.id, { name: skillName.trim() });
      onSkillUpdated(skill.id, { name: skillName.trim() });
    } catch (err) { console.error("Rename failed:", err); }
  };

  return (
    <>
      {deleteTarget && (
        <DeleteModal message="This activity will be permanently removed." onConfirm={doDeleteActivity} onCancel={() => setDeleteTarget(null)} />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={handleClose}>
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ width: "min(600px, 95vw)", maxHeight: "88vh" }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className={`px-6 pt-5 pb-4 border-b flex items-start justify-between gap-3 ${allDone ? "bg-blue-50 border-blue-100" : isFromYesterday ? "bg-amber-50 border-amber-100" : "border-gray-100"}`}>
            <div className="flex-1 min-w-0">
              {editingTitle ? (
                <input autoFocus value={skillName} onChange={e => setSkillName(e.target.value)}
                  onBlur={saveSkillName} onKeyDown={e => e.key === "Enter" && saveSkillName()}
                  className="w-full text-lg font-bold bg-white border border-blue-300 rounded-xl px-3 py-1.5 outline-none text-gray-800" />
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className={`text-lg font-bold truncate ${allDone ? "text-blue-700" : "text-gray-800"}`}>{skillName}</h2>
                  <button onClick={() => setEditingTitle(true)} className="p-1 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition shrink-0"><PencilIcon /></button>
                </div>
              )}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-400">{doneCount}/{activities.length} done</span>
                {allDone && <span className="flex items-center gap-1 text-xs font-semibold text-blue-600"><BadgeCheckIcon /> Completed!</span>}
                {isFromYesterday && !allDone && <span className="text-[10px] font-medium text-amber-500">Carried over from yesterday</span>}
              </div>
            </div>
            <button onClick={handleClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition shrink-0"><CloseIcon /></button>
          </div>

          {/* Add activity */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <input value={newActivityName} onChange={e => { setNewActivityName(e.target.value); if (newActivityError) setNewActivityError(""); }}
                  onKeyDown={e => e.key === "Enter" && addActivity()}
                  placeholder="Add a new activity..."
                  maxLength={2000}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-300 outline-none transition ${newActivityError ? "border-red-300 bg-red-50 focus:border-red-400" : "bg-gray-50 border-gray-200 focus:border-blue-300 focus:bg-white"}`}
                />
                {newActivityError && <p className="text-red-500 text-xs pl-1">{newActivityError}</p>}
              </div>
              <button onClick={addActivity} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm flex items-center gap-1.5 shrink-0 self-start">
                <PlusIcon /> Add
              </button>
            </div>
          </div>

          {/* Activities list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2">
            {activities.length === 0 && <p className="text-gray-300 text-sm text-center py-8">No activities yet. Add one above.</p>}
            {activities.map(a => (
              <div key={a.id} className={`flex flex-col px-4 py-3 rounded-xl border transition-all ${a.is_completed ? "bg-gray-50 border-gray-100 opacity-70" : a.isCarriedOver ? "bg-amber-50 border-amber-100" : "bg-white border-gray-200"}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleDone(a.id)}
                    className={`min-w-[20px] min-h-[20px] w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${a.is_completed ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 hover:border-blue-400"}`}>
                    {a.is_completed && <CheckIcon />}
                  </button>
                  {editingActivityId === a.id ? (
                    <input autoFocus value={editText} onChange={e => setEditText(e.target.value)}
                      onBlur={() => saveEdit(a.id)} onKeyDown={e => e.key === "Enter" && saveEdit(a.id)}
                      maxLength={2000}
                      className="flex-1 text-sm bg-white border border-blue-300 rounded-lg px-2.5 py-1 outline-none text-gray-700" />
                  ) : (
                    <span className={`flex-1 text-sm ${a.is_completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                      {a.name}
                      {a.isCarriedOver && <span className="ml-2 text-[10px] text-amber-500 font-medium">carried over</span>}
                    </span>
                  )}
                </div>

                {/* Action row */}
                <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-gray-100">
                  <Tooltip text="Edit"><button onClick={() => startEdit(a)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"><PencilIcon /></button></Tooltip>
                  <Tooltip text="Priority"><button onClick={() => togglePriority(a.id)} className={`p-1.5 rounded-lg transition ${a.is_priority ? "text-amber-500 bg-amber-50" : "text-gray-400 hover:text-amber-400 hover:bg-amber-50"}`}><StarIcon filled={a.is_priority} /></button></Tooltip>
                  <Tooltip text="Protect habit"><button onClick={() => toggleHabit(a.id)} className={`p-1.5 rounded-lg transition ${a.is_habit_to_protect ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"}`}><ShieldIcon filled={a.is_habit_to_protect} /></button></Tooltip>
                  <Tooltip text="Delete"><button onClick={() => setDeleteTarget({ id: a.id })} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><TrashIcon /></button></Tooltip>

                  {/* Minutes practised */}
                  <div className="ml-auto flex items-center gap-1.5">
                    <ClockIcon />
                    {editingMinutesId === a.id ? (
                      <input
                        autoFocus
                        type="number"
                        min="0"
                        max="1440"
                        value={minutesText}
                        onChange={e => setMinutesText(e.target.value)}
                        onBlur={() => saveMinutes(a.id)}
                        onKeyDown={e => e.key === "Enter" && saveMinutes(a.id)}
                        className="w-16 text-xs bg-white border border-blue-300 rounded-lg px-2 py-1 outline-none text-gray-700 text-center"
                      />
                    ) : (
                      <button
                        onClick={() => { setEditingMinutesId(a.id); setMinutesText(String(a.minutes_practised)); }}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition px-1.5 py-1 rounded-lg hover:bg-blue-50"
                      >
                        <span className="font-medium">{a.minutes_practised}</span>
                        <span>min</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Skill Card (grid tile) ──
function SkillCard({ skill, today, onClick }) {
  const firstActivity = skill.activities?.[0];
  const entryDate = firstActivity?.entry_date;
  const isFromYesterday = entryDate ? String(entryDate) !== today : false;
  const total = skill.activities?.length || 0;
  const done = skill.activities?.filter(a => a.is_completed).length || 0;
  const allDone = total > 0 && done === total;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <button onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] ${allDone ? "border-blue-200" : isFromYesterday ? "border-amber-200" : "border-gray-100"}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className={`text-sm font-semibold truncate leading-tight ${allDone ? "text-blue-700" : "text-gray-800"}`}>{skill.name}</h3>
        {allDone && <span className="shrink-0 text-blue-500"><BadgeCheckIcon /></span>}
      </div>
      <div className="mb-2">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${allDone ? "bg-blue-500" : "bg-blue-400"}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-400">{done}/{total} done</span>
        {isFromYesterday && !allDone && <span className="text-[10px] font-medium text-amber-500">carried over</span>}
        {allDone && <span className="text-[10px] font-semibold text-blue-600">Complete!</span>}
      </div>
    </button>
  );
}

// ── Main Page ──
function SkillPractice() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSkillName, setNewSkillName] = useState("");
  const [skillNameError, setSkillNameError] = useState("");
  const [toast, setToast] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  const showToast = (message, type = "success") => setToast({ message, type });

  useEffect(() => { loadSkills(); }, []);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const res = await getSkillsAPI();
      const raw = res?.data?.skills || res?.skills || [];
      const mapped = raw.map(s => {
        const firstActivity = s.activities?.[0];
        const entryDate = firstActivity?.entry_date ? String(firstActivity.entry_date) : null;
        const isFromYesterday = entryDate ? entryDate !== today : false;
        const wasFullyCompleted = isFromYesterday && s.activities?.length > 0 && s.activities.every(a => a.is_completed);
        return { ...s, isFromYesterday, wasFullyCompleted };
      }).filter(s => !s.wasFullyCompleted);
      setSkills(mapped);
    } catch (err) { console.error("Load skills failed:", err); }
    finally { setLoading(false); }
  };

  const validateSkillName = (name) => {
    if (!name.trim()) { setSkillNameError("Skill name cannot be empty"); return false; }
    if (name.trim().length < 2) { setSkillNameError("Skill name must be at least 2 characters"); return false; }
    if (name.trim().length > 20) { setSkillNameError("Skill name cannot exceed 20 characters"); return false; }
    // ✅ Check for duplicate skill name
    const duplicate = skills.some(s => s.name.toLowerCase() === name.trim().toLowerCase());
    if (duplicate) { setSkillNameError("A skill with this name already exists"); return false; }
    setSkillNameError(""); return true;
  };

  const addSkill = async () => {
    if (!validateSkillName(newSkillName)) return;
    try {
      const res = await createSkillAPI({ name: newSkillName.trim() });
      const newSkill = { ...(res?.data || res), activities: [], isFromYesterday: false, wasFullyCompleted: false };
      setSkills(prev => [newSkill, ...prev]);
      setNewSkillName(""); setSkillNameError("");
      showToast("Skill added!", "success");
    } catch (err) {
      console.error("Create skill failed:", err);
      setSkillNameError(err.message || "Could not create skill");
    }
  };

  // ✅ When modal closes, update skill's activities in the grid
  const handleSkillUpdated = (id, patch) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    setSelectedSkill(prev => prev?.id === id ? { ...prev, ...patch } : prev);
  };

  const openSkill = (skill) => setSelectedSkill(skill);
  const closeSkill = () => setSelectedSkill(null);

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f0f9ff 100%)" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {selectedSkill && (
        <SkillModal
          skill={selectedSkill}
          today={today}
          onClose={closeSkill}
          onSkillUpdated={handleSkillUpdated}
          showToast={showToast}
        />
      )}

      <Sidebar activePath="/skill-practice" onNavigate={(path) => closeSkill() || window.location.href = path} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-10 pt-8 pb-4 shrink-0">
          <p className="text-blue-600 text-xs font-semibold uppercase tracking-widest mb-1">Skill Practice</p>
          <h1 className="text-2xl font-bold text-gray-800 leading-tight">What are you building today?</h1>
          <p className="text-gray-400 text-sm mt-1">Click a skill card to manage its activities</p>
        </div>

        <div className="px-10 pb-4 shrink-0">
          <div className="flex gap-2 max-w-sm">
            <div className="flex-1 flex flex-col gap-1">
              <input value={newSkillName}
                onChange={e => { setNewSkillName(e.target.value); if (skillNameError) setSkillNameError(""); }}
                onKeyDown={e => e.key === "Enter" && addSkill()}
                placeholder="Add a new skill..." maxLength={20}
                className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-300 outline-none transition shadow-sm ${skillNameError ? "border-red-300 focus:border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-300"}`}
              />
              {skillNameError && <p className="text-red-500 text-xs font-medium pl-1">{skillNameError}</p>}
            </div>
            <button onClick={addSkill} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm flex items-center gap-1.5 self-start">
              <PlusIcon />Add Skill
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-10 pb-8 mt-2">
          {loading ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : skills.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-300 text-sm">No skills yet. Add one above to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              {skills.map(skill => (
                <SkillCard key={skill.id} skill={skill} today={today} onClick={() => openSkill(skill)} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SkillPractice;