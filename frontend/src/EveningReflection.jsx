import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createEveningAPI, updateEveningAPI, getEveningAPI } from "./api";
import Sidebar from "./Sidebar";

function UnsavedModal({ onSave, onDiscard, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.25)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-7 w-80 border border-gray-100">
        <h3 className="text-gray-800 font-semibold text-base text-center mb-2">Unsaved Changes</h3>
        <p className="text-gray-400 text-sm text-center mb-6">You have unsaved changes. What would you like to do?</p>
        <div className="flex flex-col gap-2">
          <button onClick={onSave} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition shadow-sm">Save & Continue</button>
          <button onClick={onDiscard} className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition">Discard Changes</button>
          <button onClick={onCancel} className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 transition">Stay on Page</button>
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
  return <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${colors[type]}`}>{icons[type]}{message}</div>;
}

// The default form — used both as initial state AND as "last saved" baseline
// so hasChanges starts as false on page load
const DEFAULT_FORM = { win: "", lesson: "", mistake: "", distraction: "", mood_rating: 2, energy_rating: 2 };

function EveningReflection() {
  const navigate = useNavigate();
  const [eveningId, setEveningId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  // savedForm initialised to DEFAULT_FORM (not null) — hasChanges will be false until user edits
  const [savedForm, setSavedForm] = useState(DEFAULT_FORM);
  const [toast, setToast] = useState(null);
  const [unsavedModal, setUnsavedModal] = useState(null);
  const [pageReady, setPageReady] = useState(false);
  const pendingNavRef = useRef(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  useEffect(() => { loadEvening(); }, []);

  const loadEvening = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await getEveningAPI(today);
      const data = res?.data ?? res;
      if (data?.id) {
        setEveningId(data.id);
        const loaded = {
          win: data.win || "",
          lesson: data.lesson || "",
          mistake: data.mistake || "",
          distraction: data.distraction || "",
          mood_rating: data.mood_rating ?? 2,
          energy_rating: data.energy_rating ?? 2,
        };
        // Set both form and savedForm to the loaded data — hasChanges stays false
        setForm(loaded);
        setSavedForm(loaded);
      }
      // If no evening yet, both form and savedForm remain DEFAULT_FORM → hasChanges = false
    } catch {
      console.log("No evening yet");
    } finally {
      setPageReady(true);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // True only when form differs from last-saved state
  const hasChanges = JSON.stringify(form) !== JSON.stringify(savedForm);

  const handleSave = async () => {
    if (!hasChanges) return;
    try {
      if (!eveningId) {
        const res = await createEveningAPI(form);
        const data = res?.data ?? res;
        if (data?.id) setEveningId(data.id);
        // After create, re-sync savedForm
        setSavedForm({ ...form });
        showToast("Evening reflection submitted!", "success");
      } else {
        await updateEveningAPI(eveningId, form);
        setSavedForm({ ...form });
        showToast("Saved!", "success");
      }
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
    }
  };

  const handleNavigate = (path) => {
    if (hasChanges) {
      pendingNavRef.current = path;
      setUnsavedModal({
        onSave: async () => { setUnsavedModal(null); await handleSave(); navigate(pendingNavRef.current); },
        onDiscard: () => { setUnsavedModal(null); navigate(pendingNavRef.current); },
        onCancel: () => { setUnsavedModal(null); pendingNavRef.current = null; },
      });
    } else {
      navigate(path);
    }
  };

  const moodLabels = ["", "Low", "Fair", "Good", "Great", "Excellent"];
  const energyLabels = ["", "Drained", "Tired", "Steady", "Energised", "Charged"];

  if (!pageReady) return (
    <div className="flex h-screen items-center justify-center" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f0f9ff 100%)" }}>
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f0f9ff 100%)" }}>
      {unsavedModal && <UnsavedModal onSave={unsavedModal.onSave} onDiscard={unsavedModal.onDiscard} onCancel={unsavedModal.onCancel} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Sidebar activePath="/evening-reflection" onNavigate={handleNavigate} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-10 pt-8 pb-4 shrink-0">
          <p className="text-blue-600 text-xs font-semibold uppercase tracking-widest mb-1">Evening Reflection</p>
          <h1 className="text-2xl font-bold text-gray-800 leading-tight">Observe before ending the day</h1>
          <p className="text-gray-400 text-sm mt-1">Reflect on your day and set intentions for tomorrow</p>
        </div>

        <div className="flex-1 flex gap-8 px-10 pb-8 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-1">
            {[
              { name: "win", label: "Today's Win", placeholder: "What went well today?" },
              { name: "lesson", label: "Lesson Learned", placeholder: "What did you learn?" },
              { name: "mistake", label: "Today's Mistake", placeholder: "What would you do differently?" },
              { name: "distraction", label: "Primary Distraction", placeholder: "What pulled your focus?" },
            ].map(({ name, label, placeholder }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                <textarea
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  rows={2}
                  style={{ resize: "none", overflow: "hidden", fieldSizing: "content" }}
                  onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-300 focus:bg-white transition min-h-[72px]"
                />
              </div>
            ))}
          </div>

          <div className="w-[300px] shrink-0 flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 flex flex-col justify-between">
              <div className="mb-4">
                <p className="font-semibold text-gray-700 text-sm">Mood Rating</p>
                <p className="text-xs text-gray-400 mt-0.5">How are you feeling tonight?</p>
              </div>
              <div className="flex justify-between mb-3">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setForm({ ...form, mood_rating: n })}
                    className={`w-10 h-10 rounded-full text-sm font-semibold transition-all border-2 ${form.mood_rating === n ? "bg-blue-500 border-blue-500 text-white shadow-md scale-110" : "border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-400"}`}>
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs font-medium text-blue-500">{moodLabels[form.mood_rating]}</p>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 flex flex-col justify-between">
              <div className="mb-4">
                <p className="font-semibold text-gray-700 text-sm">Energy Level</p>
                <p className="text-xs text-gray-400 mt-0.5">How was your energy today?</p>
              </div>
              <div className="flex justify-between mb-3">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setForm({ ...form, energy_rating: n })}
                    className={`w-10 h-10 rounded-full text-sm font-semibold transition-all border-2 ${form.energy_rating === n ? "bg-blue-500 border-blue-500 text-white shadow-md scale-110" : "border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-400"}`}>
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs font-medium text-blue-500">{energyLabels[form.energy_rating]}</p>
            </div>

            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`w-full py-3 rounded-xl font-medium text-sm shadow-md transition-all ${
                hasChanges
                  ? "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white"
                  : "bg-blue-200 text-blue-100 cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EveningReflection;