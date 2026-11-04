import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  ExternalLink,
  Layers,
  Clock,
  Sparkles,
  CheckCircle2,
  Loader2,
  Code2,
  Brain,
  Filter
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function ProjectsPage() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState([]);
  const [careerTitle, setCareerTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTier, setActiveTier] = useState('All');

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const careerId = profile?.target_career_id || 1;
        const data = await api.getCareerDetails(careerId);
        setProjects(data.projects || []);
        setCareerTitle(data.career?.title || 'Target Role');
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [profile?.target_career_id]);

  const tiers = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filtered = projects.filter(p => activeTier === 'All' || p.difficulty === activeTier);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            <FolderGit2 size={14} />
            <span>Capstone Portfolio Blueprints</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Curated Projects for {careerTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Recruiter-ready portfolio projects with realistic architectural patterns, technologies, and clear learning outcomes.
          </p>
        </div>

        {/* Tier filter tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          {tiers.map(t => (
            <button
              key={t}
              onClick={() => setActiveTier(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTier === t
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto" size={36} />
          <p className="text-xs text-slate-500 mt-2">Loading capstone project blueprints...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <FolderGit2 className="text-slate-300 mx-auto" size={40} />
          <p className="text-sm font-semibold text-slate-700 mt-2">No projects found for this tier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(proj => (
            <div
              key={proj.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    proj.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    proj.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    'bg-purple-100 text-purple-800 border border-purple-200'
                  }`}>
                    {proj.difficulty} Tier
                  </span>
                  <span className="flex items-center space-x-1 text-xs text-slate-400 font-medium">
                    <Clock size={12} />
                    <span>~{proj.estimated_hours}h</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{proj.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{proj.description}</p>
                </div>

                {/* Tech Pills */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Required Tech Stack
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies_required?.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expected Learning Outcomes */}
                {proj.learning_outcomes && proj.learning_outcomes.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Core Learning Outcomes
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {proj.learning_outcomes.map((out, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-tight">{out}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer Starter Link */}
              <div className="pt-3 border-t border-slate-100">
                {proj.github_starter_url ? (
                  <a
                    href={proj.github_starter_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
                  >
                    <span>Starter Code / Specs</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">Self-guided implementation</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
