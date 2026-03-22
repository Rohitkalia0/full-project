import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createMorningAPI, updateMorningAPI, addActivityAPI, deleteActivityAPI, getMorningAPI } from "./api";
import Sidebar from "./Sidebar";

const StarIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const ShieldIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);
const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {show && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-medium px-2 py-1 rounded-lg whitespace-nowrap z-50 shadow-lg pointer-events-none">
          {text}<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}
      {children}
    </div>
  );
}

function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.25)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-7 w-80 border border-gray-100">
        <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><TrashIcon /></div>
        <h3 className="text-gray-800 font-semibold text-base text-center mb-1">Delete Activity?</h3>
        <p className="text-gray-400 text-sm text-center mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition shadow-sm">Delete</button>
        </div>
      </div>
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
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${colors[type]}`}>
      {icons[type]}{message}
    </div>
  );
}

const parseMorningData = (res) => {
  if (res?.data && typeof res.data === "object" && res.data.id) return res.data;
  if (res?.id) return res;
  return null;
};

function MorningCheckin() {
  const navigate = useNavigate();
  const [confidence, setConfidence] = useState(2);
  const [savedConfidence, setSavedConfidence] = useState(2);
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState("");
  const [newActivityError, setNewActivityError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isFromYesterday, setIsFromYesterday] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  const checkinIdRef = useRef(null);
  const confidenceRef = useRef(2);
  const isCreatingRef = useRef(false);

  const showToast = (message, type = "success") => setToast({ message, type });

  useEffect(() => { confidenceRef.current = confidence; }, [confidence]);
  useEffect(() => { loadMorning(); }, []);

  const applyMorningData = (data, today) => {
    const rawDate = data.date ?? "";
    const dataDate = String(rawDate).split("T")[0];
    const fromYesterday = dataDate && dataDate !== today;
    setIsFromYesterday(!!fromYesterday);
    if (!fromYesterday && data.id) checkinIdRef.current = data.id;
    else checkinIdRef.current = null;
    const rating = data.confidence_rating ?? 2;
    setConfidence(rating); setSavedConfidence(rating); confidenceRef.current = rating;
    const mapped = (data.activities ?? []).map((a) => ({
      id: fromYesterday ? `prev-${a.id}` : a.id, realId: a.id, text: a.title,
      done: fromYesterday ? false : (a.is_completed ?? false),
      priority: fromYesterday ? false : (a.is_priority ?? false),
      protect: a.is_habit ?? false,
      isCarriedOver: !!(fromYesterday && !a.is_completed)
    }));
    setActivities(mapped);
  };

  const loadMorning = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await getMorningAPI(today);
      const data = parseMorningData(res);
      if (data) applyMorningData(data, today);
    } catch (err) {
      console.log("loadMorning — no checkin yet:", err.message);
      checkinIdRef.current = null;
    } finally { setPageReady(true); }
  };

  const getOrCreateCheckin = async () => {
    if (checkinIdRef.current) return checkinIdRef.current;
    if (isCreatingRef.current) {
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 150));
        if (checkinIdRef.current) return checkinIdRef.current;
      }
      throw new Error("Timed out");
    }
    isCreatingRef.current = true;
    try {
      const today = new Date().toISOString().split("T")[0];
      try {
        const res = await getMorningAPI(today);
        const data = parseMorningData(res);
        if (data?.id) { applyMorningData(data, today); return checkinIdRef.current; }
      } catch { }
      const res = await createMorningAPI({ confidence_rating: confidenceRef.current, activities: [] });
      const data = parseMorningData(res);
      if (!data?.id) throw new Error("No ID in create response");
      checkinIdRef.current = data.id;
      setSavedConfidence(confidenceRef.current);
      return data.id;
    } catch (err) {
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await getMorningAPI(today);
        const data = parseMorningData(res);
        if (data?.id) { applyMorningData(data, today); return checkinIdRef.current; }
      } catch { }
      throw err;
    } finally { isCreatingRef.current = false; }
  };

  const addActivity = async () => {
    if (!newActivity.trim()) { setNewActivityError("Activity name cannot be empty"); return; }
    setNewActivityError(""); setLoading(true);
    try {
      const id = await getOrCreateCheckin();
      const res = await addActivityAPI(id, { title: newActivity.trim(), is_priority: false, is_habit: false });
      const d = res?.data ?? res;
      if (!d?.id) throw new Error("No activity ID in response");
      setActivities(prev => [...prev, { id: d.id, realId: d.id, text: d.title, done: false, priority: false, protect: false, isCarriedOver: false }]);
      setNewActivity("");
      showToast("Activity added", "success");
    } catch (err) { showToast(`Failed to add: ${err.message}`, "error"); }
    finally { setLoading(false); }
  };

  const safeUpdate = (payload) => {
    const cid = checkinIdRef.current;
    if (!cid) return;
    updateMorningAPI(cid, payload).catch(() => showToast("Failed to save change", "error"));
  };

  const toggleDone = (id) => {
    setActivities(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, done: !a.done } : a);
      safeUpdate({ activities: updated.filter(a => !a.isCarriedOver && a.realId).map(a => ({ id: a.realId, is_completed: a.done })) });
      return updated;
    });
  };
  const togglePriority = (id) => {
    setActivities(prev => {
      const updated = prev.map(a => ({ ...a, priority: a.id === id ? !a.priority : false }));
      safeUpdate({ activities: updated.filter(a => !a.isCarriedOver && a.realId).map(a => ({ id: a.realId, is_priority: a.priority })) });
      return updated;
    });
  };
  const toggleProtect = (id) => {
    setActivities(prev => {
      const updated = prev.map(a => ({ ...a, protect: a.id === id ? !a.protect : false }));
      safeUpdate({ activities: updated.filter(a => !a.isCarriedOver && a.realId).map(a => ({ id: a.realId, is_habit: a.protect })) });
      return updated;
    });
  };

  const confirmDelete = (id) => setDeleteTarget(id);
  const doDelete = async () => {
    const target = activities.find(a => a.id === deleteTarget);
    try {
      if (target && !target.isCarriedOver && target.realId) await deleteActivityAPI(target.realId);
      setActivities(prev => prev.filter(a => a.id !== deleteTarget));
    } catch { showToast("Failed to delete", "error"); }
    setDeleteTarget(null);
  };

  const startEdit = (a) => { setEditingId(a.id); setEditText(a.text); };
  const saveEdit = (id) => {
    const text = editText;
    setActivities(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, text } : a);
      const target = updated.find(a => a.id === id);
      if (target && !target.isCarriedOver && target.realId) safeUpdate({ activities: [{ id: target.realId, title: text }] });
      return updated;
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (Number(confidence) === Number(savedConfidence)) { showToast("No changes to save", "warning"); return; }
    setLoading(true);
    try {
      const id = await getOrCreateCheckin();
      await updateMorningAPI(id, { confidence_rating: Number(confidence) });
      setSavedConfidence(confidence);
      showToast("Saved!", "success");
    } catch (err) { showToast(err.message || "Something went wrong", "error"); }
    finally { setLoading(false); }
  };

  const confidenceLabels = ["", "Low", "Fair", "Good", "Great", "Excellent"];
  const sliderPct = ((confidence - 1) / 4) * 100;

  if (!pageReady) return (
    <div className="flex h-screen items-center justify-center" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f0f9ff 100%)" }}>
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f0f9ff 100%)" }}>
      {deleteTarget && <DeleteModal onConfirm={doDelete} onCancel={() => setDeleteTarget(null)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Sidebar activePath="/morning-checkin" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-10 pt-8 pb-4 shrink-0">
          <p className="text-blue-600 text-xs font-semibold uppercase tracking-widest mb-1">Morning Check-in</p>
          <h1 className="text-2xl font-bold text-gray-800 leading-tight">What matters today?</h1>
          <p className="text-gray-400 text-sm mt-1">Set your intentions for the day ahead</p>
          {isFromYesterday && (
            <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-lg">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Showing yesterday's incomplete tasks and protected habits
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-8">
          <div className="flex flex-col gap-5 max-w-2xl">
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
              <div className="mb-3">
                <p className="font-semibold text-gray-700 text-sm">Confidence Rating</p>
                <p className="text-xs text-gray-400 mt-0.5">How ready do you feel today?</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input type="range" min="1" max="5" step="1" value={confidence}
                    onChange={(e) => setConfidence(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, #2563eb ${sliderPct}%, #e5e7eb ${sliderPct}%)` }}
                  />
                  <div className="relative mt-2" style={{ height: "16px" }}>
                    {[1,2,3,4,5].map((n, i) => (
                      <span key={n} className={`absolute text-[10px] -translate-x-1/2 select-none ${confidence === n ? "text-blue-600 font-semibold" : "text-gray-300"}`} style={{ left: `${i * 25}%` }}>{n}</span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 w-16 text-center">
                  <span className="text-sm font-semibold text-blue-600">{confidenceLabels[confidence]}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Morning Activities</label>
              <div className="flex gap-2 mb-4">
                <div className="flex-1 flex flex-col gap-1">
                  <input value={newActivity}
                    onChange={(e) => { setNewActivity(e.target.value); if (newActivityError) setNewActivityError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && addActivity()}
                    placeholder="Add a new activity..." disabled={loading}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-300 outline-none transition ${newActivityError ? "border-red-300 bg-red-50 focus:border-red-400" : "bg-gray-50 border-gray-200 focus:border-blue-300 focus:bg-white"}`}
                  />
                  {newActivityError && <p className="text-red-500 text-xs font-medium pl-1">{newActivityError}</p>}
                </div>
                <button onClick={addActivity} disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm whitespace-nowrap self-start">
                  + Add
                </button>
              </div>
              {activities.length === 0 && <p className="text-gray-300 text-sm text-center py-4">No activities yet.</p>}
              <div className="flex flex-col gap-2">
                {activities.map((a) => (
                  <div key={a.id} className={`flex items-center justify-between px-3.5 py-3 rounded-xl border transition-all ${a.done ? "bg-gray-50 border-gray-100" : a.isCarriedOver ? "bg-amber-50 border-amber-100" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button onClick={() => toggleDone(a.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${a.done ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 hover:border-blue-400"}`}>
                        {a.done && <CheckIcon />}
                      </button>
                      {editingId === a.id ? (
                        <input autoFocus value={editText} onChange={(e) => setEditText(e.target.value)}
                          onBlur={() => saveEdit(a.id)} onKeyDown={(e) => e.key === "Enter" && saveEdit(a.id)}
                          className="flex-1 text-sm bg-white border border-blue-300 rounded-lg px-2 py-1 outline-none text-gray-700" />
                      ) : (
                        <span className={`text-sm truncate ${a.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                          {a.text}{a.isCarriedOver && <span className="ml-2 text-[10px] text-amber-500 font-medium">carried over</span>}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-3 shrink-0">
                      <Tooltip text="Edit"><button onClick={() => startEdit(a)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"><PencilIcon /></button></Tooltip>
                      <Tooltip text="Priority"><button onClick={() => togglePriority(a.id)} className={`p-1.5 rounded-lg transition ${a.priority ? "text-amber-500 bg-amber-50" : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"}`}><StarIcon filled={a.priority} /></button></Tooltip>
                      <Tooltip text="Protect habit"><button onClick={() => toggleProtect(a.id)} className={`p-1.5 rounded-lg transition ${a.protect ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}><ShieldIcon filled={a.protect} /></button></Tooltip>
                      <Tooltip text="Delete"><button onClick={() => confirmDelete(a.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><TrashIcon /></button></Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleSave} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 active:scale-95 text-white py-3 rounded-xl font-medium text-sm shadow-md transition-all">
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MorningCheckin;