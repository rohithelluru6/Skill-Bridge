import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  TrendingUp,
  Award,
  GitCompare,
  Map,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Target,
  Brain,
  Code2
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import PriorityBadge from '../../components/common/PriorityBadge';
import SkillRatingBar from '../../components/common/SkillRatingBar';

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [gapData, setGapData] = useState(null);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        // Fetch progress and gap analysis concurrently
        const [progressRes, gapRes, resRes] = await Promise.all([
          api.getProgress().catch(() => null),
          api.getSkillGapAnalysis().catch(() => null),
          api.recommendResources().catch(() => null),
        ]);

        setProgressData(progressRes);
        setGapData(gapRes);
        setResources(resRes?.resources?.slice(0, 4) || []);
      } catch (err) {
        console.error('Error loading student dashboard:', err);
        setError('Failed to load some dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  // Format radar chart data from gaps breakdown
  const radarData = (gapData?.gaps_breakdown || []).slice(0, 6).map(g => ({
    skill: g.skill_name,
    Current: g.current_rating,
    Required: g.required_level,
    fullMark: 5.0,
  }));

  // Bar chart data for skills
  const barData = (progressData?.skills_summary || []).slice(0, 7).map(s => ({
    name: s.name,
    Rating: s.rating,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
              <Sparkles size={13} className="text-yellow-300" />
              <span>AI Engineering Mentorship</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-sm text-blue-100 leading-relaxed">
              Targeting <strong className="text-white underline decoration-blue-300">{profile?.target_career_title || 'AI/ML Engineer'}</strong> from <span className="font-medium text-white">{profile?.college_name || 'Engineering College'}</span> ({profile?.branch || 'Engineering'}). Your personalized learning roadmap is active.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard/gap-analysis"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-blue-800 font-bold text-xs hover:bg-blue-50 transition-all shadow-md shadow-blue-900/30"
            >
              <GitCompare size={15} />
              <span>View Gap Analysis</span>
            </Link>
            <Link
              to="/dashboard/roadmap"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-500/30 hover:bg-blue-500/40 text-white border border-white/20 font-bold text-xs backdrop-blur-md transition-all"
            >
              <Map size={15} />
              <span>Open Roadmap</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Overall Readiness Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Career Readiness</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">
              {gapData?.overall_readiness_score || progressData?.readiness_score || 0}%
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Estimated</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${gapData?.overall_readiness_score || progressData?.readiness_score || 0}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Target Career */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Role</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Compass size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-slate-900 truncate">
              {profile?.target_career_title || gapData?.career_title || 'AI/ML Engineer'}
            </div>
            <Link to="/dashboard/careers" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1 mt-1">
              <span>Switch target role</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Metric 3: Roadmap Progress */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Roadmap Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">
              {progressData?.completed_tasks || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {progressData?.total_tasks || 20} Completed
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${progressData?.completion_rate || 0}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Skills Evaluated */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Skills Profile</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">
              {progressData?.skills_summary?.length || 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">Recorded Skills</span>
          </div>
          <div className="mt-2 flex items-center space-x-1 text-xs text-slate-600">
            <Link to="/dashboard/assessment" className="text-blue-600 font-semibold hover:underline">
              Add custom skills & quizzes →
            </Link>
          </div>
        </div>
      </div>

      {/* Charts & Gap Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Radar Comparison (Current vs Target) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Current Skills vs. Industry Target</h3>
                <p className="text-xs text-slate-500">Radar visualization for {gapData?.career_title || 'Role'}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                Scale 0 to 5.0
              </span>
            </div>

            {radarData.length > 0 ? (
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#475569', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#cbd5e1" />
                    <Radar name="Current Proficiency" dataKey="Current" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
                    <Radar name="Industry Benchmark" dataKey="Required" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-sm">
                No skill gap data recorded yet.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Blue: Your ability • Purple: Required threshold</span>
            <Link to="/dashboard/gap-analysis" className="text-blue-600 font-bold hover:underline">
              Full Gap Breakdown →
            </Link>
          </div>
        </div>

        {/* Right Card: High-Priority Skill Gaps List */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Priority Skill Gaps</h3>
                <p className="text-xs text-slate-500">Skills requiring the highest immediate focus</p>
              </div>
              <Link to="/dashboard/gap-analysis" className="text-xs font-bold text-blue-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {(gapData?.gaps_breakdown || []).slice(0, 4).map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">{item.skill_name}</span>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>You: {item.current_rating}/5.0</span>
                    <span className="font-medium">Target: {item.required_level}/5.0</span>
                    <span className="text-rose-600 font-semibold">Gap: -{item.gap}</span>
                  </div>
                  <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.priority === 'High Priority' ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, (item.current_rating / item.required_level) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              to="/dashboard/roadmap"
              className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
            >
              <span>Bridge these gaps in your roadmap</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recommended Courses & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recommended Learning Resources */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Targeted Learning Resources</h3>
              <p className="text-xs text-slate-500">Vetted tutorials matching your missing skills</p>
            </div>
            <Link to="/dashboard/resources" className="text-xs font-bold text-blue-600 hover:underline">
              Explore All Resources
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {resources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-sm transition-all bg-white group flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold mb-1">
                    <span>{res.resource_type}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{res.difficulty}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs group-hover:text-blue-600 transition-colors line-clamp-1">
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {res.description}
                  </p>
                </div>
                <div className="text-[11px] font-semibold text-blue-600 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>{res.estimated_duration || 'Self-paced'}</span>
                  <span>Open Resource ↗</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Recent Activity</h3>
              <span className="text-xs text-slate-400">Live Audit Log</span>
            </div>

            <div className="space-y-3">
              {(progressData?.recent_activities || []).slice(0, 5).map((act, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="font-semibold text-slate-800 truncate">{act.description}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(act.created_at).toLocaleDateString()} • {act.action_type}
                    </p>
                  </div>
                </div>
              ))}
              {(!progressData?.recent_activities || progressData.recent_activities.length === 0) && (
                <p className="text-xs text-slate-400 py-4 text-center">No recent activity logged yet.</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link to="/dashboard/progress" className="text-xs font-bold text-blue-600 hover:underline">
              Detailed Progress Velocity Charts →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
