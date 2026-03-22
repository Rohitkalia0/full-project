import { useState, useEffect, useRef } from "react";
import { getSkillsAPI, createSkillAPI, updateSkillAPI, createSkillActivitiesAPI, updateSkillActivitiesAPI, deleteSkillActivityAPI } from "./api";
import Sidebar from "./Sidebar";

const StarIcon = ({ filled }) => (<svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
const ShieldIcon = ({ filled }) => (<svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
const TrashIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>);
const PencilIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>);
const CheckIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
const PlusIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
const BadgeCheckIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 3.2L18 4l.8 3.8L22 10l-2.4 3.2.4 3.8-3.8.8L14 20l-2-2.4L10 20l-2.2-2.2-3.8-.8.4-3.8L2 10l3.2-2.2L6 4l3.6 1.2z" /><polyline points="9 12 11 14 15 10" /></svg>);

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const handleMouseEnter = () => {
    if (ref.current) { const rect = ref.current.getBoundingClientRect(); setPos({ top: rect.top - 36, left: rect.left + rect.width / 2 }); }
    setShow(true);
  };
  return (
    <div ref={ref} className="relative flex items-center" onMouseEnter={handleMouseEnter} onMouseLeave={() => setShow(false)}>
      {show && <div className="bg-gray-800 text-white text-[10px] font-medium px-2 py-1 rounded-lg whitespace-nowrap shadow-lg pointer-events-none" style={{ position: "fixed", top: pos.top, left: pos.left, transform: "translateX(-50%)", zIndex: 9999 }}>{text}<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" /></div>}
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
  return <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${colors[type]}`}>{icons[type]}{message}</div>;
}

function DeleteModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.25)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-7 w-80 border border-gray-100">
        <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><TrashIcon /></div>
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

function SkillColumn({ skill, today, onSkillUpdated }) {
  const mapActivity = (a, isFromYesterday) => ({
    id: a.id, name: a.name,
    is_completed: isFromYesterday ? false : a.is_completed,
    is_priority: isFromYesterday ? false : a.is_priority,
    is_habit_to_protect: isFromYesterday ? false : a.is_habit_to_protect,
    minutes_practised: a.minutes_practised || 0,
    isCarriedOver: isFromYesterday && !a.is_completed,
  });

  const firstActivity = skill.activities?.[0];
  const entryDate = firstActivity?.entry_date;
  const isFromYesterday = entryDate ? String(entryDate) !== today : false;

  const [activities, setActivities] = useState((skill.activities || []).map(a => mapActivity(a, isFromYesterday)));
  const [newActivityName, setNewActivityName] = useState("");
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [skillName, setSkillName] = useState(skill.name || "");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const activitiesListRef = useRef(null);
  const allDone = activities.length > 0 && activities.every(a => a.is_completed);

  const toggleDone = async (id) => {
    const updated = activities.map(a => a.id === id ? { ...a, is_completed: !a.is_completed } : a);
    setActivities(updated);
    try {
      await updateSkillActivitiesAPI(skill.id, { activities: [{ id, is_completed: updated.find(a => a.id === id).is_completed }] });
      if (updated.every(a => a.is_completed) && updated.length > 0) {
        await updateSkillAPI(skill.id, { name: skillName, is_completed: true });
        onSkillUpdated(skill.id, { is_completed: true });
      }
    } catch (err) { console.error("Toggle done failed:", err); }
  };

  const togglePriority = async (id) => {
    const current = activities.find(a => a.id === id);
    const updated = activities.map(a => ({ ...a, is_priority: a.id === id ? !current.is_priority : false }));
    setActivities(updated);
    try { await updateSkillActivitiesAPI(skill.id, { activities: updated.map(a => ({ id: a.id, is_priority: a.is_priority })) }); }
    catch (err) { console.error("Toggle priority failed:", err); }
  };

  const toggleHabit = async (id) => {
    const current = activities.find(a => a.id === id);
    const updated = activities.map(a => ({ ...a, is_habit_to_protect: a.id === id ? !current.is_habit_to_protect : false }));
    setActivities(updated);
    try { await updateSkillActivitiesAPI(skill.id, { activities: updated.map(a => ({ id: a.id, is_habit_to_protect: a.is_habit_to_protect })) }); }
    catch (err) { console.error("Toggle habit failed:", err); }
  };

  const addActivity = async () => {
    if (!newActivityName.trim()) return;
    try {
      const res = await createSkillActivitiesAPI(skill.id, { activities: [{ name: newActivityName, is_priority: false, is_habit_to_protect: false, is_completed: false, minutes_practised: 0 }] });
      const created = res?.data?.activities || res?.activities || [];
      const last = created[created.length - 1];
      if (last) {
        setActivities(prev => {
          const updated = [...prev, { id: last.id, name: last.name, is_completed: false, is_priority: false, is_habit_to_protect: false, minutes_practised: 0, isCarriedOver: false }];
          setTimeout(() => { if (activitiesListRef.current) activitiesListRef.current.scrollTop = activitiesListRef.current.scrollHeight; }, 50);
          return updated;
        });
      }
      setNewActivityName("");
    } catch (err) { console.error("Add activity failed:", err); }
  };

  const startEdit = (a) => { setEditingActivityId(a.id); setEditText(a.name); };
  const saveEdit = async (id) => {
    const updated = activities.map(a => a.id === id ? { ...a, name: editText } : a);
    setActivities(updated); setEditingActivityId(null);
    try { await updateSkillActivitiesAPI(skill.id, { activities: [{ id, name: editText }] }); }
    catch (err) { console.error("Edit failed:", err); }
  };

  const doDeleteActivity = async () => {
    try { await deleteSkillActivityAPI(skill.id, deleteTarget.id); setActivities(prev => prev.filter(a => a.id !== deleteTarget.id)); }
    catch (err) { console.error("Delete failed:", err); }
    setDeleteTarget(null);
  };

  const saveSkillName = async () => {
    setEditingTitle(false);
    try { await updateSkillAPI(skill.id, { name: skillName }); onSkillUpdated(skill.id, { name: skillName }); }
    catch (err) { console.error("Rename failed:", err); }
  };

  return (
    <>
      {deleteTarget && <DeleteModal message="This activity will be permanently removed." onConfirm={doDeleteActivity} onCancel={() => setDeleteTarget(null)} />}
      <div className="flex flex-col bg-white rounded-2xl border shadow-sm w-full transition-all" style={{ borderColor: allDone ? "#bfdbfe" : isFromYesterday ? "#fde68a" : "#f3f4f6" }}>
        <div className={`px-4 pt-4 pb-3 rounded-t-2xl border-b ${allDone ? "bg-blue-50 border-blue-100" : isFromYesterday ? "bg-amber-50 border-amber-100" : "border-gray-100"}`}>
          <div className="flex items-center justify-between gap-2 mb-1">
            {editingTitle ? (
              <input autoFocus value={skillName} onChange={e => setSkillName(e.target.value)} onBlur={saveSkillName} onKeyDown={e => e.key === "Enter" && saveSkillName()} className="flex-1 text-sm font-semibold bg-white border border-blue-300 rounded-lg px-2 py-1 outline-none text-gray-800" />
            ) : (
              <h3 className={`text-sm font-semibold truncate flex-1 ${allDone ? "text-blue-700" : "text-gray-800"}`}>{skillName}</h3>
            )}
            <Tooltip text="Rename"><button onClick={() => setEditingTitle(true)} className="p-1.5 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition shrink-0"><PencilIcon /></button></Tooltip>
          </div>
          {allDone && <div className="flex items-center gap-1.5 mt-1"><span className="text-blue-600"><BadgeCheckIcon /></span><span className="text-xs font-semibold text-blue-600">Completed</span></div>}
          {isFromYesterday && !allDone && <p className="text-[10px] font-medium text-amber-500">Carried over from yesterday</p>}
          <p className="text-[10px] text-gray-400 mt-0.5">{activities.filter(a => a.is_completed).length}/{activities.length} done</p>
        </div>

        <div ref={activitiesListRef} className="px-3 py-3 flex flex-col gap-2 overflow-y-auto" style={{ height: "260px" }}>
          {activities.length === 0 && <p className="text-gray-300 text-xs text-center py-2">No activities yet</p>}
          {activities.map(a => (
            <div key={a.id} className={`flex flex-col px-3 py-2.5 rounded-xl border transition-all ${a.is_completed ? "bg-gray-50 border-gray-100" : a.isCarriedOver ? "bg-amber-50 border-amber-100" : "bg-white border-gray-200"}`}>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleDone(a.id)} className={`min-w-[18px] min-h-[18px] w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${a.is_completed ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 hover:border-blue-400"}`}>{a.is_completed && <CheckIcon />}</button>
                {editingActivityId === a.id ? (
                  <input autoFocus value={editText} onChange={e => setEditText(e.target.value)} onBlur={() => saveEdit(a.id)} onKeyDown={e => e.key === "Enter" && saveEdit(a.id)} className="flex-1 text-xs bg-white border border-blue-300 rounded-lg px-2 py-1 outline-none text-gray-700" />
                ) : (
                  <span className={`flex-1 text-xs ${a.is_completed ? "line-through text-gray-400" : "text-gray-700"}`}>{a.name}{a.isCarriedOver && <span className="ml-1.5 text-[9px] text-amber-500 font-medium">carried over</span>}</span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                <Tooltip text="Edit"><button onClick={() => startEdit(a)} className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"><PencilIcon /></button></Tooltip>
                <Tooltip text="Priority"><button onClick={() => togglePriority(a.id)} className={`p-1 rounded-lg transition ${a.is_priority ? "text-amber-500 bg-amber-50" : "text-gray-400 hover:text-amber-400 hover:bg-amber-50"}`}><StarIcon filled={a.is_priority} /></button></Tooltip>
                <Tooltip text="Protect habit"><button onClick={() => toggleHabit(a.id)} className={`p-1 rounded-lg transition ${a.is_habit_to_protect ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"}`}><ShieldIcon filled={a.is_habit_to_protect} /></button></Tooltip>
                <Tooltip text="Delete"><button onClick={() => setDeleteTarget({ id: a.id })} className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><TrashIcon /></button></Tooltip>
              </div>
            </div>
          ))}
        </div>

        <div className="px-3 pb-3 pt-2 border-t border-gray-100">
          <div className="flex gap-2 w-full">
            <input value={newActivityName} onChange={e => setNewActivityName(e.target.value)} onKeyDown={e => e.key === "Enter" && addActivity()} placeholder="Add activity..." className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 placeholder-gray-300 outline-none focus:border-blue-300 focus:bg-white transition" />
            <button onClick={addActivity} className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 rounded-xl flex items-center justify-center transition shadow-sm"><PlusIcon /></button>
          </div>
        </div>
      </div>
    </>
  );
}

function SkillPractice() {
  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [skillNameError, setSkillNameError] = useState("");
  const [toast, setToast] = useState(null);
  const skillsGridRef = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  const showToast = (message, type = "success") => setToast({ message, type });

  useEffect(() => { loadSkills(); }, []);

  const loadSkills = async () => {
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
  };

  const validateSkillName = (name) => {
    if (!name.trim()) { setSkillNameError("Skill name cannot be empty"); return false; }
    if (name.trim().length < 2) { setSkillNameError("Skill name must be at least 2 characters"); return false; }
    if (name.trim().length > 20) { setSkillNameError("Skill name cannot exceed 20 characters"); return false; }
    setSkillNameError(""); return true;
  };

  const addSkill = async () => {
    if (!validateSkillName(newSkillName)) return;
    try {
      const res = await createSkillAPI({ name: newSkillName.trim() });
      const newSkill = { ...(res?.data || res), activities: [], isFromYesterday: false, wasFullyCompleted: false };
      setSkills(prev => {
        const updated = [...prev, newSkill];
        setTimeout(() => { if (skillsGridRef.current) skillsGridRef.current.scrollTop = skillsGridRef.current.scrollHeight; }, 50);
        return updated;
      });
      setNewSkillName(""); setSkillNameError("");
      showToast("Skill added!", "success");
    } catch (err) { console.error("Create skill failed:", err); setSkillNameError(err.message || "Could not create skill"); }
  };

  const handleSkillUpdated = (id, patch) => setSkills(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f0f9ff 100%)" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Sidebar activePath="/skill-practice" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-10 pt-8 pb-4 shrink-0">
          <p className="text-blue-600 text-xs font-semibold uppercase tracking-widest mb-1">Skill Practice</p>
          <h1 className="text-2xl font-bold text-gray-800 leading-tight">What are you building today?</h1>
          <p className="text-gray-400 text-sm mt-1">Track your skills and the activities within each one</p>
        </div>

        <div className="px-10 pb-4 shrink-0">
          <div className="flex gap-2 max-w-sm">
            <div className="flex-1 flex flex-col gap-1">
              <input value={newSkillName} onChange={e => { setNewSkillName(e.target.value); if (skillNameError) setSkillNameError(""); }}
                onKeyDown={e => e.key === "Enter" && addSkill()} placeholder="Add a new skill..." maxLength={20}
                className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-300 outline-none transition shadow-sm ${skillNameError ? "border-red-300 focus:border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-300"}`} />
              {skillNameError && <p className="text-red-500 text-xs font-medium pl-1">{skillNameError}</p>}
            </div>
            <button onClick={addSkill} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm flex items-center gap-1.5 self-start">
              <PlusIcon />Add Skill
            </button>
          </div>
        </div>

        <div ref={skillsGridRef} className="flex-1 overflow-y-auto overflow-x-hidden px-10 pb-8 mt-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {skills.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-40"><p className="text-gray-300 text-sm">No skills yet. Add one above to get started.</p></div>
            ) : (
              skills.map(skill => <SkillColumn key={skill.id} skill={skill} today={today} onSkillUpdated={handleSkillUpdated} />)
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SkillPractice;