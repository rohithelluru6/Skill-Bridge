import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  Video,
  FileCode2,
  GraduationCap,
  Sparkles,
  Loader2
} from 'lucide-react';
import { api } from '../../api/client';

export default function LearningResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  useEffect(() => {
    async function loadResources() {
      try {
        setLoading(true);
        const data = await api.recommendResources();
        setResources(data.resources || []);
      } catch (err) {
        console.error('Failed to load resources:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, []);

  const resourceTypes = [
    'All',
    'Official Documentation',
    'Free Online Course',
    'Practice Platform',
  ];

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filtered = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.skill_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || res.resource_type === selectedType;
    const matchesDiff = selectedDifficulty === 'All' || res.difficulty === selectedDifficulty;
    return matchesSearch && matchesType && matchesDiff;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <BookOpen size={14} />
            <span>Curated Curriculum</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Vetted Engineering Learning Resources
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Verified official documentation, free full-length courses, and interactive coding platforms to bridge your skill deficits without broken links.
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
          <span className="font-bold text-slate-800">{resources.length} Verified Resources</span> mapped to skill gaps
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Type pills */}
        <div className="flex items-center space-x-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {resourceTypes.map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                selectedType === t
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search & Difficulty Filter */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill or topic..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 focus:outline-hidden"
          >
            {difficulties.map(d => (
              <option key={d} value={d}>Difficulty: {d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto" size={36} />
          <p className="text-xs text-slate-500 mt-2">Loading verified learning resources...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <BookOpen className="text-slate-300 mx-auto" size={40} />
          <p className="text-sm font-semibold text-slate-700 mt-2">No learning resources matched your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                    {res.skill_name || 'Engineering Skill'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    res.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-800' :
                    res.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {res.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mt-1 leading-relaxed">
                    {res.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{res.estimated_duration || 'Self-paced'}</span>
                  </span>
                  <span className="truncate max-w-[120px]">{res.resource_type}</span>
                </div>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs border border-slate-200/80 transition-all group"
                >
                  <span>Open Resource</span>
                  <ExternalLink size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
