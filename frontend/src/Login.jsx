import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAPI, getSettingAPI } from "./api";
import { setToken, isAuthenticated } from "./auth";

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

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ email: false });
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
  const emailValid = emailRegex.test(formData.email);

  const getEmailBorderClass = () => {
    if (!touched.email || formData.email.length === 0) return "border-gray-200 focus:border-gray-400";
    return emailValid ? "border-green-400 focus:border-green-500" : "border-red-400 focus:border-red-500";
  };

  useEffect(() => { if (isAuthenticated()) navigate("/morning-checkin"); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "email") setTouched({ ...touched, email: true });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true });
    let newErrors = {};
    if (!formData.email) newErrors.email = "Email required";
    else if (!emailValid) newErrors.email = "Enter a valid email";
    if (!formData.password) newErrors.password = "Password required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    try {
      const res = await loginAPI(formData);
      const tokenData = res.data;
      setToken(tokenData.access_token);
      localStorage.setItem("refresh_token", tokenData.refresh_token);
      localStorage.setItem("user_email", formData.email);
      try {
        await getSettingAPI();
        navigate("/morning-checkin");
      } catch {
        navigate("/onboarding");
      }
    } catch (err) {
      setErrors({ email: err.message || "Invalid credentials" });
    }
  };

  const EyeOpen = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
  const EyeClosed = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.592M6.53 6.533A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.073 5.267M15 12a3 3 0 01-3 3m0 0a3 3 0 01-2.83-2M3 3l18 18" />
    </svg>
  );

  return (
    <div className="flex h-screen font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="w-1/2 flex justify-center items-center bg-white">
        <div className="w-3/5">
          <h2 className="text-[28px] mb-1">Welcome Back!</h2>
          <p className="text-gray-500 mb-8">Login to continue.</p>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email"
              className={`w-full p-3 mb-1 rounded-lg bg-gray-100 shadow outline-none border-2 transition-colors ${getEmailBorderClass()}`} />
            {touched.email && !emailValid && formData.email.length > 0 && (
              <p className="text-red-500 text-xs mb-2">Enter a valid email address</p>
            )}
            {errors.email && <p className="text-red-500 text-xs mb-2">{errors.email}</p>}
            {!errors.email && !(touched.email && !emailValid && formData.email.length > 0) && <div className="mb-3" />}

            <label className="block text-sm mb-1">Password</label>
            <div className="relative mb-2">
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                placeholder="Enter your password"
                className="w-full p-3 pr-10 bg-gray-100 rounded-lg shadow outline-none border-2 border-gray-200 focus:border-gray-400 transition-colors" />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" tabIndex={-1}>
                {showPassword ? <EyeOpen /> : <EyeClosed />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mb-3">{errors.password}</p>}

            <button type="submit" className="ml-36 w-2/5 p-3 bg-green-700 text-white rounded-lg hover:bg-black transition mt-1">
              Login
            </button>
          </form>

          <p className="mt-4 text-sm ml-36">Don't have an account? <Link to="/signup" className="text-blue-600">Sign Up</Link></p>
        </div>
      </div>

      <div className="w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('https://miro.medium.com/v2/resize:fit:1100/format:webp/0*KztCa4T9Mx6O-UU7')" }} />
    </div>
  );
}

export default Login;