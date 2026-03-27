import { useState, useEffect, useRef, useCallback } from "react";
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

const TEXT_TRUNCATE_LENGTH = 150;

const DEFAULT_FORM = { win: "", lesson: "", mistake: "", distraction: "", mood_rating: null, energy_rating: null };

// Local date YYYY-MM-DD (matches backend's date.today())
function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Build form object from backend response data
function buildFormFromData(data) {
  return {
    win: data.win || "",
    lesson: data.lesson || "",
    mistake: data.mistake || "",
    distraction: data.distraction || "",
    mood_rating: data.mood_rating != null ? Number(data.mood_rating) : null,
    energy_rating: data.energy_rating != null ? Number(data.energy_rating) : null,
  };
}

function EveningReflection() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [savedForm, setSavedForm] = useState({ ...DEFAULT_FORM });
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [saving, setSaving] = useState(false);

  // Refs for stable access in callbacks (avoids stale closures)
  const eveningIdRef = useRef(null);
  const formRef = useRef({ ...DEFAULT_FORM });
  const savedFormRef = useRef({ ...DEFAULT_FORM });
  const pendingNavRef = useRef(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  // Keep refs in sync with state
  const updateForm = useCallback((next) => {
    setForm(next);
    formRef.current = next;
  }, []);

  const updateSavedForm = useCallback((next) => {
    setSavedForm(next);
    savedFormRef.current = next;
  }, []);

  const updateEveningId = useCallback((id) => {
    eveningIdRef.current = id;
  }, []);

  // --- Load evening on mount ---
  useEffect(() => {
    (async () => {
      try {
        const res = await getEveningAPI(getToday());
        const data = res?.data ?? res;
        if (data?.id) {
          updateEveningId(data.id);
          const loaded = buildFormFromData(data);
          updateForm(loaded);
          updateSavedForm({ ...loaded });
        }
      } catch {
        // No evening for today — that's fine, start fresh
      } finally {
        setPageReady(true);
      }
    })();
  }, []);

  // --- Derived (compare trimmed text so trailing whitespace doesn't count) ---
  const hasChanges = form.win.trim() !== savedForm.win.trim() ||
    form.lesson.trim() !== savedForm.lesson.trim() ||
    form.mistake.trim() !== savedForm.mistake.trim() ||
    form.distraction.trim() !== savedForm.distraction.trim() ||
    form.mood_rating !== savedForm.mood_rating ||
    form.energy_rating !== savedForm.energy_rating;

  useEffect(() => {
    const onBeforeUnload = (e) => { if (hasChanges) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasChanges]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      formRef.current = next;
      return next;
    });
  };

  const setRating = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      formRef.current = next;
      return next;
    });
  };

  // --- Save (uses refs so it's safe from stale closures) ---
  const handleSave = useCallback(async () => {
    const currentForm = formRef.current;
    const currentSaved = savedFormRef.current;
    const currentId = eveningIdRef.current;

    // No changes → nothing to do (compare trimmed text)
    const textSame = ["win", "lesson", "mistake", "distraction"].every(k => currentForm[k].trim() === currentSaved[k].trim());
    if (textSame && currentForm.mood_rating === currentSaved.mood_rating && currentForm.energy_rating === currentSaved.energy_rating) return true;

    // Validate text fields
    const textFields = ["win", "lesson", "mistake", "distraction"];
    for (const field of textFields) {
      const val = currentForm[field].trim();
      if (val.length < 2) {
        showToast("All fields must be at least 2 characters", "error");
        return false;
      }
      if (val.length > 2000) {
        showToast("Fields cannot exceed 2000 characters", "error");
        return false;
      }
    }

    // Validate ratings
    if (currentForm.mood_rating == null) {
      showToast("Please select a mood rating", "error");
      return false;
    }
    if (currentForm.energy_rating == null) {
      showToast("Please select an energy level", "error");
      return false;
    }

    setSaving(true);
    try {
      // Build full payload for create, or diff-only payload for update
      const fullPayload = {
        win: currentForm.win.trim(),
        lesson: currentForm.lesson.trim(),
        mistake: currentForm.mistake.trim(),
        distraction: currentForm.distraction.trim(),
        mood_rating: currentForm.mood_rating != null ? Number(currentForm.mood_rating) : null,
        energy_rating: currentForm.energy_rating != null ? Number(currentForm.energy_rating) : null,
      };

      let responseData;

      if (!currentId) {
        // CREATE — send everything
        const res = await createEveningAPI(fullPayload);
        responseData = res?.data ?? res;
        if (!responseData?.id) throw new Error("Failed to create evening reflection");
        updateEveningId(responseData.id);
        showToast("Evening reflection saved!", "success");
      } else {
        // UPDATE — only send changed fields
        const patch = {};
        if (fullPayload.win !== currentSaved.win.trim()) patch.win = fullPayload.win;
        if (fullPayload.lesson !== currentSaved.lesson.trim()) patch.lesson = fullPayload.lesson;
        if (fullPayload.mistake !== currentSaved.mistake.trim()) patch.mistake = fullPayload.mistake;
        if (fullPayload.distraction !== currentSaved.distraction.trim()) patch.distraction = fullPayload.distraction;
        if (fullPayload.mood_rating !== currentSaved.mood_rating) patch.mood_rating = fullPayload.mood_rating;
        if (fullPayload.energy_rating !== currentSaved.energy_rating) patch.energy_rating = fullPayload.energy_rating;
        const res = await updateEveningAPI(currentId, patch);
        responseData = res?.data ?? res;
        showToast("Saved!", "success");
      }

      // Sync form + savedForm from backend response (source of truth)
      if (responseData?.id) {
        const synced = buildFormFromData(responseData);
        updateForm(synced);
        updateSavedForm({ ...synced });
      } else {
        // Fallback: use the trimmed payload as saved baseline
        updateForm({ ...fullPayload });
        updateSavedForm({ ...fullPayload });
      }

      return true;
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  // --- Navigation with unsaved-changes guard ---
  const handleNavigate = useCallback((path) => {
    const f = formRef.current; const s = savedFormRef.current;
    const changed = ["win", "lesson", "mistake", "distraction"].some(k => f[k].trim() !== s[k].trim()) || f.mood_rating !== s.mood_rating || f.energy_rating !== s.energy_rating;
    if (changed) {
      pendingNavRef.current = path;
      setShowModal(true);
    } else {
      navigate(path);
    }
  }, [navigate]);

  // Modal actions — always read latest via refs
  const onModalSave = useCallback(async () => {
    setShowModal(false);
    const saved = await handleSave();
    if (saved) navigate(pendingNavRef.current);
  }, [handleSave, navigate]);

  const onModalDiscard = useCallback(() => {
    setShowModal(false);
    navigate(pendingNavRef.current);
  }, [navigate]);

  const onModalCancel = useCallback(() => {
    setShowModal(false);
    pendingNavRef.current = null;
  }, []);

  // --- Labels ---
  const moodLabels = ["", "Low", "Fair", "Good", "Great", "Excellent"];
  const energyLabels = ["", "Drained", "Tired", "Steady", "Energised", "Charged"];

  const textareaRefs = useRef({});
  const [focusedField, setFocusedField] = useState(null);
  const [expandedField, setExpandedField] = useState(null);

  const saveDisabled = !hasChanges || saving;

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f0f9ff 100%)" }}>
      {showModal && <UnsavedModal onSave={onModalSave} onDiscard={onModalDiscard} onCancel={onModalCancel} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Sidebar activePath="/evening-reflection" onNavigate={handleNavigate} />

      {!pageReady ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-10 pt-8 pb-4 shrink-0">
            <div className="h-3 w-32 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="h-6 w-64 bg-gray-200 rounded-lg animate-pulse mb-1" />
            <div className="h-3 w-52 bg-gray-100 rounded-lg animate-pulse mt-1" />
          </div>
          <div className="flex-1 flex gap-8 px-10 pb-8 overflow-hidden min-h-0">
            <div className="flex-1 flex flex-col gap-5 pr-1">
              {[1,2,3,4].map(n => (
                <div key={n} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
                  <div className="h-4 w-28 bg-gray-100 rounded-lg mb-3" />
                  <div className="h-16 w-full bg-gray-50 rounded-xl" />
                </div>
              ))}
            </div>
            <div className="w-[300px] shrink-0 flex flex-col gap-5">
              {[1,2].map(n => (
                <div key={n} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
                  <div className="h-4 w-24 bg-gray-100 rounded-lg mb-2" />
                  <div className="h-3 w-40 bg-gray-50 rounded-lg mb-4" />
                  <div className="flex justify-between mb-3">
                    {[1,2,3,4,5].map(i => <div key={i} className="w-10 h-10 bg-gray-100 rounded-full" />)}
                  </div>
                </div>
              ))}
              <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      ) : <main className="flex-1 flex flex-col overflow-hidden" onClick={() => { if (expandedField) setExpandedField(null); }}>
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
            ].map(({ name, label, placeholder }) => {
              const text = form[name];
              const isFocused = focusedField === name;
              const isExpanded = expandedField === name;
              const isLong = text.length > TEXT_TRUNCATE_LENGTH;
              return (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                {isFocused ? (
                  <textarea
                    ref={(el) => { textareaRefs.current[name] = el; if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; } }}
                    autoFocus
                    id={name}
                    name={name}
                    value={text}
                    onChange={handleChange}
                    onBlur={() => setFocusedField(null)}
                    placeholder={placeholder}
                    maxLength={2000}
                    rows={2}
                    style={{ resize: "none", overflow: "hidden" }}
                    onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-300 focus:bg-white transition min-h-[72px]"
                  />
                ) : (
                  <div
                    onClick={() => { setFocusedField(name); setExpandedField(null); }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm min-h-[72px] cursor-text"
                  >
                    {text ? (
                      <span className="text-gray-700 whitespace-pre-wrap break-words">
                        {isLong && !isExpanded ? `${text.slice(0, TEXT_TRUNCATE_LENGTH)}...` : text}
                      </span>
                    ) : (
                      <span className="text-gray-300">{placeholder}</span>
                    )}
                  </div>
                )}
                {!isFocused && isLong && (
                  <button onClick={(e) => { e.stopPropagation(); setExpandedField(prev => prev === name ? null : name); }}
                    className="text-blue-500 hover:text-blue-600 text-xs font-medium mt-1">
                    {isExpanded ? "show less" : "show more"}
                  </button>
                )}
              </div>
            )})}
          </div>

          <div className="w-[300px] shrink-0 flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 flex flex-col justify-between">
              <div className="mb-4">
                <p className="font-semibold text-gray-700 text-sm">Mood Rating</p>
                <p className="text-xs text-gray-400 mt-0.5">How are you feeling tonight?</p>
              </div>
              <div className="flex justify-between mb-3">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setRating("mood_rating", n)}
                    className={`w-10 h-10 rounded-full text-sm font-semibold transition-all border-2 ${form.mood_rating === n ? "bg-blue-500 border-blue-500 text-white shadow-md scale-110" : "border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-400"}`}>
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs font-medium text-blue-500">{form.mood_rating != null ? moodLabels[form.mood_rating] : <span className="text-gray-300">Select a rating</span>}</p>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 flex flex-col justify-between">
              <div className="mb-4">
                <p className="font-semibold text-gray-700 text-sm">Energy Level</p>
                <p className="text-xs text-gray-400 mt-0.5">How was your energy today?</p>
              </div>
              <div className="flex justify-between mb-3">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setRating("energy_rating", n)}
                    className={`w-10 h-10 rounded-full text-sm font-semibold transition-all border-2 ${form.energy_rating === n ? "bg-blue-500 border-blue-500 text-white shadow-md scale-110" : "border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-400"}`}>
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs font-medium text-blue-500">{form.energy_rating != null ? energyLabels[form.energy_rating] : <span className="text-gray-300">Select a level</span>}</p>
            </div>

            <button
              onClick={handleSave}
              disabled={saveDisabled}
              className={`w-full py-3 rounded-xl font-medium text-sm shadow-md transition-all ${
                !saveDisabled
                  ? "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white"
                  : "bg-blue-200 text-blue-100 cursor-not-allowed"
              }`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </main>}
    </div>
  );
}

export default EveningReflection;
