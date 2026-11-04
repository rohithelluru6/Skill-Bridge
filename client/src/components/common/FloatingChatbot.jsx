import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  Bot,
  User,
  Sparkles,
  ChevronDown,
  Compass,
  ArrowRight
} from 'lucide-react';

const KNOWLEDGE_BASE = [
  {
    keywords: ['what is skill bridge', 'about skill bridge', 'who is skill bridge', 'platform overview', 'what is this website'],
    answer: "Skill Bridge is an AI-powered platform that helps engineering students identify their skill gaps and build personalized career roadmaps."
  },
  {
    keywords: ['skill gap analysis', 'gap analysis', 'what is skill gap', 'skill gap'],
    answer: "Skill gap analysis compares your current skills with the skills required for your selected career. It identifies your strengths, missing skills, and areas that need improvement."
  },
  {
    keywords: ['career roadmap', 'how does the roadmap work', 'roadmap generator', 'phases'],
    answer: "Based on your existing skills and career goal, Skill Bridge generates a personalized learning roadmap with different phases, tasks, resources, and projects."
  },
  {
    keywords: ['track my progress', 'progress tracking', 'track progress', 'how can i track my progress', 'velocity'],
    answer: "You can visit your dashboard to monitor completed tasks, pending activities, skill improvements, and your overall career readiness."
  },
  {
    keywords: ['readiness score', 'career readiness score', 'how is readiness calculated', 'score'],
    answer: "The Career Readiness Score represents how closely your current skills match the industry requirements for your target role on a 0-100% scale. It is calculated by weighting your skill proficiencies against industry benchmarks."
  },
  {
    keywords: ['register', 'registration', 'sign up', 'how to register', 'account creation'],
    answer: "To register, click the 'Register' button in the upper-right corner of the navbar. Enter your full name, email, password, college name, degree, engineering branch, academic year, and expected graduation year."
  },
  {
    keywords: ['login', 'sign in', 'demo login', 'credentials', 'password'],
    answer: "You can log in via the 'Log In' link in the navbar. For quick testing, use the 1-click Demo buttons: Student (student@skillbridge.edu / password123) or Admin (admin@skillbridge.edu / admin123)."
  },
  {
    keywords: ['student dashboard', 'dashboard features', 'what is in dashboard'],
    answer: "The Student Dashboard gives you a complete overview: your overall career readiness score, target career goal, roadmap completion percentage, radar chart comparison, priority skill gaps, and recent activities."
  },
  {
    keywords: ['skill assessment', 'assessment', 'how to assess', 'rating system', 'proficiency'],
    answer: "In the Skill Assessment module, you can select your engineering branch and rate your skills from 0 to 5. You can also take diagnostic quizzes to earn verified badges and add custom technical skills."
  },
  {
    keywords: ['technical skills', 'professional skills', 'skills list'],
    answer: "Skill Bridge supports technical skills (Python, Java, SQL, React, Machine Learning, Data Structures, Cloud Computing, etc.) and professional skills (Communication, Problem Solving, Teamwork, Leadership, Critical Thinking, Time Management)."
  },
  {
    keywords: ['career goal', 'career selection', 'careers', 'target role', 'pathways'],
    answer: "You can explore 9 top industry careers: Software Developer, AI/ML Engineer, Data Scientist, Full Stack Developer, Cloud Engineer, DevOps Engineer, Cybersecurity Analyst, Data Analyst, and UI/UX Designer. Selecting a career customizes your gap analysis."
  },
  {
    keywords: ['learning resources', 'resources', 'courses', 'documentation'],
    answer: "The Learning Resource Recommender provides vetted, verified tutorials, official documentation, and free courses (such as Harvard CS50, FreeCodeCamp, and MDN) tailored specifically to your missing skills."
  },
  {
    keywords: ['project recommendations', 'projects', 'portfolio', 'capstone'],
    answer: "Skill Bridge recommends beginner, intermediate, and advanced portfolio projects for each career path, complete with tech stacks, learning outcomes, and starter code links to help you build job-ready applications."
  },
  {
    keywords: ['admin', 'admin dashboard', 'admin portal', 'administrator'],
    answer: "The Admin Dashboard allows platform administrators to inspect registered student cohorts across universities, view platform health metrics, and add new career tracks and master skills."
  },
  {
    keywords: ['dark mode', 'dark theme', 'theme'],
    answer: "You can toggle between Dark and Light mode at any time by clicking the Skill Bridge AI EdTech logo in the upper navigation bar! Your preference is saved automatically."
  }
];

function getBotResponse(input) {
  const query = input.toLowerCase().trim();

  // Find best match in knowledge base
  for (const item of KNOWLEDGE_BASE) {
    for (const kw of item.keywords) {
      if (query.includes(kw)) {
        return item.answer;
      }
    }
  }

  // Token-based similarity check
  const words = query.split(/\s+/).filter(w => w.length > 2);
  let bestMatch = null;
  let maxScore = 0;

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      for (const w of words) {
        if (kw.includes(w)) score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item.answer;
    }
  }

  if (maxScore >= 2 && bestMatch) {
    return bestMatch;
  }

  return (
    "I'm here to help explain any feature of Skill Bridge! You can ask about our skill gap analysis, 5-phase career roadmaps, skill assessments, target careers, progress tracking, or how to register."
  );
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! Welcome to Skill Bridge. I'm your AI assistant. I can explain all the features of this platform and help you understand how to use them.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend) => {
    const text = typeof textToSend === 'string' ? textToSend : inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate natural AI thinking delay
    setTimeout(() => {
      const botReplyText = getBotResponse(userMsg.text);
      const botMsg = {
        sender: 'bot',
        text: botReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: "Hello! Welcome to Skill Bridge. I'm your AI assistant. I can explain all the features of this platform and help you understand how to use them.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const sampleQuestions = [
    'What is Skill Bridge?',
    'What is skill gap analysis?',
    'How does the career roadmap work?',
    'How can I track my progress?'
  ];

  return (
    <>
      {/* Floating Chatbot Launcher Button in Bottom-Right Corner (leaving ~3 lines of space from bottom) */}
      <div className="fixed bottom-7 right-6 z-50 flex flex-col items-end pointer-events-auto">
        {!isOpen && (
          <div className="relative group flex items-center">
            {/* Tooltip saying "Ask Skill Bridge" */}
            <span className="mr-3 px-3 py-1.5 rounded-xl bg-slate-900/90 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-lg whitespace-nowrap pointer-events-none transition-all duration-200 group-hover:scale-105">
              Ask Skill Bridge
              <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-slate-900/90 dark:bg-white" />
            </span>

            {/* Circular Chatbot Icon Launcher */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Open Skill Bridge AI Assistant"
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-hidden ring-4 ring-white/80 dark:ring-slate-800"
            >
              <Bot size={28} className="stroke-[2.2]" />
            </button>
          </div>
        )}

        {/* Professional Chat Window */}
        {isOpen && (
          <div className="w-[92vw] sm:w-[400px] h-[520px] max-h-[82vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">Skill Bridge AI Assistant</h3>
                  <p className="text-[11px] text-blue-100 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Always Available • Feature Guide</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {/* Clear Chat Button */}
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/15 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat window"
                  className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/15 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Conversation Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-50/50 dark:bg-slate-950/40">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-2 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={15} />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">
                      U
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 text-xs pl-9">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.3s]" />
                  <span className="text-[11px] text-slate-400 ml-1">AI Assistant is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Pills */}
            <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 shrink-0 font-medium text-[10px]">Ask:</span>
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 shrink-0 transition-colors border border-slate-200/60 dark:border-slate-700 whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about roadmaps, skill gaps, quizzes..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-all shadow-sm shadow-blue-500/20"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
