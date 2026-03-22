import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateUserAPI, uploadPhotoAPI, createSettingAPI } from "./api";

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const colors = { success: "bg-green-50 border-green-200 text-green-700", error: "bg-red-50 border-red-200 text-red-700" };
  const icons = {
    success: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    error: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  };
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${colors[type]}`}>
      {icons[type]}{message}
    </div>
  );
}

const DefaultAvatar = () => (
  <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="128" height="128" fill="#e5e7eb"/>
    <circle cx="64" cy="49" r="22" fill="#9ca3af"/>
    <ellipse cx="64" cy="103" rx="36" ry="22" fill="#9ca3af"/>
  </svg>
);

const PencilIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

function Onboarding() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "",
    morningStart: "07:00", morningEnd: "09:00",
    eveningStart: "20:00", eveningEnd: "22:00"
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
  };

  const formatTime = (time) => !time ? null : time.length === 5 ? `${time}:00` : time;

  const formatDisplay = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${period}`;
  };

  const handleSubmit = async () => {
    try {
      if (form.morningEnd <= form.morningStart) { setToast({ message: "Morning end time must be after start time", type: "error" }); return; }
      if (form.eveningEnd <= form.eveningStart) { setToast({ message: "Evening end time must be after start time", type: "error" }); return; }

      const userPayload = { first_name: form.firstName };
      if (form.lastName.trim()) userPayload.last_name = form.lastName.trim();

      await updateUserAPI(userPayload);

      localStorage.setItem("first_name", form.firstName);
      if (form.lastName.trim()) localStorage.setItem("last_name", form.lastName.trim());

      if (photoFile) {
        await uploadPhotoAPI(photoFile);
        localStorage.setItem("photo_url", photoPreview);
      }

      await createSettingAPI({
        morning_start_time: formatTime(form.morningStart),
        morning_end_time: formatTime(form.morningEnd),
        evening_start_time: formatTime(form.eveningStart),
        evening_end_time: formatTime(form.eveningEnd),
        is_morning_reminder_enabled: true,
        is_evening_reminder_enabled: true
      });

      navigate("/morning-checkin");
    } catch (err) {
      console.error("ERROR:", err);
      setToast({ message: err.message || "Something went wrong", type: "error" });
    }
  };

  return (
    <div className="h-screen overflow-hidden font-sans flex flex-col" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #fef9f0 100%)" }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-4xl mx-auto px-8 py-8 w-full flex flex-col h-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Daily Growth OS</h1>
          <p className="text-gray-500 text-sm mt-1">Let's personalize your experience</p>
        </div>

        <div className="flex gap-8 flex-1 min-h-0">
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-7 flex flex-col">
            <h3 className="font-semibold text-gray-800 text-base mb-6">Tell us about yourself</h3>

            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-3">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200">
                  {photoPreview ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" /> : <DefaultAvatar />}
                </div>
                <label className="absolute bottom-0 right-0 w-9 h-9 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center cursor-pointer shadow-md transition">
                  <PencilIcon />
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-gray-400">Click the pencil to upload your photo</p>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                <input name="firstName" placeholder="e.g. Rohit" value={form.firstName} onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400 focus:bg-white transition" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Name <span className="ml-1 text-gray-300 font-normal text-xs">(optional)</span></label>
                <input name="lastName" placeholder="e.g. Varun" value={form.lastName} onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400 focus:bg-white transition" />
              </div>
            </div>
          </div>

          <div className="w-[340px] flex flex-col gap-4">
            <h3 className="font-semibold text-gray-800 text-base">Set your daily rhythm</h3>

            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 flex-1">
              <div className="mb-4">
                <p className="font-semibold text-gray-700 text-sm">Morning Block</p>
                <p className="text-xs text-gray-400">{formatDisplay(form.morningStart)} → {formatDisplay(form.morningEnd)}</p>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium text-amber-600 mb-1 block">Start Time</label>
                  <input type="time" name="morningStart" value={form.morningStart} onChange={handleChange}
                    className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-gray-700 outline-none focus:border-amber-400 focus:bg-white transition cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs font-medium text-amber-600 mb-1 block">End Time</label>
                  <input type="time" name="morningEnd" value={form.morningEnd} onChange={handleChange}
                    className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-gray-700 outline-none focus:border-amber-400 focus:bg-white transition cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5 flex-1">
              <div className="mb-4">
                <p className="font-semibold text-gray-700 text-sm">Evening Block</p>
                <p className="text-xs text-gray-400">{formatDisplay(form.eveningStart)} → {formatDisplay(form.eveningEnd)}</p>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium text-indigo-500 mb-1 block">Start Time</label>
                  <input type="time" name="eveningStart" value={form.eveningStart} onChange={handleChange}
                    className="w-full p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:bg-white transition cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs font-medium text-indigo-500 mb-1 block">End Time</label>
                  <input type="time" name="eveningEnd" value={form.eveningEnd} onChange={handleChange}
                    className="w-full p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-gray-700 outline-none focus:border-indigo-400 focus:bg-white transition cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={handleSubmit}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white px-7 py-3 rounded-xl font-medium text-sm shadow-md transition-all">
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;