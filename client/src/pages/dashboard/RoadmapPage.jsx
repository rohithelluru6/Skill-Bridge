import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Map,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  RefreshCw,
  Loader2,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Award,
  Layers
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';

export default function RoadmapPage() {
  const { profile } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [availableHours, setAvailableHours] = useState(15);
  const [expandedPhases, setExpandedPhases] = useState({ 1: true, 2: true, 3: false, 4: false, 5: false });
  const [error, setError] = useState(null);

  const fetchRoadmap = async (force = false) => {
    try {
      if (force) setRegenerating(true);
      else setLoading(true);
      setError(null);

      const data = await api.generateRoadmap({
        available_hours_per_week: availableHours,
        force_regenerate: force,
      });

      setRoadmap(data);
      if (force) {
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (err) {
      setError(err.message || 'Error generating career roadmap.');
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchRoadmap(false);
  }, []);

  const togglePhase = (phaseNum) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseNum]: !prev[phaseNum]
    }));
  };

  const handleToggleTask = async (taskId, phaseNum) => {
    try {
      const res = await api.toggleTask(taskId);

      // Update local state smoothly
      setRoadmap(prev => {
        if (!prev) return prev;
        let newCompleted = prev.completed_tasks + (res.is_completed ? 1 : -1);
        newCompleted = Math.max(0, Math.min(prev.total_tasks, newCompleted));
        const newPct = Math.round((newCompleted / prev.total_tasks) * 100);

        const updatedPhases = prev.phases.map(phase => {
          if (phase.phase_number === phaseNum) {
            return {
              ...phase,
              tasks: phase.tasks.map(t => {
                if (t.id === taskId) {
                  return { ...t, is_completed: res.is_completed ? 1 : 0 };
                }
                return t;
              })
            };
          }
          return phase;
        });

        if (res.is_completed) {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.7 }
          });
        }

        return {
          ...prev,
          completed_tasks: newCompleted,
          progress_percentage: newPct,
          phases: updatedPhases
        };
      });
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <h3 className="font-bold text-slate-800 text-base">Synthesizing Personalized 5-Phase Roadmap...</h3>
        <p className="text-xs text-slate-500">Tailoring weekly milestones to your engineering branch and gaps.</p>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
        <AlertCircle size={36} className="text-rose-500 mx-auto" />
        <h3 className="font-bold text-slate-800">Roadmap Engine Notice</h3>
        <p className="text-xs text-slate-500">{error || 'Could not synthesize roadmap.'}</p>
        <button
          onClick={() => fetchRoadmap(true)}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg"
        >
          Regenerate Roadmap
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              {roadmap.career_title || 'Career'} Track
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
              ⚡ 5-Phase Industry Architecture
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {roadmap.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {roadmap.overview}
          </p>
        </div>

        {/* Progress Metric Box */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50/60 p-5 rounded-2xl border border-blue-200/80 min-w-[190px] text-center shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Roadmap Completion
          </span>
          <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent my-1">
            {roadmap.progress_percentage}%
          </div>
          <span className="text-[10px] text-slate-500">
            {roadmap.completed_tasks} of {roadmap.total_tasks} Tasks Mastered
          </span>
        </div>
      </div>

      {/* Progress Bar & Regeneration Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Overall Roadmap Completion</span>
            <span className="font-bold text-blue-600">{roadmap.progress_percentage}% Finished</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${roadmap.progress_percentage}%` }}
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs border-t border-slate-100">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="text-slate-500 font-medium">Available Commitment:</span>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={availableHours}
                onChange={(e) => setAvailableHours(parseInt(e.target.value))}
                className="w-28 accent-blue-600 cursor-pointer"
              />
              <span className="font-bold text-blue-600">{availableHours} hrs/wk</span>
            </div>
          </div>

          <button
            onClick={() => fetchRoadmap(true)}
            disabled={regenerating}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={regenerating ? 'animate-spin text-blue-600' : ''} />
            <span>{regenerating ? 'Regenerating...' : 'Regenerate Roadmap'}</span>
          </button>
        </div>
      </div>

      {/* 5 Structured Phases List */}
      <div className="space-y-5">
        {roadmap.phases?.map((phase) => {
          const isExpanded = expandedPhases[phase.phase_number] ?? true;
          const phaseCompleted = phase.tasks.filter(t => t.is_completed).length;
          const phaseTotal = phase.tasks.length;
          const phasePct = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;

          return (
            <div
              key={phase.phase_number}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
            >
              {/* Phase Header */}
              <div
                onClick={() => togglePhase(phase.phase_number)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                    phasePct === 100
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {phasePct === 100 ? <CheckCircle2 size={20} /> : `P${phase.phase_number}`}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{phase.phase_title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{phase.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex flex-col items-end text-xs">
                    <span className="font-bold text-slate-800">{phaseCompleted}/{phaseTotal} Complete</span>
                    <span className="text-[10px] text-slate-400">{phasePct}% Mastered</span>
                  </div>
                  <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-3">
                  {phase.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                        task.is_completed
                          ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-600'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id, phase.phase_number)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            task.is_completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-blue-600 bg-white'
                          }`}
                        >
                          {task.is_completed ? <CheckCircle2 size={14} /> : null}
                        </button>

                        <div className="space-y-1">
                          <h4 className={`text-xs font-bold leading-snug ${
                            task.is_completed ? 'line-through text-slate-500' : 'text-slate-900'
                          }`}>
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400 shrink-0 pt-0.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          Week {task.week_number}
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock size={11} />
                          <span>~{task.estimated_hours}h</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
