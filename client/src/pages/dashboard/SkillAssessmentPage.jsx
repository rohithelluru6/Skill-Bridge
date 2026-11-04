import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Star,
  Award,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import QuizModal from '../../components/assessment/QuizModal';

export default function SkillAssessmentPage() {
  const { profile, refreshProfile } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState(profile?.branch || 'Computer Science Engineering');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom skill dialog state
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Technical');
  const [customRating, setCustomRating] = useState(3.0);

  // Diagnostic Quiz modal state
  const [quizSkill, setQuizSkill] = useState(null);

  const branches = [
    'Computer Science Engineering',
    'Information Technology',
    'Artificial Intelligence and Machine Learning',
    'Data Science',
    'Electronics and Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
  ];

  useEffect(() => {
    async function loadSkillsData() {
      try {
        setLoading(true);
        const [masterRes, studentRes] = await Promise.all([
          api.getAllSkills(),
          api.getMySkills()
        ]);

        const studentSkillMap = {};
        (studentRes.skills || []).forEach(ss => {
          studentSkillMap[ss.skill_id] = ss;
        });

        // Merge master skills with student's current rating
        const merged = (masterRes.skills || []).map(ms => {
          const studentEntry = studentSkillMap[ms.id];
          return {
            skill_id: ms.id,
            name: ms.name,
            category: ms.category,
            description: ms.description,
            rating: studentEntry ? parseFloat(studentEntry.rating) : 0.0,
            proficiency_level: studentEntry ? studentEntry.proficiency_level : 'Beginner',
            verified: studentEntry ? Boolean(studentEntry.verified) : false
          };
        });

        setSkills(merged);
      } catch (err) {
        console.error('Error fetching skills:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSkillsData();
  }, []);

  const handleBranchChange = async (e) => {
    const newBranch = e.target.value;
    setSelectedBranch(newBranch);
    try {
      await api.updateProfile({ branch: newBranch });
      await refreshProfile();
      setMessage({ type: 'success', text: `Engineering branch updated to ${newBranch}!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRatingChange = (skillId, newRating) => {
    setSkills(prev => prev.map(s => {
      if (s.skill_id === skillId) {
        let prof = 'Beginner';
        if (newRating >= 4.5) prof = 'Expert';
        else if (newRating >= 3.5) prof = 'Advanced';
        else if (newRating >= 2.0) prof = 'Intermediate';

        return { ...s, rating: newRating, proficiency_level: prof };
      }
      return s;
    }));
  };

  const handleProficiencyChange = (skillId, newProf) => {
    setSkills(prev => prev.map(s => {
      if (s.skill_id === skillId) {
        return { ...s, proficiency_level: newProf };
      }
      return s;
    }));
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const payload = skills.filter(s => s.rating > 0).map(s => ({
        skill_id: s.skill_id,
        rating: s.rating,
        proficiency_level: s.proficiency_level
      }));

      await api.updateMySkills(payload);
      setMessage({ type: 'success', text: 'All skill ratings saved successfully! Ready for AI Gap Analysis.' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save skills.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomSkill = async (e) => {
    e.preventDefault();
    if (!customName.trim()) return;

    try {
      const res = await api.addCustomSkill({
        name: customName.trim(),
        category: customCategory,
      });

      const newSkill = res.skill;
      setSkills(prev => [
        {
          skill_id: newSkill.id,
          name: newSkill.name,
          category: newSkill.category,
          description: newSkill.description,
          rating: customRating,
          proficiency_level: customRating >= 3.5 ? 'Advanced' : 'Intermediate',
          verified: false
        },
        ...prev
      ]);

      setCustomName('');
      setShowAddCustom(false);
      setMessage({ type: 'success', text: `Skill "${newSkill.name}" added to your profile!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert(err.message || 'Could not add skill');
    }
  };

  const handleQuizCompleted = (result) => {
    setSkills(prev => prev.map(s => {
      if (s.skill_id === (quizSkill.id || quizSkill.skill_id)) {
        return {
          ...s,
          rating: result.calculated_rating,
          proficiency_level: result.proficiency_level,
          verified: true
        };
      }
      return s;
    }));
  };

  const filteredSkills = skills.filter(s => {
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Quiz Modal */}
      {quizSkill && (
        <QuizModal
          skill={quizSkill}
          onClose={() => setQuizSkill(null)}
          onAssessmentCompleted={handleQuizCompleted}
        />
      )}

      {/* Header and Branch Selection */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <ClipboardCheck size={14} />
            <span>Interactive Assessment Matrix</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Student Skill Assessment & Profiling
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Rate your proficiency (0-5) across technical and professional skills, or take verified diagnostic quizzes to benchmark your engineering readiness.
          </p>
        </div>

        {/* Branch Selector */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 min-w-[280px]">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Your Engineering Discipline
          </label>
          <select
            value={selectedBranch}
            onChange={handleBranchChange}
            className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            {branches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Success / Error Message Banner */}
      {message && (
        <div className={`p-4 rounded-xl border text-xs font-medium flex items-center space-x-2 animate-in fade-in duration-200 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Action Controls & Filtering Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex items-center space-x-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['All', 'Technical', 'Professional'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat} Skills
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter skills..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowAddCustom(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shrink-0"
          >
            <Plus size={14} />
            <span>Add Custom</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all shrink-0 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Ratings</span>
          </button>
        </div>
      </div>

      {/* Add Custom Skill Modal Dialog */}
      {showAddCustom && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Add Custom Engineering Skill</h3>
            <form onSubmit={handleAddCustomSkill} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Kubernetes, Rust, GraphQL"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Technical">Technical</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Initial Rating</span>
                  <span className="text-blue-600">{customRating} / 5.0</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={customRating}
                  onChange={(e) => setCustomRating(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skills Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="animate-spin text-blue-600" size={36} />
          <p className="text-xs font-semibold text-slate-500">Loading master skill catalog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map(skill => (
            <div
              key={skill.skill_id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {skill.category}
                  </span>
                  {skill.verified ? (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Award size={13} className="text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setQuizSkill(skill)}
                      className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <span>Take Quiz</span>
                      <span>→</span>
                    </button>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-base">{skill.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                    {skill.description || 'Core engineering proficiency'}
                  </p>
                </div>
              </div>

              {/* Rating Controls */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Self-Rating:</span>
                  <span className="font-bold text-blue-600 text-sm">{skill.rating} / 5.0</span>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={skill.rating}
                  onChange={(e) => handleRatingChange(skill.skill_id, parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Level:</span>
                  <select
                    value={skill.proficiency_level}
                    onChange={(e) => handleProficiencyChange(skill.skill_id, e.target.value)}
                    className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 focus:outline-hidden"
                  >
                    <option value="Beginner">Beginner (1-2)</option>
                    <option value="Intermediate">Intermediate (3)</option>
                    <option value="Advanced">Advanced (4)</option>
                    <option value="Expert">Expert (5)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
