import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMorningAPI, getEveningAPI, getSkillsAPI, getUserAPI } from "./api";
import Sidebar from "./Sidebar";
import RightPanel, { getLocalToday, getLast30Days } from "./RightPanel";

// ── Activity Calendar ─────────────────────────────────────────────────────────
function ActivityCalendar({ calendarData, loading }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDOW = new Date(year, month, 1).getDay();
  const offset = (firstDOW + 6) % 7;
  const today = getLocalToday();

  const getColor = (dateStr) => {
    const count = calendarData[dateStr] || 0;
    const isToday = dateStr === today;
    if (count === 0) return isToday ? "bg-blue-100 ring-1 ring-blue-300 ring-offset-0" : "bg-gray-100";
    if (count === 1) return "bg-green-200";
    if (count === 2) return "bg-green-400";
    return "bg-green-600";
  };

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    cells.push(`${year}-${mm}-${dd}`);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm font-semibold text-gray-700 mb-1">
        Activity Calendar
      </p>
      <p className="text-xs text-gray-400 mb-4">
        {now.toLocaleDateString("en-GB", { month: "long", year: "numeric" })} — activities completed per day
      </p>

      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-md bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["M","T","W","T","F","S","S"].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-semibold text-gray-400">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((dateStr, i) =>
              dateStr ? (
                <div key={i}
                  title={`${dateStr}: ${calendarData[dateStr] || 0} completed`}
                  className={`aspect-square rounded-md ${getColor(dateStr)} transition-all cursor-default`}
                />
              ) : <div key={i} />
            )}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] text-gray-400">Less</span>
            {["bg-gray-100","bg-green-200","bg-green-400","bg-green-600"].map((c, i) => (
              <div key={i} className={`w-3.5 h-3.5 rounded-sm ${c}`} />
            ))}
            <span className="text-[10px] text-gray-400">More</span>
          </div>
        </>
      )}
    </div>
  );
}

// ── Quote Box ─────────────────────────────────────────────────────────────────
function QuoteBox() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem("dashboard_quote");
    if (cached) {
      try { setQuote(JSON.parse(cached)); } catch { }
      setLoading(false);
      return;
    }
    fetchQuote();
  }, []);

  const fetchQuote = async () => {
    setLoading(true);
    const fallbacks = [
      { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
      { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
      { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
      { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
      { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
      { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
      { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    ];
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch("https://api.quotable.io/random?maxLength=120", { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      const q = { text: data.content, author: data.author };
      setQuote(q);
      sessionStorage.setItem("dashboard_quote", JSON.stringify(q));
    } catch {
      const q = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      setQuote(q);
      sessionStorage.setItem("dashboard_quote", JSON.stringify(q));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
      <p className="text-xs font-semibold text-gray-700 mb-3">Daily Quote</p>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded animate-pulse w-full mx-auto" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5 mx-auto" />
          <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/2 mx-auto mt-2" />
        </div>
      ) : quote ? (
        <>
          <p className="text-sm text-gray-500 italic leading-relaxed">"{quote.text}"</p>
          <p className="text-xs text-gray-400 font-medium mt-2">— {quote.author}</p>
        </>
      ) : null}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    complete:      { label: "Complete",     cls: "bg-green-100 text-green-700" },
    "in-progress": { label: "In Progress",  cls: "bg-blue-100 text-blue-600" },
    incomplete:    { label: "Not Started",  cls: "bg-gray-100 text-gray-500" },
  };
  const s = map[status] || map.incomplete;
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
}

// ── Summary Card ──────────────────────────────────────────────────────────────
function SummaryCard({ title, status, progress, icon, color, onClick }) {
  const bgMap = {
    blue:   "from-blue-500 to-blue-600",
    orange: "from-orange-400 to-orange-500",
    green:  "from-emerald-500 to-emerald-600",
    amber:  "from-amber-400 to-amber-500",
  };
  return (
    <button onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br ${bgMap[color]} text-white shadow-sm`}>
      <p className="text-sm font-bold mb-1">{title}</p>
      {progress !== undefined && (
        <div className="mt-2 mb-1">
          <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-white/80 mt-1">{progress}% done</p>
        </div>
      )}
      <div className="mt-2"><StatusBadge status={status} /></div>
      <div className="absolute right-4 bottom-3 text-4xl opacity-25 select-none">{icon}</div>
    </button>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(localStorage.getItem("first_name") || "");
  const [loading, setLoading] = useState(true);
  const [calLoading, setCalLoading] = useState(true);

  const [morningData, setMorningData] = useState(null);
  const [eveningData, setEveningData] = useState(null);
  const [skillsData, setSkillsData] = useState([]);
  const [calendarData, setCalendarData] = useState({});

  const today = getLocalToday();

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [morningRes, eveningRes, skillsRes, userRes] = await Promise.allSettled([
        getMorningAPI(today),
        getEveningAPI(today),
        getSkillsAPI(),
        getUserAPI(),
      ]);

      const morning = morningRes.status === "fulfilled" ? (morningRes.value?.data ?? morningRes.value) : null;
      const evening = eveningRes.status === "fulfilled" ? (eveningRes.value?.data ?? eveningRes.value) : null;
      const skillsRaw = skillsRes.status === "fulfilled"
        ? (skillsRes.value?.data?.skills || skillsRes.value?.skills || []) : [];
      const user = userRes.status === "fulfilled" ? (userRes.value?.data ?? userRes.value) : null;

      setMorningData(morning?.id ? morning : null);
      setEveningData(evening?.id ? evening : null);
      setSkillsData(skillsRaw);

      if (user?.first_name) {
        setFirstName(user.first_name);
        localStorage.setItem("first_name", user.first_name);
        if (user.last_name) localStorage.setItem("last_name", user.last_name);
        if (user.profile_pic_url) localStorage.setItem("photo_url", user.profile_pic_url);
      }
    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setLoading(false);
    }
  }, [today]);

  const loadCalendar = useCallback(async () => {
    setCalLoading(true);
    try {
      const last30 = getLast30Days();
      const results = await Promise.allSettled(last30.map(d => getMorningAPI(d)));
      const calMap = {};
      results.forEach((r, i) => {
        const date = last30[i];
        if (r.status === "fulfilled") {
          const data = r.value?.data ?? r.value;
          if (data?.id) {
            calMap[date] = (data.activities || []).filter(a => a.is_completed).length;
          }
        }
      });
      setCalendarData(calMap);
    } catch (err) {
      console.error("Calendar load failed:", err);
    } finally {
      setCalLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    loadCalendar();

    // Real-time: re-fetch when any activity is updated elsewhere
    const handleUpdate = () => {
      loadDashboard();
      loadCalendar();
    };
    window.addEventListener("activityUpdated", handleUpdate);
    return () => window.removeEventListener("activityUpdated", handleUpdate);
  }, [loadDashboard, loadCalendar]);

  // ── derived stats ─────────────────────────────────────────────────────────
  const totalActivities = morningData?.activities?.length || 0;
  const completedActivities = morningData?.activities?.filter(a => a.is_completed).length || 0;
  const completionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  const morningStatus = !morningData ? "incomplete"
    : completionRate === 100 && totalActivities > 0 ? "complete"
    : completionRate > 0 ? "in-progress" : "incomplete";

  const eveningStatus = eveningData?.id ? "complete" : "incomplete";

  const totalSkillActs = skillsData.reduce((s, sk) => s + (sk.activities?.length || 0), 0);
  const doneSkillActs = skillsData.reduce((s, sk) => s + (sk.activities?.filter(a => a.is_completed).length || 0), 0);
  const skillProgress = totalSkillActs > 0 ? Math.round((doneSkillActs / totalSkillActs) * 100) : 0;
  const skillStatus = skillProgress === 100 && totalSkillActs > 0 ? "complete" : skillProgress > 0 ? "in-progress" : "incomplete";

  const priorityActivity = morningData?.activities?.find(a => a.is_priority && !a.is_completed);
  const habitActivity = morningData?.activities?.find(a => a.is_habit && !a.is_completed);

  const formattedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #f0f9ff 100%)" }}>
      <Sidebar activePath="/dashboard" onNavigate={(path) => navigate(path)} />

      <main className="flex-1 flex flex-col overflow-y-auto px-8 py-8 gap-6">
        {/* Header */}
        <div>
          <p className="text-sm text-gray-400">
            Hello <span className="font-bold text-blue-600">{firstName || "there"}</span>, welcome back!
          </p>
          <h1 className="text-2xl font-bold text-gray-800 mt-0.5">{formattedDate}</h1>
        </div>

        {/* 4 Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 max-w-xl">
            {[1,2,3,4].map(i => <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-32" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 max-w-xl">
            <SummaryCard title="Morning Check-in" status={morningStatus} progress={completionRate} icon="🌅" color="blue" onClick={() => navigate("/morning-checkin")} />
            <SummaryCard title="Evening Reflection" status={eveningStatus} icon="🌙" color="orange" onClick={() => navigate("/evening-reflection")} />
            <SummaryCard title="Skill Practice" status={skillStatus} progress={skillProgress} icon="🎯" color="green" onClick={() => navigate("/skill-practice")} />
            {/* Today's Focus */}
            <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-sm">
              <p className="text-sm font-bold mb-2">Today's Focus</p>
              {priorityActivity ? (
                <div className="mb-1.5">
                  <p className="text-[9px] text-white/70 font-semibold uppercase tracking-wide">Priority</p>
                  <p className="text-xs text-white font-medium truncate">{priorityActivity.title}</p>
                </div>
              ) : null}
              {habitActivity ? (
                <div>
                  <p className="text-[9px] text-white/70 font-semibold uppercase tracking-wide">Protected Habit</p>
                  <p className="text-xs text-white font-medium truncate">{habitActivity.title}</p>
                </div>
              ) : null}
              {!priorityActivity && !habitActivity && (
                <p className="text-xs text-white/70">No priority set today</p>
              )}
              <div className="absolute right-4 bottom-3 text-4xl opacity-25 select-none">🏆</div>
            </div>
          </div>
        )}

        {/* Activity Calendar — below the 4 boxes */}
        <div className="max-w-xl">
          <ActivityCalendar calendarData={calendarData} loading={calLoading} />
        </div>

        {/* Daily Quote — below calendar */}
        <div className="max-w-xl">
          <QuoteBox />
        </div>
      </main>

      {/* Right Panel */}
      <RightPanel />
    </div>
  );
}

export default Dashboard;