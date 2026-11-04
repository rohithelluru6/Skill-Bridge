import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Sparkles,
  GitCompare,
  Map,
  Award,
  Layers,
  TrendingUp,
  CheckCircle2,
  Brain,
  ShieldCheck,
  Code2,
  Terminal,
  ChevronRight,
  Star
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  const stats = [
    { label: 'Students Guided', value: '15,000+' },
    { label: 'Career Readiness Gain', value: '94%' },
    { label: 'Curated Pathways', value: '50+' },
    { label: 'Verified Resources', value: '250+' },
  ];

  const features = [
    {
      icon: GitCompare,
      title: 'AI-Powered Skill Gap Analysis',
      description: 'Mathematically compares your current proficiencies against real-world job benchmarks to spotlight high, medium, and low priority deficits.',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      icon: Map,
      title: 'Personalized 5-Phase Roadmaps',
      description: 'Generates structured weekly learning schedules taking into account your engineering branch, academic year, and weekly hours.',
      color: 'from-indigo-600 to-purple-600',
    },
    {
      icon: Award,
      title: 'Verified Skill Diagnostics',
      description: 'Validate your competencies with interactive technical assessments and earn verified badges on your skill profile.',
      color: 'from-purple-600 to-pink-600',
    },
    {
      icon: Layers,
      title: 'Tiered Project Blueprints',
      description: 'Step-by-step beginner, intermediate, and advanced project ideas with real architectural trade-offs, technologies, and starter repos.',
      color: 'from-cyan-600 to-blue-600',
    },
    {
      icon: Brain,
      title: 'Vetted Industry Resources',
      description: 'Never waste time with dead links. Access verified documentation, FreeCodeCamp courses, and Harvard CS50 tutorials.',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      icon: TrendingUp,
      title: 'Progress Velocity Tracker',
      description: 'Monitor task completion rates, weekly learning hours, and watch your career readiness score rise towards 100%.',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Self-Assess & Verify Skills',
      desc: 'Enter your technical and professional proficiencies (0-5) across programming, math, and tools, or take quick diagnostic quizzes.',
    },
    {
      step: '02',
      title: 'Target Your Dream Career Role',
      desc: 'Explore software development, AI/ML, cloud, data science, or cybersecurity roles with detailed industry expectations.',
    },
    {
      step: '03',
      title: 'Run AI Skill Gap Analysis',
      desc: 'Our engine identifies missing prerequisites, computes your readiness score, and categorizes gaps by hiring priority.',
    },
    {
      step: '04',
      title: 'Execute Your 5-Phase Roadmap',
      desc: 'Check off weekly milestones from foundational concepts to capstone projects, coding interview prep, and internships.',
    },
  ];

  const careerPreview = [
    { title: 'AI/ML Engineer', category: 'Artificial Intelligence', demand: 'Extremely High', icon: Brain, salary: '$95k - $175k / ₹12-35 LPA' },
    { title: 'Software Developer', category: 'Software Engineering', demand: 'Very High', icon: Code2, salary: '$75k - $140k / ₹8-24 LPA' },
    { title: 'Full Stack Developer', category: 'Web Engineering', demand: 'Very High', icon: Layers, salary: '$80k - $145k / ₹9-26 LPA' },
    { title: 'Cybersecurity Analyst', category: 'Information Security', demand: 'High', icon: ShieldCheck, salary: '$80k - $145k / ₹9-25 LPA' },
  ];

  const testimonials = [
    {
      name: 'Alex Rivera',
      branch: 'Computer Science Engineering (3rd Year)',
      college: 'MIT Institute of Technology',
      rating: 5,
      quote: 'Skill Bridge revealed that while my Python was solid, I was missing Docker and production SQL. The 5-phase roadmap helped me land a summer AI engineering internship!',
    },
    {
      name: 'Priya Sharma',
      branch: 'Artificial Intelligence & Data Science (4th Year)',
      college: 'National Institute of Technology',
      rating: 5,
      quote: 'The skill gap visualizer made it crystal clear where my resume was lacking. The curated project blueprints gave me talking points that impressed tech recruiters.',
    },
    {
      name: 'Marcus Chen',
      branch: 'Electronics & Communication (3rd Year)',
      college: 'California State Polytechnic',
      rating: 5,
      quote: 'Transitioning from hardware-heavy coursework to cloud engineering felt daunting until Skill Bridge mapped out my personalized weekly learning plan.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/60 via-indigo-50/30 to-slate-50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-indigo-400/10 blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold border border-blue-200">
                <Sparkles size={14} className="text-blue-600 animate-spin" />
                <span>AI-Powered Career Intelligence for Engineers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Bridge Your Skills.{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Build Your Future.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Discover your skill gaps, explore career opportunities, and follow an AI-powered roadmap to become industry-ready.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-0.5"
                >
                  <span>Get Started Free</span>
                  <ArrowRight size={18} />
                </Link>

                <a
                  href="#careers"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-300/80 shadow-xs transition-all hover:border-slate-400"
                >
                  <span>Explore Career Paths</span>
                  <ChevronRight size={18} />
                </a>
              </div>

              {/* Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-500">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Branch-Specific Calibrations</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Real LLM & Rule-Based Fallback</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Interactive Diagnostics</span>
                </span>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glow behind */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-lg opacity-30 animate-pulse" />

                <div className="relative rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/80 space-y-5">
                  {/* Mock Profile Card */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        SB
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Career Readiness Snapshot</h4>
                        <p className="text-xs text-slate-500">AI/ML Engineer • 3rd Year CSE</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                      78% Ready
                    </span>
                  </div>

                  {/* Skill Comparison Preview */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Live Gap Detection
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">Python Programming</span>
                        <span className="text-slate-500">You: 4.5 / Target: 5.0</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '90%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">Machine & Deep Learning</span>
                        <span className="text-rose-600 font-semibold">Gap: -2.5 (High Priority)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: '40%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">Cloud & Docker Deployment</span>
                        <span className="text-amber-600 font-semibold">Gap: -1.5 (Medium Priority)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>
                  </div>

                  {/* AI Generated Recommendation Box */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-xs text-slate-700 space-y-1.5">
                    <div className="flex items-center space-x-1.5 font-bold text-blue-900">
                      <Sparkles size={14} className="text-blue-600" />
                      <span>AI Mentor Next Step</span>
                    </div>
                    <p className="text-slate-600 leading-snug">
                      Focus on Phase 2: Neural network architectures & Docker containerization before applying to tier-1 roles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Bar */}
      <section className="bg-white border-y border-slate-200/80 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-600">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Student Career Acceleration
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Everything you need to evaluate where you stand today, master required technical competencies, and step confidently into high-demand engineering careers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-7 shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-200/80 flex flex-col justify-between hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${f.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How Skill Bridge Works */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              The Blueprint
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How Skill Bridge Works
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              A systematic 4-step framework bridging academia with top industry engineering expectations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                <span className="text-3xl font-black text-blue-600/30">{s.step}</span>
                <h4 className="text-base font-bold text-slate-900">{s.title}</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Pathways Showcase */}
      <section id="careers" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Industry Roles
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                Popular Engineering Career Tracks
              </h2>
              <p className="text-sm text-slate-600">
                Explore comprehensive skill profiles, salary brackets, and tools demanded by top tech enterprises.
              </p>
            </div>
            <Link
              to="/register"
              className="mt-4 md:mt-0 inline-flex items-center space-x-1 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              <span>View All 9 Pathways</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {careerPreview.map((c, idx) => {
              const Icon = c.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase text-slate-400">{c.category}</span>
                    <h4 className="text-base font-bold text-slate-900">{c.title}</h4>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>Demand: <strong className="text-emerald-600">{c.demand}</strong></p>
                    <p className="text-slate-500">{c.salary}</p>
                  </div>
                  <Link
                    to="/register"
                    className="block text-center py-2 px-3 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Assess My Alignment
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sample Student Testimonials */}
      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Sample Student Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Empowering Students Across Top Universities
            </h2>
            <p className="text-xs text-slate-500 italic">
              *Clearly identified sample student case studies illustrating platform impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-7 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={16} className="fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <h5 className="text-sm font-bold text-slate-900">{t.name}</h5>
                  <p className="text-xs text-slate-500">{t.branch}</p>
                  <p className="text-xs text-blue-600 font-medium">{t.college}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs uppercase font-bold tracking-wider text-blue-300 bg-blue-800/60 px-3.5 py-1 rounded-full border border-blue-700">
            About Skill Bridge
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto">
            Closing the College-to-Industry Divide
          </h2>
          <p className="text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Every year, thousands of engineering students graduate with theoretical knowledge but uncertainty about how their skillset translates to modern job requirements. Skill Bridge is built to eliminate ambiguity through transparent mathematical skill gap detection, objective assessments, and actionable step-by-step career roadmaps.
          </p>
          <div className="pt-4">
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-blue-900 font-bold text-base shadow-xl transition-all"
            >
              <span>Join Skill Bridge Today</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
