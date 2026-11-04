import React from 'react';
import { Compass, Globe, Share2, Code2, Mail, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Compass size={20} className="stroke-[2.2]" />
              </div>
              <span className="text-xl font-bold text-white">Skill Bridge</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-driven skill gap analysis and personalized career roadmap recommendation platform designed specifically for engineering undergraduates.
            </p>
            <div className="flex items-center space-x-3 text-slate-400 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors" aria-label="GitHub">
                <Code2 size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors" aria-label="LinkedIn">
                <Globe size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors" aria-label="Twitter">
                <Share2 size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/#features" className="hover:text-blue-400 transition-colors">AI Gap Analysis</Link></li>
              <li><Link to="/#careers" className="hover:text-blue-400 transition-colors">Career Pathways</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</Link></li>
              <li><Link to="/register" className="hover:text-blue-400 transition-colors">Student Sign Up</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Account Login</Link></li>
            </ul>
          </div>

          {/* Engineering Disciplines */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Engineering Branches</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Computer Science (CSE)</li>
              <li>Information Technology (IT)</li>
              <li>AI & Machine Learning (AIML)</li>
              <li>Data Science (DS)</li>
              <li>Electronics & Communication (ECE)</li>
              <li>Electrical & Mechanical (EEE/ME)</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Student Support</h4>
            <p className="text-sm text-slate-400 mb-3 leading-relaxed">
              Have questions about your roadmap or technical assessments? Our academic mentoring team is ready to help.
            </p>
            <div className="flex items-center space-x-2 text-sm text-blue-400 font-medium">
              <Mail size={16} />
              <span>support@skillbridge.edu</span>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p className="max-w-2xl leading-relaxed">
            <strong className="text-slate-400">Academic Notice:</strong> Skill scores and career readiness calculations are algorithmic estimates based on student-provided self-ratings and interactive diagnostic assessments, and do not constitute official industry certifications.
          </p>
          <p className="shrink-0">
            &copy; {new Date().getFullYear()} Skill Bridge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
