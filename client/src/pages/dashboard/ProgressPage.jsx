import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  Calendar,
  Layers,
  ArrowUpRight,
  Loader2,
  Sparkles,
  Target
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function ProgressPage() {
  const { profile } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      try {
        setLoading(true);
        const data = await api.getProgress();
        setProgress(data);
      } catch (err) {
        console.error('Failed to load progress data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="animate-spin text-blue-600 mx-auto" size={36} />
        <p className="text-xs font-semibold text-slate-500 mt-2">Computing learning metrics & velocity...</p>
      </div>
    );
  }

  const weeklyData = progress?.weekly_velocity || [
    { week: 'Week 1', tasksCompleted: 2, hoursSpent: 10, targetHours: 15 },
    { week: 'Week 2', tasksCompleted: 4, hoursSpent: 15, targetHours: 15 },
    { week: 'Week 3', tasksCompleted: 3, hoursSpent: 12, targetHours: 15 },
    { week: 'Week 4', tasksCompleted: 4, hoursSpent: 16, targetHours: 15 },
  ];

  const skillBars = (progress?.skills_summary || []).slice(0, 8).map(s => ({
    name: s.name,
    Rating: s.rating,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <TrendingUp size={14} />
            <span>Velocity & Career Readiness Monitoring</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Academic & Skill Progress Tracking
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Live metrics recording your roadmap milestone completions, weekly learning hours, and measurable skill improvements.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard/roadmap"
            className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
          >
            <span>Continue Roadmap</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Top 3 Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Overall Career Readiness</span>
            <Target size={18} className="text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {progress?.readiness_score || 0}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: `${progress?.readiness_score || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">Benchmark against target career requirements</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Roadmap Completion</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {progress?.completion_rate || 0}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${progress?.completion_rate || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {progress?.completed_tasks || 0} of {progress?.total_tasks || 20} tasks completed
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Validated Skills</span>
            <Award size={18} className="text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {progress?.skills_summary?.filter(s => s.verified).length || 0}
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full"
              style={{
                width: `${Math.min(100, ((progress?.skills_summary?.filter(s => s.verified).length || 0) / 10) * 100)}%`
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500">Diagnostic quiz badges earned</p>
        </div>
      </div>

      {/* Velocity Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Learning Velocity */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Weekly Learning Velocity</h3>
              <p className="text-xs text-slate-500">Hours spent vs. target weekly commitment</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">Target: 15 hrs/wk</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="hoursSpent" name="Hours Spent" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#hoursGrad)" />
                <Line type="monotone" dataKey="targetHours" name="Target Hours" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Improvement Distribution */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recorded Skill Competencies</h3>
              <p className="text-xs text-slate-500">Current ratings across technical subjects</p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillBars} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="Rating" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Audit Trail */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">Learning History & Activity Log</h3>
          <p className="text-xs text-slate-500">Time-stamped log of milestones and assessments</p>
        </div>

        <div className="divide-y divide-slate-100">
          {(progress?.recent_activities || []).map((act, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-slate-800">{act.description}</p>
                  <p className="text-[10px] text-slate-400 capitalize">{act.action_type.toLowerCase().replace('_', ' ')}</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {new Date(act.created_at).toLocaleString()}
              </span>
            </div>
          ))}
          {(!progress?.recent_activities || progress.recent_activities.length === 0) && (
            <div className="p-6 text-center text-xs text-slate-400">
              No activity logs recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
