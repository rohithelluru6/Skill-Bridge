import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCompare,
  TrendingUp,
  Brain,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2,
  RefreshCw,
  Compass,
  Award,
  ListOrdered
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import PriorityBadge from '../../components/common/PriorityBadge';

export default function GapAnalysisPage() {
  const { profile } = useAuth();
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState(null);

  const fetchGapAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSkillGapAnalysis();
      setGapData(data);
    } catch (err) {
      setError(err.message || 'Error computing skill gap analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGapAnalysis();
  }, []);

  const handleRefresh = async () => {
    setRecalculating(true);
    await fetchGapAnalysis();
    setRecalculating(false);
  };

  // Prepare chart data comparing Current vs Required
  const chartData = (gapData?.gaps_breakdown || []).map(item => ({
    name: item.skill_name,
    'Current Rating': item.current_rating,
    'Industry Required': item.required_level,
    'Skill Deficit': item.gap,
  }));

  const radarData = (gapData?.gaps_breakdown || []).slice(0, 8).map(item => ({
    skill: item.skill_name,
    Current: item.current_rating,
    Required: item.required_level,
    fullMark: 5.0,
  }));

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <h3 className="font-bold text-slate-800 text-base">Running AI Skill Gap Analysis...</h3>
        <p className="text-xs text-slate-500">Cross-referencing your profile against engineering career benchmarks.</p>
      </div>
    );
  }

  if (error || !gapData) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
        <AlertCircle size={36} className="text-rose-500 mx-auto" />
        <h3 className="font-bold text-slate-800">Gap Analysis Notice</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{error || 'Could not load analysis.'}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              Target: {gapData.career_title}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              ⚡ {gapData.ai_provider}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI-Powered Skill Gap Analysis
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {gapData.summary}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50/60 p-5 rounded-2xl border border-blue-200/80 min-w-[170px] text-center shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Readiness Score
          </span>
          <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent my-1">
            {gapData.overall_readiness_score}%
          </div>
          <span className="text-[10px] text-slate-400">Industry Entry Fit</span>
        </div>
      </div>

      {/* Scoring Algorithm Notice & Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start space-x-2.5">
        <AlertCircle size={17} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">Transparent Scoring Framework:</strong> Readiness percentages are computed by weighting current student abilities against target industry thresholds based on role importance (Required vs Preferred). {gapData.disclaimer}
        </div>
      </div>

      {/* Visual Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bar Chart: Current vs Required */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Current vs. Required Skill Ratings</h3>
              <p className="text-xs text-slate-500">Rating differential on 0.0 to 5.0 scale</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={recalculating}
              className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-blue-600"
            >
              <RefreshCw size={13} className={recalculating ? 'animate-spin' : ''} />
              <span>Recalculate</span>
            </button>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                <Bar dataKey="Current Rating" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Industry Required" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart: Skill Balance Matrix */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Competency Radar</h3>
                <p className="text-xs text-slate-500">Visualizing multidimensional capability</p>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#475569', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#cbd5e1" />
                  <Radar name="Current" dataKey="Current" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
                  <Radar name="Required" dataKey="Required" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <Link
              to="/dashboard/roadmap"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:underline"
            >
              <span>Build roadmap to eliminate these gaps →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* AI Qualitative Strategic Analysis Section */}
      {gapData.ai_insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* AI Summary */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center space-x-1.5 text-blue-700 font-bold text-xs uppercase tracking-wider">
              <Sparkles size={14} />
              <span>AI Strategic Overview</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {gapData.ai_insights.ai_summary}
            </p>
            <div className="pt-2 text-[11px] font-semibold text-blue-600">
              Estimated Runway: {gapData.ai_insights.estimated_time_to_ready_months} Months to Ready
            </div>
          </div>

          {/* Tactical Advice */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center space-x-1.5 text-purple-700 font-bold text-xs uppercase tracking-wider">
              <Brain size={14} />
              <span>Tactical Directives</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {gapData.ai_insights.strategic_advice?.map((adv, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hiring Perspective */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <Compass size={14} />
              <span>Recruiter Perspective</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {gapData.ai_insights.hiring_perspective}
            </p>
          </div>
        </div>
      )}

      {/* Comprehensive Skill Gaps Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Comprehensive Skill Deficit Breakdown</h3>
            <p className="text-xs text-slate-500">Ordered by hiring urgency & algorithmic priority</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {gapData.gaps_breakdown?.length || 0} Skills Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Skill Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Your Rating</th>
                <th className="py-3 px-4">Required</th>
                <th className="py-3 px-4">Gap</th>
                <th className="py-3 px-4">Priority Level</th>
                <th className="py-3 px-4">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gapData.gaps_breakdown?.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center space-x-2">
                      <span>{item.skill_name}</span>
                      {item.verified && (
                        <CheckCircle2 size={13} className="text-emerald-600" title="Verified Skill" />
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{item.category}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {item.current_rating} / 5.0
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {item.required_level} / 5.0
                  </td>
                  <td className="py-3.5 px-4 font-bold">
                    {item.gap > 0 ? (
                      <span className="text-rose-600">-{item.gap}</span>
                    ) : (
                      <span className="text-emerald-600">0.0 (Met)</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs leading-relaxed">
                    {item.recommended_action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggested Learning Sequence Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
            <ListOrdered size={16} />
            <span>Recommended Learning Sequence</span>
          </div>
          <h4 className="text-lg font-bold">
            Prioritized Skill Acquisition Order
          </h4>
          <p className="text-xs text-blue-100 leading-relaxed">
            {gapData.recommended_sequence?.slice(0, 5).join(' → ')}
          </p>
        </div>

        <Link
          to="/dashboard/roadmap"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white text-blue-900 font-bold text-xs shadow-lg hover:bg-blue-50 transition-all shrink-0"
        >
          <span>Generate Step-by-Step Roadmap</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
