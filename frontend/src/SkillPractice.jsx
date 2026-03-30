import { useState, useEffect, useRef } from "react";
import {
  getSkillsAPI, createSkillAPI, updateSkillAPI,
  createSkillActivitiesAPI, updateSkillActivitiesAPI, deleteSkillActivityAPI
} from "./api";
import Sidebar from "./Sidebar";

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_CHARS = 2000;
const MIN_CHARS = 2;
const SKILL_NAME_MAX = 20;

// Local date YYYY-MM-DD (avoids UTC offset issues from toISOString)
const getLocalToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const StarIcon = ({ filled }) => (<svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
const ShieldIcon = ({ filled }) => (<svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
const TrashIcon = ({ size = 14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>);
const PencilIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>);
const CheckIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const PlusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const BadgeCheckIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 3.2L18 4l.8 3.8L22 10l-2.4 3.2.4 3.8-3.8.8L14 20l-2-2.4L10 20l-2.2-2.2-3.8-.8.4-3.8L2 10l3.2-2.2L6 4l3.6 1.2z" /><polyline points="9 12 11 14 15 10" /></svg>);
const CloseIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const ClockIcon = ({ size = 13 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const LayersIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>);
const ActivityIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>);
const TrophyIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>);

// ─── Tooltip ──────────────────────────────────────────────────────────────────
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

// ─── Toast ────────────────────────────────────────────────────────────────────
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

// ─── Delete Modal ─────────────────────────────────────────────────────────────
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="h-4 bg-gray-100 rounded-lg w-3/4 mb-3" />
      <div className="h-2 bg-gray-100 rounded-full w-full mb-3" />
      <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
    </div>
  );
}

// ─── Truncated Text ──────────────────────────────────────────────────────────
const TEXT_TRUNCATE_LENGTH = 150;

function TruncatedText({ text, className, isExpanded, onToggle }) {
  if (text.length <= TEXT_TRUNCATE_LENGTH) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      {isExpanded ? text : `${text.slice(0, TEXT_TRUNCATE_LENGTH)}...`}
      <button onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="ml-1 text-blue-500 hover:text-blue-600 text-xs font-medium">
        {isExpanded ? "show less" : "show more"}
      </button>
    </span>
  );
}

// ─── Minutes input filter — block non-numeric keys ───────────────────────────
const blockInvalidMinutesKeys = (e) => {
  if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault();
};
const sanitizeMinutesInput = (val) => val.replace(/[^0-9]/g, "");

// ─── Validation helpers ───────────────────────────────────────────────────────
const validateText = (val, fieldName = "This field") => {
  const trimmed = val.trim();
  if (!trimmed) return `${fieldName} cannot be empty`;
  if (trimmed.length < MIN_CHARS) return `${fieldName} must be at least ${MIN_CHARS} characters`;
  if (trimmed.length > MAX_CHARS) return `${fieldName} cannot exceed ${MAX_CHARS} characters`;
  return "";
};

// ─── Sort: incomplete first, completed at bottom ──────────────────────────────
const sortActivities = (list) => [
  ...list.filter(a => !a.is_completed),
  ...list.filter(a => a.is_completed),
];

// ─── Format minutes helper ────────────────────────────────────────────────────
const formatMins = (mins) => {
  if (!mins || mins === 0) return null;
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// ─── Stats Strip (right of Add Skill input) ───────────────────────────────────
function StatsStrip({ skills, skillActivities }) {
  const totalSkills = skills.length;
  const allActs = Object.values(skillActivities).flat();
  const totalActs = allActs.length;
  const doneActs = allActs.filter(a => a.is_completed).length;
  const totalMins = allActs.reduce((sum, a) => sum + (a.minutes_practised || 0), 0);

  const stats = [
    { icon: <LayersIcon />, value: totalSkills, label: "skills", color: "text-blue-600 bg-blue-50 border-blue-100" },
    { icon: <ActivityIcon />, value: `${doneActs}/${totalActs}`, label: "done", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    ...(totalMins > 0 ? [{ icon: <ClockIcon size={13} />, value: formatMins(totalMins), label: "logged", color: "text-violet-600 bg-violet-50 border-violet-100" }] : []),
  ];

  if (totalSkills === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {stats.map((s, i) => (
        <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${s.color}`}>
          {s.icon}
          <span>{s.value}</span>
          <span className="font-normal opacity-70">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Skill Detail Modal ───────────────────────────────────────────────────────
function SkillModal({ skill, today, onClose, onSkillUpdated, onActivitiesChanged, showToast }) {
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
  const isFromYesterday = entryDate ? String(entryDate).split("T")[0] !== today : false;

  const initialActivities = sortActivities((skill.activities || []).map(a => mapActivity(a, isFromYesterday)));
  const [activities, setActivities] = useState(initialActivities);
  // Snapshot of activities at modal open (updated when add/delete happen since those are immediate)
  const savedActivitiesRef = useRef(initialActivities.map(a => ({ ...a })));

  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityError, setNewActivityError] = useState("");

  // Full edit state per activity
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editTextError, setEditTextError] = useState("");
  const [editMinutes, setEditMinutes] = useState("");

  // Inline minutes-only edit state
  const [minutesEditId, setMinutesEditId] = useState(null);
  const [minutesEditVal, setMinutesEditVal] = useState("");

  const [editingTitle, setEditingTitle] = useState(false);
  const [skillName, setSkillName] = useState(skill.name || "");
  const [skillNameError, setSkillNameError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedActivityId, setExpandedActivityId] = useState(null);
  const savingRef = useRef(false);
  const closingRef = useRef(false);

  const allDone = activities.length > 0 && activities.every(a => a.is_completed);
  const doneCount = activities.filter(a => a.is_completed).length;
  const totalMins = activities.reduce((sum, a) => sum + (a.minutes_practised || 0), 0);

  useEffect(() => { onActivitiesChanged(skill.id, activities); }, [activities]);

  // ── Flush changed activities to backend on close ──
  const flushChanges = async (currentActivities) => {
    const saved = savedActivitiesRef.current;
    const patches = [];
    for (const a of currentActivities) {
      const orig = saved.find(s => s.id === a.id);
      if (!orig) continue; // newly added — already POSTed
      const diff = { id: a.id };
      let hasDiff = false;
      if (a.name.trim() !== orig.name.trim()) { diff.name = a.name.trim(); hasDiff = true; }
      if (a.is_completed !== orig.is_completed) { diff.is_completed = a.is_completed; hasDiff = true; }
      if (a.is_priority !== orig.is_priority) { diff.is_priority = a.is_priority; hasDiff = true; }
      if (a.is_habit_to_protect !== orig.is_habit_to_protect) { diff.is_habit_to_protect = a.is_habit_to_protect; hasDiff = true; }
      if (a.minutes_practised !== orig.minutes_practised) { diff.minutes_practised = a.minutes_practised; hasDiff = true; }
      if (hasDiff) patches.push(diff);
    }
    try {
      if (patches.length > 0) {
        await updateSkillActivitiesAPI(skill.id, { activities: patches });
      }
      // Check if skill should be marked complete
      if (currentActivities.length > 0 && currentActivities.every(a => a.is_completed)) {
        await updateSkillAPI(skill.id, { is_completed: true });
        onSkillUpdated(skill.id, { is_completed: true });
      }
      // Check if skill name changed
      if (skillName.trim() && skillName.trim() !== skill.name.trim()) {
        await updateSkillAPI(skill.id, { name: skillName.trim() });
        onSkillUpdated(skill.id, { name: skillName.trim() });
      }
    } catch (err) {
      console.error("Flush changes failed:", err);
    }
  };

  const handleClose = async () => {
    if (closingRef.current) return;
    closingRef.current = true;
    await flushChanges(activities);
    onClose();
  };

  // Use refs so Escape/backdrop handlers always see latest state
  const activitiesRef = useRef(activities);
  useEffect(() => { activitiesRef.current = activities; }, [activities]);
  const skillNameRef = useRef(skillName);
  useEffect(() => { skillNameRef.current = skillName; }, [skillName]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (editingTitle || editingActivityId || minutesEditId) return;
        handleCloseViaRef();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editingTitle, editingActivityId, minutesEditId]);

  const handleCloseViaRef = async () => {
    if (closingRef.current) return;
    closingRef.current = true;
    await flushChanges(activitiesRef.current);
    onClose();
  };

  // ── Local-only toggles (no API calls) ──
  const toggleDone = (id) => {
    setActivities(prev => prev.map(a => {
      if (a.id !== id) return a;
      const nowCompleted = !a.is_completed;
      return { ...a, is_completed: nowCompleted, minutes_practised: nowCompleted ? a.minutes_practised : 0 };
    }));
    setMinutesEditId(prev => prev === id ? null : prev);
  };

  const togglePriority = (id) => {
    setActivities(prev => {
      const current = prev.find(a => a.id === id);
      return sortActivities(prev.map(a => ({ ...a, is_priority: a.id === id ? !current.is_priority : false })));
    });
  };

  const toggleHabit = (id) => {
    setActivities(prev => {
      const current = prev.find(a => a.id === id);
      return sortActivities(prev.map(a => ({ ...a, is_habit_to_protect: a.id === id ? !current.is_habit_to_protect : false })));
    });
  };

  // ── Add activity — still immediate (needs server ID), always 0 minutes ──
  const addActivity = async () => {
    if (savingRef.current) return;
    const nameErr = validateText(newActivityName, "Activity name");
    if (nameErr) { setNewActivityError(nameErr); return; }
    setNewActivityError("");
    savingRef.current = true;
    try {
      const res = await createSkillActivitiesAPI(skill.id, {
        activities: [{
          name: newActivityName.trim(),
          is_priority: false,
          is_habit_to_protect: false,
          is_completed: false,
          minutes_practised: 0,
        }]
      });
      const created = res?.data?.activities || res?.activities || [];
      const last = created[created.length - 1];
      if (last) {
        const newItem = {
          id: last.id,
          name: last.name,
          is_completed: false,
          is_priority: false,
          is_habit_to_protect: false,
          minutes_practised: 0,
          isCarriedOver: false,
        };
        setActivities(prev => sortActivities([newItem, ...prev]));
        savedActivitiesRef.current = [{ ...newItem }, ...savedActivitiesRef.current];
      }
      setNewActivityName("");
    } catch (err) {
      console.error("Add activity failed:", err);
      showToast("Failed to add activity", "error");
    } finally {
      savingRef.current = false;
    }
  };

  const startEdit = (a) => {
    setMinutesEditId(null);
    setEditingActivityId(a.id);
    setEditText(a.name);
    setEditTextError("");
    setEditMinutes(a.minutes_practised > 0 ? String(a.minutes_practised) : "");
  };

  // ── Save edit locally only ──
  const saveEdit = (id) => {
    const nameErr = validateText(editText, "Activity name");
    if (nameErr) { setEditTextError(nameErr); return; }
    const mins = editMinutes === "" ? 0 : parseInt(editMinutes, 10);
    if (editMinutes !== "" && (isNaN(mins) || mins < 0 || mins > 1440)) {
      setEditTextError("Minutes must be between 0 and 1440");
      return;
    }
    setActivities(prev => sortActivities(prev.map(a =>
      a.id === id ? { ...a, name: editText.trim(), minutes_practised: mins } : a
    )));
    setEditingActivityId(null);
    setEditTextError("");
  };

  const cancelEdit = () => {
    setEditingActivityId(null);
    setEditTextError("");
    setEditMinutes("");
  };

  // ── Inline minutes — local only ──
  const saveInlineMinutes = (id) => {
    const mins = minutesEditVal === "" ? 0 : parseInt(minutesEditVal, 10);
    if (minutesEditVal !== "" && (isNaN(mins) || mins < 0 || mins > 1440)) {
      setMinutesEditId(null);
      return;
    }
    setMinutesEditId(null);
    setActivities(prev => prev.map(a => a.id === id ? { ...a, minutes_practised: mins } : a));
  };

  // ── Delete — still immediate (server resource destruction) ──
  const doDeleteActivity = async () => {
    try {
      await deleteSkillActivityAPI(skill.id, deleteTarget.id);
      setActivities(prev => sortActivities(prev.filter(a => a.id !== deleteTarget.id)));
      // Remove from saved snapshot too
      savedActivitiesRef.current = savedActivitiesRef.current.filter(a => a.id !== deleteTarget.id);
    } catch (err) { console.error("Delete failed:", err); }
    setDeleteTarget(null);
  };

  // ── Skill name — local only, flushed on close ──
  const saveSkillName = () => {
    const trimmed = skillName.trim();
    if (!trimmed || trimmed.length < MIN_CHARS) { setSkillNameError(`Skill name must be at least ${MIN_CHARS} characters`); return; }
    if (trimmed.length > SKILL_NAME_MAX) { setSkillNameError(`Skill name cannot exceed ${SKILL_NAME_MAX} characters`); return; }
    setSkillNameError("");
    setEditingTitle(false);
  };

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          message="This activity will be permanently removed."
          onConfirm={doDeleteActivity}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={handleClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ width: "min(600px, 95vw)", maxHeight: "88vh" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`px-6 pt-5 pb-4 border-b flex items-start justify-between gap-3 ${allDone ? "bg-blue-50 border-blue-100" : isFromYesterday ? "bg-amber-50 border-amber-100" : "border-gray-100"}`}>
            <div className="flex-1 min-w-0">
              {editingTitle ? (
                <div>
                  <input
                    autoFocus
                    value={skillName}
                    onChange={e => { setSkillName(e.target.value); setSkillNameError(""); }}
                    onBlur={saveSkillName}
                    onKeyDown={e => { if (e.key === "Enter") saveSkillName(); if (e.key === "Escape") { setEditingTitle(false); setSkillNameError(""); } }}
                    maxLength={SKILL_NAME_MAX}
                    className={`w-full text-lg font-bold bg-white border rounded-xl px-3 py-1.5 outline-none text-gray-800 ${skillNameError ? "border-red-400" : "border-blue-300"}`}
                  />
                  {skillNameError && <p className="text-red-500 text-xs mt-1">{skillNameError}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className={`text-lg font-bold truncate ${allDone ? "text-blue-700" : "text-gray-800"}`}>{skillName}</h2>
                  <button onClick={() => setEditingTitle(true)} className="p-1 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition shrink-0">
                    <PencilIcon />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs text-gray-400">{doneCount}/{activities.length} done</span>
                {/* Total time logged in modal header */}
                {totalMins > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium text-violet-500">
                    <ClockIcon size={11} />{formatMins(totalMins)} logged
                  </span>
                )}
                {allDone && <span className="flex items-center gap-1 text-xs font-semibold text-blue-600"><BadgeCheckIcon /> Completed!</span>}
                {isFromYesterday && !allDone && <span className="text-[10px] font-medium text-amber-500">Carried over from yesterday</span>}
              </div>
            </div>
            <button onClick={handleClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition shrink-0 cursor-pointer">
              <CloseIcon />
            </button>
          </div>

          {/* Add activity input */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex gap-2 items-start">
              <div className="flex-1 flex flex-col gap-1">
                <textarea
                  value={newActivityName}
                  onChange={e => { setNewActivityName(e.target.value); if (newActivityError) setNewActivityError(""); }}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addActivity(); } }}
                  onInput={e => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                  placeholder="Activity name..."
                  maxLength={MAX_CHARS}
                  rows={1}
                  style={{ resize: "none", overflow: "hidden", overflowWrap: "break-word" }}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-300 outline-none transition min-h-[40px] ${newActivityError ? "border-red-300 bg-red-50 focus:border-red-400" : "bg-white border-gray-200 focus:border-blue-300"}`}
                />
                {newActivityError && <p className="text-red-500 text-xs font-medium">{newActivityError}</p>}
              </div>

              <button
                onClick={addActivity}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <PlusIcon /> Add
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 pl-0.5">
              {newActivityName.length}/{MAX_CHARS} chars
            </p>
          </div>

          {/* Activities list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2" onClick={() => { if (expandedActivityId) setExpandedActivityId(null); }}>
            {activities.length === 0 && (
              <p className="text-gray-300 text-sm text-center py-8">No activities yet. Add one above.</p>
            )}
            {activities.map(a => (
              <div
                key={a.id}
                className={`flex flex-col px-4 py-3 rounded-xl border transition-all ${
                  a.is_completed ? "bg-gray-50 border-gray-100 opacity-70"
                  : a.isCarriedOver ? "bg-amber-50 border-amber-100"
                  : "bg-white border-gray-200"
                }`}
              >
                {editingActivityId === a.id ? (
                  /* ── Edit mode — saves on blur (like morning) ── */
                  <div className="flex gap-2 items-start"
                    onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) saveEdit(a.id); }}>
                    <div className="flex-1 flex flex-col gap-1">
                      <textarea
                        autoFocus
                        ref={(el) => { if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; } }}
                        value={editText}
                        onChange={e => { setEditText(e.target.value); setEditTextError(""); }}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(a.id); } if (e.key === "Escape") cancelEdit(); }}
                        onInput={e => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                        maxLength={MAX_CHARS}
                        rows={1}
                        style={{ resize: "none", overflow: "hidden", overflowWrap: "break-word" }}
                        className={`w-full text-sm border rounded-lg px-2.5 py-1.5 outline-none text-gray-700 min-h-[32px] ${editTextError ? "border-red-400 bg-red-50" : "bg-white border-blue-300 focus:border-blue-400"}`}
                      />
                      {editTextError && <p className="text-red-500 text-xs">{editTextError}</p>}
                    </div>
                    {a.is_completed && (
                    <div className="flex items-center gap-1.5 shrink-0 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus-within:border-blue-300 transition" style={{ width: "90px" }}>
                      <ClockIcon />
                      <input
                        type="number"
                        value={editMinutes}
                        onChange={e => setEditMinutes(sanitizeMinutesInput(e.target.value))}
                        onKeyDown={e => { blockInvalidMinutesKeys(e); if (e.key === "Enter") saveEdit(a.id); if (e.key === "Escape") cancelEdit(); }}
                        placeholder="mins"
                        min={0}
                        max={1440}
                        className="w-full text-sm text-gray-600 outline-none bg-transparent placeholder-gray-300"
                      />
                    </div>
                    )}
                  </div>
                ) : (
                  /* ── View mode ── */
                  <>
                    {/* Activity name row */}
                    <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                      <button
                        onClick={() => toggleDone(a.id)}
                        className={`min-w-[20px] min-h-[20px] w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${a.is_completed ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 hover:border-blue-400"}`}
                      >
                        {a.is_completed && <CheckIcon />}
                      </button>
                      <span className={`flex-1 text-sm break-all min-w-0 overflow-hidden ${a.is_completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                        <TruncatedText text={a.name} className="" isExpanded={expandedActivityId === a.id} onToggle={() => setExpandedActivityId(prev => prev === a.id ? null : a.id)} />
                        {a.isCarriedOver && <span className="ml-2 text-[10px] text-amber-500 font-medium">carried over</span>}
                      </span>
                    </div>

                    {/* Action toolbar row */}
                    <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-gray-100">
                      <Tooltip text="Edit">
                        <button onClick={() => startEdit(a)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"><PencilIcon /></button>
                      </Tooltip>
                      <Tooltip text="Priority">
                        <button onClick={() => togglePriority(a.id)} className={`p-1.5 rounded-lg transition ${a.is_priority ? "text-amber-500 bg-amber-50" : "text-gray-400 hover:text-amber-400 hover:bg-amber-50"}`}><StarIcon filled={a.is_priority} /></button>
                      </Tooltip>
                      <Tooltip text="Protect habit">
                        <button onClick={() => toggleHabit(a.id)} className={`p-1.5 rounded-lg transition ${a.is_habit_to_protect ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"}`}><ShieldIcon filled={a.is_habit_to_protect} /></button>
                      </Tooltip>

                      {/* ── Inline editable minutes pill ── */}
                      <div className="flex-1 flex justify-center">
                        {a.is_completed ? (
                        minutesEditId === a.id ? (
                          <div className="flex items-center gap-1 bg-violet-50 border border-violet-200 rounded-lg px-2 py-1 focus-within:border-violet-400 transition" style={{ width: "88px" }}>
                            <ClockIcon size={11} />
                            <input
                              autoFocus
                              type="number"
                              value={minutesEditVal}
                              onChange={e => setMinutesEditVal(sanitizeMinutesInput(e.target.value))}
                              onBlur={() => saveInlineMinutes(a.id)}
                              onKeyDown={e => {
                                blockInvalidMinutesKeys(e);
                                if (e.key === "Enter") saveInlineMinutes(a.id);
                                if (e.key === "Escape") setMinutesEditId(null);
                              }}
                              placeholder="mins"
                              min={0}
                              max={1440}
                              className="w-full text-xs text-violet-700 font-medium outline-none bg-transparent placeholder-violet-300"
                            />
                          </div>
                        ) : (
                          <Tooltip text="Click to edit time">
                            <button
                              onClick={() => {
                                setMinutesEditId(a.id);
                                setMinutesEditVal(a.minutes_practised > 0 ? String(a.minutes_practised) : "");
                              }}
                              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium border transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 ${
                                a.minutes_practised > 0
                                  ? "text-violet-600 bg-violet-50 border-violet-100"
                                  : "text-gray-300 border-dashed border-gray-200 hover:text-violet-500"
                              }`}
                            >
                              <ClockIcon size={11} />
                              {a.minutes_practised > 0 ? formatMins(a.minutes_practised) : "add time"}
                            </button>
                          </Tooltip>
                        )
                        ) : null}
                      </div>

                      <Tooltip text="Delete">
                        <button onClick={() => setDeleteTarget({ id: a.id })} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><TrashIcon /></button>
                      </Tooltip>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Skill Card ───────────────────────────────────────────────────────────────
function SkillCard({ skill, today, activities, onClick }) {
  const firstActivity = skill.activities?.[0];
  const entryDate = firstActivity?.entry_date;
  const isFromYesterday = entryDate ? String(entryDate).split("T")[0] !== today : false;

  const liveActivities = activities ?? skill.activities ?? [];
  const total = liveActivities.length;
  const done = liveActivities.filter(a => a.is_completed).length;
  const allDone = total > 0 && done === total;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const totalMins = liveActivities.reduce((sum, a) => sum + (a.minutes_practised || 0), 0);
  const formattedTime = formatMins(totalMins);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] ${allDone ? "border-blue-200" : isFromYesterday ? "border-amber-200" : "border-gray-100"}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className={`text-sm font-semibold truncate leading-tight ${allDone ? "text-blue-700" : "text-gray-800"}`}>{skill.name}</h3>
        {allDone && <span className="shrink-0 text-blue-500"><BadgeCheckIcon /></span>}
      </div>
      <div className="mb-3">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${allDone ? "bg-blue-500" : "bg-blue-400"}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-gray-400">{done}/{total} done</span>
        <div className="flex items-center gap-1.5">
          {/* Total time badge on card */}
          {formattedTime && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-500 bg-violet-50 border border-violet-100 rounded-md px-1.5 py-0.5">
              <ClockIcon size={10} />{formattedTime}
            </span>
          )}
          {isFromYesterday && !allDone && <span className="text-[10px] font-medium text-amber-500">carried over</span>}
          {allDone && <span className="text-[10px] font-semibold text-blue-600">Complete!</span>}
        </div>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function SkillPractice() {
  const [skills, setSkills] = useState([]);
  const [skillActivities, setSkillActivities] = useState({});
  const [loading, setLoading] = useState(true);
  const [newSkillName, setNewSkillName] = useState("");
  const [skillNameError, setSkillNameError] = useState("");
  const [toast, setToast] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const today = getLocalToday();

  const showToast = (message, type = "success") => setToast({ message, type });

  useEffect(() => { loadSkills(); }, []);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const res = await getSkillsAPI();
      const raw = res?.data?.skills || res?.skills || [];
      const mapped = raw.map(s => {
        const firstActivity = s.activities?.[0];
        const entryDate = firstActivity?.entry_date ? String(firstActivity.entry_date).split("T")[0] : null;
        const isFromYesterday = entryDate ? entryDate !== today : false;
        const wasFullyCompleted = isFromYesterday && s.activities?.length > 0 && s.activities.every(a => a.is_completed);
        return { ...s, isFromYesterday, wasFullyCompleted };
      }).filter(s => !s.wasFullyCompleted);
      setSkills(mapped);
      const actMap = {};
      mapped.forEach(s => { actMap[s.id] = s.activities || []; });
      setSkillActivities(actMap);
    } catch (err) {
      console.error("Load skills failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateSkillName = (name) => {
    if (!name.trim()) { setSkillNameError("Skill name cannot be empty"); return false; }
    if (name.trim().length < MIN_CHARS) { setSkillNameError(`Skill name must be at least ${MIN_CHARS} characters`); return false; }
    if (name.trim().length > SKILL_NAME_MAX) { setSkillNameError(`Skill name cannot exceed ${SKILL_NAME_MAX} characters`); return false; }
    const isDuplicate = skills.some(s => s.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (isDuplicate) { setSkillNameError("A skill with this name already exists"); return false; }
    setSkillNameError(""); return true;
  };

  const addSkill = async () => {
    if (!validateSkillName(newSkillName)) return;
    try {
      await createSkillAPI({ name: newSkillName.trim() });
      setNewSkillName(""); setSkillNameError("");
      showToast("Skill added!", "success");
      await loadSkills();
    } catch (err) {
      console.error("Create skill failed:", err);
      setSkillNameError(err.message || "Could not create skill");
    }
  };

  const handleSkillUpdated = (id, patch) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    setSelectedSkill(prev => prev?.id === id ? { ...prev, ...patch } : prev);
  };

  const handleActivitiesChanged = (skillId, newActivities) => {
    setSkillActivities(prev => ({ ...prev, [skillId]: newActivities }));
  };

  const openSkill = (skill) => {
    const liveActivities = skillActivities[skill.id];
    setSelectedSkill(liveActivities ? { ...skill, activities: liveActivities } : skill);
  };
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
          onActivitiesChanged={handleActivitiesChanged}
          showToast={showToast}
        />
      )}

      <Sidebar activePath="/skill-practice" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-10 pt-8 pb-4 shrink-0">
          <p className="text-blue-600 text-xs font-semibold uppercase tracking-widest mb-1">Skill Practice</p>
          <h1 className="text-2xl font-bold text-gray-800 leading-tight">What are you building today?</h1>
          <p className="text-gray-400 text-sm mt-1">Track your skills and the activities within each one</p>
        </div>

        <div className="px-10 pb-4 shrink-0">
          {/* Add skill input + stats strip on same row */}
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex gap-2 max-w-sm">
              <div className="flex-1 flex flex-col gap-1">
                <input
                  value={newSkillName}
                  onChange={e => { setNewSkillName(e.target.value); if (skillNameError) setSkillNameError(""); }}
                  onKeyDown={e => e.key === "Enter" && addSkill()}
                  placeholder="Add a new skill..."
                  maxLength={SKILL_NAME_MAX}
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-300 outline-none transition shadow-sm ${skillNameError ? "border-red-300 focus:border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-300"}`}
                />
                {skillNameError && <p className="text-red-500 text-xs font-medium pl-1">{skillNameError}</p>}
              </div>
              <button onClick={addSkill} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm flex items-center gap-1.5 self-start">
                <PlusIcon /> Add Skill
              </button>
            </div>

            {/* Stats strip — only shown when there are skills */}
            {!loading && (
              <div className="flex items-center self-start mt-0.5">
                <StatsStrip skills={skills} skillActivities={skillActivities} />
              </div>
            )}
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
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  today={today}
                  activities={skillActivities[skill.id]}
                  onClick={() => openSkill(skill)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SkillPractice;