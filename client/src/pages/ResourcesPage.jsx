import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Search,
  ExternalLink,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserCheck,
  Video,
  FileCode,
  GraduationCap,
  Layers,
  Award,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Code2,
  Terminal,
  Cpu,
  Database,
  Cloud,
  ChevronRight,
  ShieldAlert,
  X
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

// Standard popular skill options with icon mappings
const PRESET_SKILLS = [
  { name: 'Python', icon: Terminal, category: 'Programming Language' },
  { name: 'Java', icon: Code2, category: 'Programming Language' },
  { name: 'C', icon: Cpu, category: 'System Programming' },
  { name: 'C++', icon: Cpu, category: 'System & Competitive Programming' },
  { name: 'Data Structures & Algorithms (DSA)', icon: Layers, category: 'Computer Science Core' },
  { name: 'Machine Learning', icon: Sparkles, category: 'Data & AI' },
  { name: 'Artificial Intelligence', icon: Sparkles, category: 'Data & AI' },
  { name: 'Web Development', icon: Code2, category: 'Full Stack' },
  { name: 'React', icon: Layers, category: 'Frontend Framework' },
  { name: 'SQL', icon: Database, category: 'Database & Storage' },
  { name: 'Cloud Computing', icon: Cloud, category: 'DevOps & Infrastructure' },
];

// Curated topic suggestions dynamically mapped to preset skills
const SKILL_TOPICS_MAP = {
  'Python': [
    'Variables & Data Types',
    'Object-Oriented Programming (OOP)',
    'Web Scraping (BeautifulSoup / Scrapy)',
    'Pandas & NumPy for Data Analysis',
    'FastAPI & REST APIs',
    'Django Web Framework',
    'Data Structures & Algorithms in Python',
    'AsyncIO & Concurrency'
  ],
  'Java': [
    'Core Java Syntax & OOP Principles',
    'Java Collections Framework',
    'Spring Boot & REST APIs',
    'Multithreading & Concurrency',
    'Hibernate & Spring Data JPA',
    'JVM Architecture & Memory Management'
  ],
  'C': [
    'Pointers & Memory Addressing',
    'Dynamic Memory Allocation (malloc, free)',
    'Structs & Linked Lists in C',
    'Bitwise Operators & Bit Manipulation',
    'File Handling & Streams',
    'Operating System Syscalls in C'
  ],
  'C++': [
    'Classes, Inheritance & Polymorphism',
    'Standard Template Library (STL)',
    'Smart Pointers & Memory Management',
    'Templates & Generic Programming',
    'Modern C++ (C++17 / C++20)',
    'Competitive Programming Techniques'
  ],
  'Data Structures & Algorithms (DSA)': [
    'Arrays & Two-Pointer Techniques',
    'Linked Lists (Singly & Doubly)',
    'Stacks & Queues',
    'Binary Trees & Binary Search Trees (BST)',
    'Graph Algorithms (BFS, DFS, Dijkstra)',
    'Dynamic Programming (Memoization & Tabulation)',
    'Sorting & Binary Search Algorithms'
  ],
  'Machine Learning': [
    'Supervised Learning (Regression & Classification)',
    'Decision Trees & Random Forests',
    'Model Evaluation Metrics (Precision, Recall, ROC)',
    'Feature Engineering & Data Preprocessing',
    'Scikit-Learn Pipelines',
    'Gradient Boosting (XGBoost, LightGBM)'
  ],
  'Artificial Intelligence': [
    'Neural Networks & Backpropagation',
    'Deep Learning with PyTorch',
    'Natural Language Processing (NLP & Transformers)',
    'Computer Vision with OpenCV',
    'Large Language Models (LLMs) & Prompt Engineering',
    'Reinforcement Learning Foundations'
  ],
  'Web Development': [
    'HTML5 Semantic Markup & Accessibility',
    'Modern CSS3, Flexbox & CSS Grid',
    'Modern JavaScript (ES6+, Promises, Async/Await)',
    'DOM Manipulation & Event Handling',
    'RESTful APIs & Fetch / Axios',
    'Node.js & Express Backend Basics'
  ],
  'React': [
    'Components, JSX & Props',
    'State Management with useState & useReducer',
    'Side Effects with useEffect',
    'Custom Hooks Architecture',
    'React Router & Client-Side Navigation',
    'Context API & State Management (Zustand/Redux)'
  ],
  'SQL': [
    'Basic Queries (SELECT, WHERE, ORDER BY)',
    'Joins (INNER, LEFT, RIGHT, FULL OUTER)',
    'Aggregations (GROUP BY, HAVING)',
    'Database Normalization (1NF, 2NF, 3NF)',
    'Indexes & Query Optimization',
    'Transactions, ACID Properties & Locking'
  ],
  'Cloud Computing': [
    'Cloud Concepts & Architecture',
    'AWS Core Services (EC2, S3, IAM)',
    'Docker Containerization & Multi-Stage Builds',
    'Kubernetes Cluster Orchestration',
    'CI/CD Automation with GitHub Actions',
    'Serverless Functions (AWS Lambda)'
  ]
};

// Generates or retrieves a persistent visitor identifier stored in localStorage
function getOrCreateVisitorId() {
  let visitorId = localStorage.getItem('skillbridge_visitor_id');
  if (!visitorId) {
    visitorId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem('skillbridge_visitor_id', visitorId);
  }
  return visitorId;
}

export default function ResourcesPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Search input state
  const [selectedSkill, setSelectedSkill] = useState('Python');
  const [customSkill, setCustomSkill] = useState('');
  const [isCustomSkill, setIsCustomSkill] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState('FastAPI & REST APIs');
  const [customTopic, setCustomTopic] = useState('');
  const [isCustomTopic, setIsCustomTopic] = useState(false);

  // Search execution state
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [searchedSkill, setSearchedSkill] = useState('');
  const [searchedTopic, setSearchedTopic] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Anonymous visitor search limit state
  const [limitReached, setLimitReached] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [searchStatus, setSearchStatus] = useState(null);

  // Initial load: check anonymous search status from backend
  useEffect(() => {
    async function checkStatus() {
      if (isAuthenticated) {
        setLimitReached(false);
        return;
      }
      try {
        const vid = getOrCreateVisitorId();
        const status = await api.getResourceSearchStatus(vid);
        setSearchStatus(status);
        if (status.limit_reached) {
          setLimitReached(true);
        }
      } catch (err) {
        console.warn('Failed to fetch initial resource search status:', err);
      }
    }
    checkStatus();
  }, [isAuthenticated]);

  // Update topic suggestion when skill changes
  const handleSkillChange = (skillName) => {
    if (skillName === '__custom__') {
      setIsCustomSkill(true);
      setSelectedSkill('');
      setIsCustomTopic(true);
      setSelectedTopic('');
    } else {
      setIsCustomSkill(false);
      setSelectedSkill(skillName);
      const availableTopics = SKILL_TOPICS_MAP[skillName] || [];
      if (availableTopics.length > 0) {
        setSelectedTopic(availableTopics[0]);
        setIsCustomTopic(false);
      } else {
        setSelectedTopic('');
        setIsCustomTopic(true);
      }
    }
  };

  const handleTopicChange = (topicName) => {
    if (topicName === '__custom__') {
      setIsCustomTopic(true);
      setSelectedTopic('');
    } else {
      setIsCustomTopic(false);
      setSelectedTopic(topicName);
    }
  };

  // Perform AI-powered resource search
  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    const activeSkill = isCustomSkill ? customSkill.trim() : selectedSkill.trim();
    const activeTopic = isCustomTopic ? customTopic.trim() : selectedTopic.trim();

    if (!activeSkill) {
      alert('Please select or enter a skill to search.');
      return;
    }

    // Check if anonymous limit has already been recorded
    if (!isAuthenticated && limitReached) {
      setLimitModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      const vid = getOrCreateVisitorId();
      const payload = {
        skill: activeSkill,
        topic: activeTopic || undefined,
        visitor_id: vid
      };

      const response = await api.searchResources(payload);
      setResources(response.resources || []);
      setSearchedSkill(activeSkill);
      setSearchedTopic(activeTopic);
      setHasSearched(true);

      // If user is unauthenticated, the 1 free search has now been consumed
      if (!isAuthenticated) {
        setLimitReached(true);
        setSearchStatus({
          authenticated: false,
          search_count: 1,
          remaining_searches: 0,
          limit_reached: true
        });
      }
    } catch (err) {
      console.error('Resource search failed:', err);
      const errMsg = err.message || '';
      if (
        errMsg.includes('free AI resource search has been used') ||
        errMsg.includes('403') ||
        errMsg.includes('limit')
      ) {
        setLimitReached(true);
        setLimitModalOpen(true);
      } else {
        alert(errMsg || 'Failed to search resources. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper badge color for difficulty
  const getDifficultyColor = (diff) => {
    const d = (diff || '').toLowerCase();
    if (d.includes('beginner')) {
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
    if (d.includes('intermediate')) {
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
    return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
  };

  // Helper icon for resource type
  const getResourceTypeIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('video')) return Video;
    if (t.includes('doc')) return FileCode;
    if (t.includes('interactive') || t.includes('course')) return GraduationCap;
    return BookOpen;
  };

  const topicsList = SKILL_TOPICS_MAP[selectedSkill] || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-neutral-100 flex flex-col transition-colors duration-200">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-10 pb-12 bg-gradient-to-b from-blue-50/60 via-indigo-50/20 to-slate-50 dark:from-neutral-950 dark:via-black dark:to-black border-b border-slate-200/80 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-neutral-900 text-blue-800 dark:text-neutral-200 text-xs font-bold border border-blue-200 dark:border-neutral-700">
              <Sparkles size={14} className="text-blue-600 dark:text-neutral-300" />
              <span>AI-Powered Learning Resource Finder</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Discover Verified Learning Resources,{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-white dark:via-neutral-300 dark:to-neutral-400 bg-clip-text text-transparent">
                Curated by AI
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
              Select any programming language, core computer science domain, or custom technical skill. Our AI agent compiles active, high-authority courses, verified documentation, and video tutorials.
            </p>

            {/* Authentication & Free Search Status Indicator */}
            <div className="pt-2 flex items-center justify-center">
              {isAuthenticated ? (
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                  <UserCheck size={14} />
                  <span>Authenticated Student • Unlimited AI Searches Unlocked</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
                  <Lock size={13} />
                  <span>
                    {limitReached
                      ? 'Free Search Used (1 of 1) • Register to Unlock Unlimited Searches'
                      : 'Anonymous Visitor • 1 Free AI Resource Search Available'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Search Box & Results */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Free Search Limit Notice Banner (Visible when unauthenticated user has consumed their 1 free search) */}
        {!isAuthenticated && limitReached && (
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-neutral-900 border border-amber-200 dark:border-neutral-700 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-neutral-800 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <AlertCircle size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Your free AI resource search has been used!
                </h4>
                <p className="text-xs text-slate-600 dark:text-neutral-400">
                  Register or log in to Skill Bridge to unlock unlimited access to personalized learning resources.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 w-full sm:w-auto shrink-0">
              <Link
                to="/register"
                className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-white dark:to-neutral-200 text-white dark:text-black font-bold text-xs shadow-md shadow-blue-500/20 dark:shadow-none transition-all"
              >
                Register Now
              </Link>
              <Link
                to="/login"
                className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 font-semibold text-xs transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        )}

        {/* AI Resource Search Form Card */}
        <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-slate-200/90 dark:border-neutral-800 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100 dark:border-neutral-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-white dark:to-neutral-300 text-white dark:text-black flex items-center justify-center font-bold shadow-md">
              <Search size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Find High-Authority Learning Materials
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Choose a skill and topic below, or type custom requirements.
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* 1. Skill Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                  1. Select Skill or Technology
                </label>

                <div className="relative">
                  <select
                    value={isCustomSkill ? '__custom__' : selectedSkill}
                    onChange={(e) => handleSkillChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-hidden transition-all cursor-pointer"
                  >
                    {PRESET_SKILLS.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                    <option value="__custom__">-- Type Custom Skill... --</option>
                  </select>
                </div>

                {/* Custom Skill Input Field if selected */}
                {isCustomSkill && (
                  <div className="pt-1.5 animate-in fade-in">
                    <input
                      type="text"
                      placeholder="e.g. Rust, Go, GraphQL, Cyber Security, Flutter"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-blue-400 dark:border-neutral-600 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* 2. Topic Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                  2. Select Focus Topic
                </label>

                <div className="relative">
                  <select
                    value={isCustomTopic ? '__custom__' : selectedTopic}
                    onChange={(e) => handleTopicChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 focus:outline-hidden transition-all cursor-pointer"
                  >
                    {topicsList.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value="__custom__">-- Type Custom Topic... --</option>
                  </select>
                </div>

                {/* Custom Topic Input Field if selected */}
                {isCustomTopic && (
                  <div className="pt-1.5 animate-in fade-in">
                    <input
                      type="text"
                      placeholder="e.g. Memory profiling, JWT auth, WebSockets, Redux Toolkit"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-blue-400 dark:border-neutral-600 text-slate-900 dark:text-white text-sm placeholder-slate-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Skill Selector Badges */}
            <div className="pt-2 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                Popular Quick Picks:
              </span>
              <div className="flex flex-wrap gap-2">
                {['Python', 'Web Development', 'DSA', 'Machine Learning', 'React', 'SQL', 'Cloud Computing'].map((pill) => {
                  const isCur = (!isCustomSkill && selectedSkill.toLowerCase().includes(pill.toLowerCase()));
                  return (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => handleSkillChange(pill === 'DSA' ? 'Data Structures & Algorithms (DSA)' : pill)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isCur
                          ? 'bg-blue-600 dark:bg-white text-white dark:text-black shadow-sm'
                          : 'bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {pill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Find Best Learning Resources Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-white dark:to-neutral-200 dark:hover:bg-neutral-300 text-white dark:text-black font-bold text-sm shadow-lg shadow-blue-500/25 dark:shadow-none transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw size={17} className="animate-spin" />
                    <span>AI Is Searching Verified Resources...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    <span>Find Best Learning Resources</span>
                  </>
                )}
              </button>

              <div className="text-xs text-slate-500 dark:text-neutral-400 flex items-center space-x-1.5">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span>Verified active URLs only • No broken links</span>
              </div>
            </div>
          </form>
        </div>

        {/* Search Results Display Area */}
        {hasSearched && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-neutral-800">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>AI Recommended Resources for</span>
                  <span className="text-blue-600 dark:text-neutral-300 underline underline-offset-4 decoration-blue-400">
                    {searchedSkill}
                  </span>
                  {searchedTopic && (
                    <span className="text-slate-500 dark:text-neutral-400 text-base font-normal">
                      • {searchedTopic}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                  Showing {resources.length} verified learning materials reviewed by AI.
                </p>
              </div>

              {!isAuthenticated && (
                <span className="text-xs px-3 py-1 rounded-full bg-amber-50 dark:bg-neutral-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-neutral-700 font-semibold w-fit">
                  Free Search Used (1 of 1)
                </span>
              )}
            </div>

            {/* Resources Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {resources.map((res, index) => {
                const TypeIcon = getResourceTypeIcon(res.resource_type);
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-neutral-950 rounded-2xl p-6 border border-slate-200/90 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-5 group"
                  >
                    {/* Top Row: Provider Platform & Difficulty Badges */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {/* Platform Badge */}
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-neutral-900 text-blue-700 dark:text-neutral-200 text-xs font-bold border border-blue-200 dark:border-neutral-700">
                          <TypeIcon size={14} className="text-blue-600 dark:text-neutral-400" />
                          <span>{res.platform || 'Verified Platform'}</span>
                        </div>

                        {/* Badges: Resource Type & Difficulty */}
                        <div className="flex items-center space-x-2">
                          {res.resource_type && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700">
                              {res.resource_type}
                            </span>
                          )}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getDifficultyColor(
                              res.difficulty
                            )}`}
                          >
                            {res.difficulty || 'Intermediate'}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-neutral-300 transition-colors leading-snug">
                        {res.title}
                      </h4>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                        {res.description}
                      </p>

                      {/* What the student will learn */}
                      {res.what_you_will_learn && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900/70 border border-slate-100 dark:border-neutral-800/80 text-xs space-y-1">
                          <span className="font-bold text-slate-700 dark:text-neutral-300 flex items-center space-x-1">
                            <CheckCircle2 size={13} className="text-emerald-500" />
                            <span>What You Will Learn:</span>
                          </span>
                          <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
                            {res.what_you_will_learn}
                          </p>
                        </div>
                      )}

                      {/* Why AI Recommends this Resource */}
                      {res.why_recommended && (
                        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/50 dark:from-neutral-900 dark:to-neutral-900/60 border border-blue-200/70 dark:border-neutral-800 text-xs space-y-1">
                          <div className="flex items-center space-x-1.5 font-bold text-blue-900 dark:text-neutral-200">
                            <Sparkles size={13} className="text-blue-600 dark:text-neutral-300" />
                            <span>Why AI Recommends This:</span>
                          </div>
                          <p className="text-slate-700 dark:text-neutral-400 italic leading-snug">
                            "{res.why_recommended}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action: Visit Resource Button */}
                    <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white text-xs font-bold shadow-sm transition-all hover:shadow-md cursor-pointer"
                      >
                        <span>Visit Resource</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Prominent Modal for Free Search Limit Reached */}
      {limitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setLimitModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Header Icon */}
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <ShieldAlert size={26} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                Your free AI resource search has been used!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                Register or log in to Skill Bridge to unlock unlimited access to personalized learning resources, custom skill roadmaps, and full gap diagnostics.
              </p>
            </div>

            {/* Feature Perks of Registering */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-700 dark:text-neutral-300">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Unlimited AI resource searches across 50+ engineering skills</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-neutral-300">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Personalized 5-Phase learning roadmap generator</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-neutral-300">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Interactive technical skill assessments & verified badges</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/register"
                onClick={() => setLimitModalOpen(false)}
                className="w-full text-center py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-white dark:to-neutral-200 text-white dark:text-black font-bold text-xs shadow-md shadow-blue-500/20 dark:shadow-none transition-all"
              >
                Register Now
              </Link>
              <Link
                to="/login"
                onClick={() => setLimitModalOpen(false)}
                className="w-full text-center py-2.5 px-4 rounded-xl border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-900 font-semibold text-xs transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
