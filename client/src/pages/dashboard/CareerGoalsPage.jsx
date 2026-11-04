import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  Brain,
  Code2,
  LineChart,
  Layers,
  Cloud,
  Terminal,
  ShieldCheck,
  BarChart3,
  Palette,
  ArrowRight,
  Loader2,
  Star,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

const ICON_MAP = {
  Brain,
  Code2,
  LineChart,
  Layers,
  Cloud,
  Terminal,
  ShieldCheck,
  BarChart3,
  Palette,
  Briefcase: Compass,
};

export default function CareerGoalsPage() {
  const { profile, refreshProfile } = useAuth();
  const [careers, setCareers] = useState([]);
  const [selectedCareerId, setSelectedCareerId] = useState(profile?.target_career_id || null);
  const [activeCareerDetails, setActiveCareerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    async function loadCareers() {
      try {
        setLoading(true);
        const data = await api.getCareers();
        setCareers(data.careers || []);
        
        const initialId = profile?.target_career_id || (data.careers?.[0]?.id ?? 1);
        setSelectedCareerId(initialId);
        loadDetails(initialId);
      } catch (err) {
        console.error('Error fetching careers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCareers();
  }, [profile?.target_career_id]);

  const loadDetails = async (id) => {
    try {
      setDetailsLoading(true);
      const data = await api.getCareerDetails(id);
      setActiveCareerDetails(data);
    } catch (err) {
      console.error('Error loading career details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSelectCard = (id) => {
    setSelectedCareerId(id);
    loadDetails(id);
  };

  const handleSetTarget = async (id) => {
    try {
      setSavingGoal(true);
      const res = await api.selectCareerGoal(id);
      await refreshProfile();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
      setNotification(`Target career updated to "${res.target_career_title}"!`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update target career.');
    } finally {
      setSavingGoal(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold">
            <Compass size={14} />
            <span>Career Exploration Hub</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Target Career Goals & Industry Standards
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Choose your desired engineering role to customize your automated AI skill gap analysis and step-by-step roadmap.
          </p>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 size={16} />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Career Cards Carousel / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {careers.map((career) => {
          const Icon = ICON_MAP[career.icon_name] || Compass;
          const isSelected = selectedCareerId === career.id;
          const isCurrentTarget = profile?.target_career_id === career.id;

          return (
            <div
              key={career.id}
              onClick={() => handleSelectCard(career.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border-blue-600 shadow-md ring-2 ring-blue-600/20'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <Icon size={20} />
                  </div>
                  {isCurrentTarget ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                      <CheckCircle2 size={12} />
                      <span>Active Goal</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {career.category}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{career.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {career.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500">
                <span>{career.average_salary_range}</span>
                <span className="font-semibold text-blue-600 flex items-center space-x-0.5">
                  <span>View Details</span>
                  <ChevronRight size={13} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Career Detailed View */}
      {detailsLoading ? (
        <div className="py-16 text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
          <p className="text-xs text-slate-500 mt-2">Loading detailed industry specs...</p>
        </div>
      ) : activeCareerDetails ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-8 animate-in fade-in duration-200">
          {/* Top banner of details */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold">
                  {activeCareerDetails.career.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Demand: {activeCareerDetails.career.demand_level}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {activeCareerDetails.career.title}
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                {activeCareerDetails.career.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => handleSetTarget(activeCareerDetails.career.id)}
                disabled={savingGoal || profile?.target_career_id === activeCareerDetails.career.id}
                className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md ${
                  profile?.target_career_id === activeCareerDetails.career.id
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25'
                }`}
              >
                {savingGoal ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : profile?.target_career_id === activeCareerDetails.career.id ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Current Active Target Role</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Set As My Target Role</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Industry Expectations Callout */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Industry Hiring Expectations
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {activeCareerDetails.career.industry_expectations}
            </p>
          </div>

          {/* Required Skills Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Required Technical & Professional Competencies
              </h4>
              <span className="text-xs text-slate-500">Benchmark Rating (0 - 5.0)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeCareerDetails.required_skills?.map((req, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{req.name}</span>
                    <span className="font-bold text-blue-600">{req.required_level} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${(req.required_level / 5.0) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{req.category}</span>
                    <span className="font-semibold text-slate-600">{req.importance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tiered Project Recommendations for this Career */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Portfolio Project Blueprints for {activeCareerDetails.career.title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {activeCareerDetails.projects?.map((proj) => (
                <div key={proj.id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                      proj.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-800' :
                      proj.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {proj.difficulty} Level
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">{proj.title}</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies_required?.map((t, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                    {proj.github_starter_url && (
                      <a
                        href={proj.github_starter_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:underline pt-1"
                      >
                        <span>Starter Architecture</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
