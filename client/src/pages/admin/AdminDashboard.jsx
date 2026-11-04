import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Compass,
  Award,
  TrendingUp,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
  ArrowRight
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#4f46e5'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // New Career modal state
  const [showAddCareer, setShowAddCareer] = useState(false);
  const [careerTitle, setCareerTitle] = useState('');
  const [careerSlug, setCareerSlug] = useState('');
  const [careerCategory, setCareerCategory] = useState('Engineering');
  const [careerDesc, setCareerDesc] = useState('');
  const [careerExpectations, setCareerExpectations] = useState('');

  // New Skill modal state
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillCat, setSkillCat] = useState('Technical');
  const [skillDesc, setSkillDesc] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [stuRes, anaRes] = await Promise.all([
        api.getAdminStudents(),
        api.getAdminAnalytics()
      ]);
      setStudents(stuRes.students || []);
      setAnalytics(anaRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateCareer = async (e) => {
    e.preventDefault();
    try {
      await api.createAdminCareer({
        title: careerTitle,
        slug: careerSlug || careerTitle.toLowerCase().replace(/\s+/g, '-'),
        category: careerCategory,
        description: careerDesc,
        industry_expectations: careerExpectations || 'Strong problem solving and algorithmic reasoning.',
      });
      setMessage('New career path added successfully to platform catalog!');
      setShowAddCareer(false);
      setCareerTitle('');
      setCareerSlug('');
      setCareerDesc('');
      loadAdminData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert(err.message || 'Error creating career path.');
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    try {
      await api.createAdminSkill({
        name: skillName,
        category: skillCat,
        description: skillDesc,
      });
      setMessage(`Skill "${skillName}" added to master database!`);
      setShowAddSkill(false);
      setSkillName('');
      setSkillDesc('');
      loadAdminData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert(err.message || 'Error adding skill.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="animate-spin text-purple-600 mx-auto" size={40} />
        <p className="text-xs font-semibold text-slate-500 mt-2">Loading platform administration metrics...</p>
      </div>
    );
  }

  const popularCareersData = (analytics?.popular_careers || []).map(c => ({
    name: c.title,
    Students: c.student_count || 1,
  }));

  const branchData = (analytics?.branch_distribution || []).map(b => ({
    name: b.branch,
    value: b.count,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-purple-200 border border-white/20">
            <ShieldCheck size={14} className="text-yellow-300" />
            <span>Administrator Control Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Skill Bridge Platform Administration
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 max-w-2xl leading-relaxed">
            Monitor registered engineering cohorts, manage industry career requirements, add technical skills, and inspect university readiness analytics.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setShowAddCareer(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all"
          >
            <Plus size={14} />
            <span>Add Career Path</span>
          </button>
          <button
            onClick={() => setShowAddSkill(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-purple-900 text-xs font-bold shadow-md transition-all"
          >
            <Plus size={14} />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Enrolled Students</span>
            <Users size={16} className="text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {analytics?.metrics?.total_students || 0}
          </div>
          <p className="text-[11px] text-slate-500">Registered across universities</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Career Pathways</span>
            <Compass size={16} className="text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {analytics?.metrics?.total_careers || 0}
          </div>
          <p className="text-[11px] text-slate-500">Active industry career tracks</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Master Skills Catalog</span>
            <Award size={16} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {analytics?.metrics?.total_skills || 0}
          </div>
          <p className="text-[11px] text-slate-500">Technical & professional skills</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Avg Readiness Score</span>
            <TrendingUp size={16} className="text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {analytics?.metrics?.platform_average_readiness || 0}%
          </div>
          <p className="text-[11px] text-slate-500">Platform-wide benchmark fit</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Popular Target Careers Bar */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Most Popular Target Careers</h3>
            <span className="text-xs text-slate-500">Student enrollment distribution</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularCareersData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="Students" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engineering Branch Distribution Pie */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Engineering Branch Cohort</h3>
            <span className="text-xs text-slate-500">By discipline</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={branchData.length > 0 ? branchData : [{ name: 'CSE', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name.substring(0, 8)}: ${(percent * 100).toFixed(0)}%`}
                >
                  {branchData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Registered Students Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Registered Engineering Students</h3>
            <p className="text-xs text-slate-500">Direct student cohort records & progress readiness</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {students.length} Total Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">College</th>
                <th className="py-3 px-4">Branch & Year</th>
                <th className="py-3 px-4">Target Career</th>
                <th className="py-3 px-4">Skills Logged</th>
                <th className="py-3 px-4">Readiness Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{stu.full_name}</td>
                  <td className="py-3.5 px-4 text-slate-500">{stu.email}</td>
                  <td className="py-3.5 px-4 text-slate-700">{stu.college_name || 'N/A'}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{stu.branch}</div>
                    <div className="text-[10px] text-slate-400">{stu.current_academic_year} • Grad {stu.graduation_year}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-blue-700">{stu.target_career || 'Not Selected'}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{stu.skills_count || 0}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-emerald-600">
                      {stu.readiness_score ? `${stu.readiness_score}%` : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Career Modal */}
      {showAddCareer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Add New Engineering Career Track</h3>
            <form onSubmit={handleCreateCareer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Career Title</label>
                <input
                  type="text"
                  required
                  value={careerTitle}
                  onChange={(e) => setCareerTitle(e.target.value)}
                  placeholder="e.g. Site Reliability Engineer (SRE)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={careerCategory}
                  onChange={(e) => setCareerCategory(e.target.value)}
                  placeholder="e.g. Cloud & Operations"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={careerDesc}
                  onChange={(e) => setCareerDesc(e.target.value)}
                  placeholder="Key responsibilities and engineering domain..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Expectations</label>
                <textarea
                  rows={2}
                  value={careerExpectations}
                  onChange={(e) => setCareerExpectations(e.target.value)}
                  placeholder="Recruiter and technical interview expectations..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCareer(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                >
                  Create Career
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddSkill && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Add Master Skill into Catalog</h3>
            <form onSubmit={handleCreateSkill} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. Apache Spark, Golang, Swift"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={skillCat}
                  onChange={(e) => setSkillCat(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Technical">Technical</option>
                  <option value="Professional">Professional</option>
                  <option value="Tools">Tools</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={skillDesc}
                  onChange={(e) => setSkillDesc(e.target.value)}
                  placeholder="Summary of skill..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSkill(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
