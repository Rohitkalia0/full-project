import { useState, useEffect, useCallback } from "react";
import { getMorningAPI } from "./api";

// ── Helpers ───────────────────────────────────────────────────────────────────
export const getLocalToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const getLast30Days = () => {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  return days;
};

export const getThisWeekDays = () => {
  const days = [];
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dow + 6) % 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }
  return days;
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Fire this when any activity is added/completed/removed
export const notifyActivityUpdated = () => {
  window.dispatchEvent(new CustomEvent("activityUpdated"));
};

// ── Week Bar Chart ─────────────────────────────────────────────────────────────
function WeekChart({ weekData, loading }) {
  const maxTotal = Math.max(...weekData.map(d => d.total), 1);
  const today = getLocalToday();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs font-semibold text-gray-700 mb-0.5">Activity Trends</p>
      <p className="text-[10px] text-gray-400 mb-3">This week — total vs completed</p>
      <div className="flex items-end gap-1.5 h-24">
        {weekData.map((d, i) => {
          const isToday = d.date === today;
          const isLoading = loading && d.total === 0 && !d.hasData;

          if (isLoading) {
            // Skeleton bar for days we haven't loaded yet
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-20 flex items-end">
                  <div className="w-full rounded-t-md bg-gray-100 animate-pulse" style={{ height: `${30 + Math.random() * 40}%` }} />
                </div>
                <span className={`text-[9px] font-medium ${isToday ? "text-blue-600 font-bold" : "text-gray-400"}`}>{d.label}</span>
              </div>
            );
          }

          const totalPct = (d.total / maxTotal) * 100;
          const donePct = d.total > 0 ? (d.completed / d.total) * 100 : 0;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end h-20 relative">
                {d.total > 0 ? (
                  <>
                    <div className={`absolute bottom-0 left-0 right-0 rounded-t-md transition-all ${isToday ? "bg-blue-200" : "bg-blue-100"}`}
                      style={{ height: `${totalPct}%` }} />
                    <div className={`absolute bottom-0 left-0 right-0 rounded-t-md transition-all ${isToday ? "bg-blue-600" : "bg-blue-500"}`}
                      style={{ height: `${(totalPct * donePct) / 100}%` }} />
                  </>
                ) : (
                  // No data for this day — show faint skeleton
                  <div className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gray-100" style={{ height: "8%" }} />
                )}
              </div>
              <span className={`text-[9px] font-medium ${isToday ? "text-blue-600 font-bold" : "text-gray-400"}`}>{d.label}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-blue-500" /><span className="text-[9px] text-gray-500">Done</span></div>
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm bg-blue-100" /><span className="text-[9px] text-gray-500">Total</span></div>
      </div>
    </div>
  );
}

// ── Stat Box ───────────────────────────────────────────────────────────────────
function StatBox({ label, value, loading, accent }) {
  return (
    <div className={`rounded-xl border p-3 flex flex-col gap-1 ${accent ? "bg-blue-50 border-blue-100" : "bg-white border-gray-100"}`}>
      <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-400 leading-tight">{label}</p>
      {loading
        ? <div className="h-6 w-10 bg-gray-100 rounded animate-pulse" />
        : <p className={`text-xl font-bold ${accent ? "text-blue-600" : "text-gray-800"}`}>{value}</p>
      }
    </div>
  );
}

// ── Main RightPanel ─────────────────────────────────────────────────────────────
function RightPanel({ onCalendarData } = {}) {
  const today = getLocalToday();
  const [loading, setLoading] = useState(true);

  const [totalActivities, setTotalActivities] = useState(0);
  const [completedActivities, setCompletedActivities] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [daysInFlow, setDaysInFlow] = useState(0);
  const [weekData, setWeekData] = useState(
    getThisWeekDays().map((date, i) => ({ date, label: DAY_LABELS[i], total: 0, completed: 0, hasData: false }))
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const last30 = getLast30Days();
      const results = await Promise.allSettled(last30.map(d => getMorningAPI(d)));

      const calMap = {};
      let streak = 0;
      const sortedDesc = [...last30].reverse();

      results.forEach((r, i) => {
        const date = last30[i];
        if (r.status === "fulfilled") {
          const data = r.value?.data ?? r.value;
          if (data?.id) {
            const completed = (data.activities || []).filter(a => a.is_completed).length;
            calMap[date] = { total: data.activities?.length || 0, completed, hasData: true };

            if (date === today) {
              const total = data.activities?.length || 0;
              setTotalActivities(total);
              setCompletedActivities(completed);
              setCompletionRate(total > 0 ? Math.round((completed / total) * 100) : 0);
            }
          } else {
            calMap[date] = { total: 0, completed: 0, hasData: false };
          }
        } else {
          calMap[date] = { total: 0, completed: 0, hasData: false };
        }
      });

      // If today has no morning data yet
      if (!calMap[today]) {
        setTotalActivities(0);
        setCompletedActivities(0);
        setCompletionRate(0);
      }

      // Days in flow — consecutive days back from today with ≥1 completed
      for (const dateStr of sortedDesc) {
        if (calMap[dateStr]?.completed > 0) streak++;
        else break;
      }
      setDaysInFlow(streak);

      // Week chart data
      const weekDays = getThisWeekDays();
      const wData = weekDays.map((dateStr, i) => {
        const idx = last30.indexOf(dateStr);
        if (idx === -1) return { date: dateStr, label: DAY_LABELS[i], total: 0, completed: 0, hasData: false };
        const entry = calMap[dateStr];
        return { date: dateStr, label: DAY_LABELS[i], total: entry?.total || 0, completed: entry?.completed || 0, hasData: entry?.hasData || false };
      });
      setWeekData(wData);

      // Share calendar data with parent (Dashboard's ActivityCalendar)
      if (onCalendarData) {
        const completedMap = {};
        for (const [date, entry] of Object.entries(calMap)) {
          if (entry.hasData) completedMap[date] = entry.completed;
        }
        onCalendarData(completedMap, false);
      }

    } catch (err) {
      console.error("RightPanel load failed:", err);
    } finally {
      setLoading(false);
    }
  }, [today, onCalendarData]);

  useEffect(() => {
    loadData();

    // Listen for real-time activity updates from anywhere in the app
    const handleUpdate = () => { loadData(); };
    window.addEventListener("activityUpdated", handleUpdate);
    return () => window.removeEventListener("activityUpdated", handleUpdate);
  }, [loadData]);

  // Formatted today date
  const formattedDate = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="w-64 shrink-0 flex flex-col overflow-y-auto border-l border-gray-100 bg-white/60 px-4 py-6 gap-4"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}>

      {/* Date card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
        <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-widest mb-0.5">Today</p>
        <p className="text-sm font-bold text-gray-800 leading-snug">{formattedDate}</p>
        <p className="text-xs text-gray-400">{new Date().getFullYear()}</p>
      </div>

      {/* 4 stat boxes */}
      <div className="grid grid-cols-2 gap-2">
        <StatBox label="Activities" value={totalActivities} loading={loading} />
        <StatBox label="Completed" value={completedActivities} loading={loading} accent />
        <StatBox label="Done %" value={`${completionRate}%`} loading={loading} accent />
        <StatBox label="Streak" value={daysInFlow} loading={loading} />
      </div>

      {/* Week bar chart */}
      <WeekChart weekData={weekData} loading={loading} />
    </div>
  );
}

export default RightPanel;