import { useState, useEffect } from "react";
import { updateUserAPI, uploadPhotoAPI, getSettingAPI, updateSettingAPI } from "./api";
import Sidebar from "./Sidebar";

const PencilIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>);
const EyeIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);
const TrashIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>);
const DefaultAvatar = () => (<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><rect width="128" height="128" fill="#e5e7eb"/><circle cx="64" cy="49" r="22" fill="#9ca3af"/><ellipse cx="64" cy="103" rx="36" ry="22" fill="#9ca3af"/></svg>);

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

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.25)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-7 w-80 border border-gray-100">
        <h3 className="text-gray-800 font-semibold text-base text-center mb-2">{title}</h3>
        <p className="text-gray-400 text-sm text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition">No, cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition shadow-sm">Yes, save</button>
        </div>
      </div>
    </div>
  );
}

function PhotoModal({ src, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="relative" onClick={e => e.stopPropagation()}>
        <img src={src} alt="Profile" className="w-72 h-72 rounded-full object-cover shadow-2xl border-4 border-white" />
        <button onClick={onClose} className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-gray-500 hover:text-gray-800 transition">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  );
}

const toInputTime = (t) => { if (!t) return ""; return String(t).slice(0, 5); };
const toApiTime = (t) => { if (!t) return null; return t.length === 5 ? `${t}:00` : t; };
const formatDisplay = (t) => {
  if (!t) return "—";
  const [h, m] = String(t).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

function Settings() {
  const [firstName, setFirstName] = useState(localStorage.getItem("first_name") || "");
  const [lastName, setLastName] = useState(localStorage.getItem("last_name") || "");
  const [photoUrl, setPhotoUrl] = useState(localStorage.getItem("photo_url") || null);
  const [editingFirstName, setEditingFirstName] = useState(false);
  const [editingLastName, setEditingLastName] = useState(false);
  const [editingRhythm, setEditingRhythm] = useState(false);
  const [tempFirstName, setTempFirstName] = useState("");
  const [tempLastName, setTempLastName] = useState("");
  const [tempRhythm, setTempRhythm] = useState({ morningStart: "", morningEnd: "", eveningStart: "", eveningEnd: "" });
  const [rhythm, setRhythm] = useState({ morningStart: "", morningEnd: "", eveningStart: "", eveningEnd: "" });
  const [rhythmErrors, setRhythmErrors] = useState({});
  const [confirmModal, setConfirmModal] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const res = await getSettingAPI();
      const d = res?.data ?? res;
      setRhythm({
        morningStart: toInputTime(d.morning_start_time),
        morningEnd: toInputTime(d.morning_end_time),
        eveningStart: toInputTime(d.evening_start_time),
        eveningEnd: toInputTime(d.evening_end_time),
      });
    } catch (err) { console.error("loadSettings failed:", err.message); }
  };

  const startEditFirstName = () => { setTempFirstName(firstName); setEditingFirstName(true); };
  const requestSaveFirstName = () => {
    if (!tempFirstName.trim()) { showToast("First name cannot be empty", "error"); return; }
    if (tempFirstName.trim().length < 2) { showToast("First name must be at least 2 characters", "error"); return; }
    if (tempFirstName.trim().length > 20) { showToast("First name cannot exceed 20 characters", "error"); return; }
    setConfirmModal({
      title: "Save First Name?",
      message: `Update your first name to "${tempFirstName.trim()}"?`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await updateUserAPI({ first_name: tempFirstName.trim() });
          setFirstName(tempFirstName.trim());
          localStorage.setItem("first_name", tempFirstName.trim());
          setEditingFirstName(false);
          showToast("First name updated", "success");
        } catch (err) { showToast(err.message || "Failed to update", "error"); }
      }
    });
  };

  const startEditLastName = () => { setTempLastName(lastName); setEditingLastName(true); };
  const requestSaveLastName = () => {
    if (tempLastName.trim() && tempLastName.trim().length < 2) { showToast("Last name must be at least 2 characters", "error"); return; }
    if (tempLastName.trim().length > 20) { showToast("Last name cannot exceed 20 characters", "error"); return; }
    setConfirmModal({
      title: "Save Last Name?",
      message: `Update your last name to "${tempLastName.trim() || "(empty)"}"?`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const payload = {};
          if (tempLastName.trim()) payload.last_name = tempLastName.trim();
          await updateUserAPI(payload);
          setLastName(tempLastName.trim());
          localStorage.setItem("last_name", tempLastName.trim());
          setEditingLastName(false);
          showToast("Last name updated", "success");
        } catch (err) { showToast(err.message || "Failed to update", "error"); }
      }
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setConfirmModal({
      title: "Update Profile Picture?",
      message: "Upload this photo as your profile picture?",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await uploadPhotoAPI(file);
          setPhotoUrl(preview);
          localStorage.setItem("photo_url", preview);
          showToast("Profile picture updated", "success");
        } catch (err) { showToast(err.message || "Failed to upload", "error"); }
      }
    });
  };

  const handleRemovePhoto = () => {
    setConfirmModal({
      title: "Remove Profile Picture?",
      message: "Your profile picture will be removed.",
      onConfirm: async () => {
        setConfirmModal(null);
        setPhotoUrl(null);
        localStorage.removeItem("photo_url");
        showToast("Profile picture removed", "success");
      }
    });
  };

  const startEditRhythm = () => { setTempRhythm({ ...rhythm }); setRhythmErrors({}); setEditingRhythm(true); };

  const validateRhythm = (r) => {
    const errs = {};
    if (!r.morningStart) errs.morningStart = "Required";
    if (!r.morningEnd) errs.morningEnd = "Required";
    if (!r.eveningStart) errs.eveningStart = "Required";
    if (!r.eveningEnd) errs.eveningEnd = "Required";
    if (r.morningStart && r.morningEnd && r.morningEnd <= r.morningStart) errs.morningEnd = "End must be after start";
    if (r.eveningStart && r.eveningEnd && r.eveningEnd <= r.eveningStart) errs.eveningEnd = "End must be after start";
    if (r.morningEnd && r.eveningStart && r.morningEnd > r.eveningStart) errs.eveningStart = "Evening must start after morning ends";
    return errs;
  };

  const requestSaveRhythm = () => {
    const errs = validateRhythm(tempRhythm);
    if (Object.keys(errs).length > 0) { setRhythmErrors(errs); return; }
    setRhythmErrors({});
    setConfirmModal({
      title: "Save Daily Rhythm?",
      message: "Update your morning and evening time windows?",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await updateSettingAPI({
            morning_start_time: toApiTime(tempRhythm.morningStart),
            morning_end_time: toApiTime(tempRhythm.morningEnd),
            evening_start_time: toApiTime(tempRhythm.eveningStart),
            evening_end_time: toApiTime(tempRhythm.eveningEnd),
          });
          setRhythm({ ...tempRhythm });
          setEditingRhythm(false);
          showToast("Daily rhythm updated", "success");
        } catch (err) { showToast(err.message || "Failed to update", "error"); }
      }
    });
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f0f9ff 100%)" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirmModal && <ConfirmModal title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(null)} />}
      {showPhotoModal && photoUrl && <PhotoModal src={photoUrl} onClose={() => setShowPhotoModal(false)} />}

      <Sidebar activePath="/settings" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-10 pt-8 pb-4 shrink-0">
          <p className="text-blue-600 text-xs font-semibold uppercase tracking-widest mb-1">Settings</p>
          <h1 className="text-2xl font-bold text-gray-800 leading-tight">Your Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your account and preferences</p>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-10">
          <div className="max-w-2xl flex flex-col gap-4">

            {/* Profile Picture */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Profile Picture</p>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200 shrink-0">
                  {photoUrl ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" /> : <DefaultAvatar />}
                </div>
                <div className="flex flex-wrap gap-2">
                  {photoUrl && (
                    <button onClick={() => setShowPhotoModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition">
                      <EyeIcon />View
                    </button>
                  )}
                  <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition cursor-pointer">
                    <PencilIcon />{photoUrl ? "Change" : "Upload"}
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                  {photoUrl && (
                    <button onClick={handleRemovePhoto} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition">
                      <TrashIcon />Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* First Name */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">First Name</p>
                  {editingFirstName ? (
                    <input autoFocus value={tempFirstName} onChange={e => setTempFirstName(e.target.value)} onKeyDown={e => e.key === "Enter" && requestSaveFirstName()} placeholder="Enter first name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-300 focus:bg-white transition" />
                  ) : (
                    <p className="text-gray-800 text-sm font-medium">{firstName || <span className="text-gray-300 font-normal">Not set</span>}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 mt-5">
                  {editingFirstName ? (
                    <>
                      <button onClick={() => setEditingFirstName(false)} className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 transition">Cancel</button>
                      <button onClick={requestSaveFirstName} className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition shadow-sm">Save</button>
                    </>
                  ) : (
                    <button onClick={startEditFirstName} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition"><PencilIcon />Edit</button>
                  )}
                </div>
              </div>
            </div>

            {/* Last Name */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Last Name <span className="ml-1 text-gray-300 font-normal normal-case tracking-normal">(optional)</span></p>
                  {editingLastName ? (
                    <input autoFocus value={tempLastName} onChange={e => setTempLastName(e.target.value)} onKeyDown={e => e.key === "Enter" && requestSaveLastName()} placeholder="Enter last name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-300 focus:bg-white transition" />
                  ) : (
                    <p className="text-gray-800 text-sm font-medium">{lastName || <span className="text-gray-300 font-normal">Not set</span>}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 mt-5">
                  {editingLastName ? (
                    <>
                      <button onClick={() => setEditingLastName(false)} className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 transition">Cancel</button>
                      <button onClick={requestSaveLastName} className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition shadow-sm">Save</button>
                    </>
                  ) : (
                    <button onClick={startEditLastName} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition"><PencilIcon />Edit</button>
                  )}
                </div>
              </div>
            </div>

            {/* Daily Rhythm */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Daily Rhythm</p>
                  <p className="text-xs text-gray-400 mt-0.5">Your morning and evening check-in windows</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {editingRhythm ? (
                    <>
                      <button onClick={() => { setEditingRhythm(false); setRhythmErrors({}); }} className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 transition">Cancel</button>
                      <button onClick={requestSaveRhythm} className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition shadow-sm">Save</button>
                    </>
                  ) : (
                    <button onClick={startEditRhythm} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition"><PencilIcon />Edit</button>
                  )}
                </div>
              </div>

              {editingRhythm ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-600 mb-3">Morning Block</p>
                    <div className="flex flex-col gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-amber-600 mb-1 block">Start Time</label>
                        <input type="time" value={tempRhythm.morningStart} onChange={e => { setTempRhythm(p => ({ ...p, morningStart: e.target.value })); setRhythmErrors(p => ({ ...p, morningStart: "" })); }}
                          className={`w-full p-2.5 bg-white border rounded-xl text-sm text-gray-700 outline-none transition cursor-pointer ${rhythmErrors.morningStart ? "border-red-400" : "border-amber-200 focus:border-amber-400"}`} />
                        {rhythmErrors.morningStart && <p className="text-red-500 text-[10px] mt-1">{rhythmErrors.morningStart}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-amber-600 mb-1 block">End Time</label>
                        <input type="time" value={tempRhythm.morningEnd} onChange={e => { setTempRhythm(p => ({ ...p, morningEnd: e.target.value })); setRhythmErrors(p => ({ ...p, morningEnd: "" })); }}
                          className={`w-full p-2.5 bg-white border rounded-xl text-sm text-gray-700 outline-none transition cursor-pointer ${rhythmErrors.morningEnd ? "border-red-400" : "border-amber-200 focus:border-amber-400"}`} />
                        {rhythmErrors.morningEnd && <p className="text-red-500 text-[10px] mt-1">{rhythmErrors.morningEnd}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-indigo-600 mb-3">Evening Block</p>
                    <div className="flex flex-col gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-indigo-500 mb-1 block">Start Time</label>
                        <input type="time" value={tempRhythm.eveningStart} onChange={e => { setTempRhythm(p => ({ ...p, eveningStart: e.target.value })); setRhythmErrors(p => ({ ...p, eveningStart: "" })); }}
                          className={`w-full p-2.5 bg-white border rounded-xl text-sm text-gray-700 outline-none transition cursor-pointer ${rhythmErrors.eveningStart ? "border-red-400" : "border-indigo-200 focus:border-indigo-400"}`} />
                        {rhythmErrors.eveningStart && <p className="text-red-500 text-[10px] mt-1">{rhythmErrors.eveningStart}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-indigo-500 mb-1 block">End Time</label>
                        <input type="time" value={tempRhythm.eveningEnd} onChange={e => { setTempRhythm(p => ({ ...p, eveningEnd: e.target.value })); setRhythmErrors(p => ({ ...p, eveningEnd: "" })); }}
                          className={`w-full p-2.5 bg-white border rounded-xl text-sm text-gray-700 outline-none transition cursor-pointer ${rhythmErrors.eveningEnd ? "border-red-400" : "border-indigo-200 focus:border-indigo-400"}`} />
                        {rhythmErrors.eveningEnd && <p className="text-red-500 text-[10px] mt-1">{rhythmErrors.eveningEnd}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-600 mb-2">Morning Block</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between"><span className="text-[11px] text-gray-500">Start</span><span className="text-sm font-medium text-gray-700">{formatDisplay(rhythm.morningStart)}</span></div>
                      <div className="flex items-center justify-between"><span className="text-[11px] text-gray-500">End</span><span className="text-sm font-medium text-gray-700">{formatDisplay(rhythm.morningEnd)}</span></div>
                    </div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-indigo-600 mb-2">Evening Block</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between"><span className="text-[11px] text-gray-500">Start</span><span className="text-sm font-medium text-gray-700">{formatDisplay(rhythm.eveningStart)}</span></div>
                      <div className="flex items-center justify-between"><span className="text-[11px] text-gray-500">End</span><span className="text-sm font-medium text-gray-700">{formatDisplay(rhythm.eveningEnd)}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
