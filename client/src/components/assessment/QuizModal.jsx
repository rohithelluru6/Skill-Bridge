import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Award, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';
import confetti from 'canvas-confetti';

export default function QuizModal({ skill, onClose, onAssessmentCompleted }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getAssessmentQuestions(skill.id || skill.skill_id);
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.message || 'Failed to load assessment questions.');
      } finally {
        setLoading(false);
      }
    }
    if (skill) {
      loadQuiz();
    }
  }, [skill]);

  const handleSelectOption = (questionId, optionIdx) => {
    if (result) return; // Locked once submitted
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < questions.length) {
      alert(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const answersPayload = Object.entries(selectedAnswers).map(([qId, optIdx]) => ({
        question_id: parseInt(qId),
        selected_option_index: optIdx
      }));

      const res = await api.submitAssessment({
        skill_id: skill.id || skill.skill_id,
        answers: answersPayload
      });

      setResult(res);

      if (res.percentage >= 65) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      if (onAssessmentCompleted) {
        onAssessmentCompleted(res);
      }
    } catch (err) {
      setError(err.message || 'Error submitting assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Award className="text-yellow-300" size={22} />
            <div>
              <h3 className="font-bold text-lg leading-tight">Skill Verification: {skill.name || skill.skill_name}</h3>
              <p className="text-xs text-blue-100">Diagnostic Technical Assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-sm font-medium text-slate-600">Loading diagnostic questions...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start space-x-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Notice</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <p>No questions currently seeded for this specific skill.</p>
            </div>
          ) : result ? (
            /* Results Screen */
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200/80 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white font-black text-xl mb-3 shadow-md shadow-blue-500/20">
                  {Math.round(result.percentage)}%
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  {result.percentage >= 70 ? 'Skill Verified Successfully!' : 'Assessment Complete'}
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Assigned Rating: <strong className="text-blue-700">{result.calculated_rating} / 5.0</strong> ({result.proficiency_level})
                  • Score: {result.correct_answers} of {result.total_questions} correct
                </p>
              </div>

              {/* Feedback list */}
              <div className="space-y-4">
                <h5 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Question Breakdown</h5>
                {result.feedback?.map((fb, idx) => {
                  const q = questions.find(item => item.id === fb.question_id);
                  return (
                    <div
                      key={fb.question_id}
                      className={`p-4 rounded-xl border ${
                        fb.is_correct ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                      }`}
                    >
                      <div className="flex items-start space-x-2.5">
                        {fb.is_correct ? (
                          <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div className="text-xs space-y-1">
                          <p className="font-semibold text-slate-800">
                            Q{idx + 1}: {q?.question}
                          </p>
                          <p className="text-slate-600 italic">
                            Explanation: {fb.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Questions List */
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>{questions.length} Diagnostic Multiple-Choice Questions</span>
                <span>Select one best answer per question</span>
              </div>

              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 space-y-3">
                  <div className="flex items-start space-x-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {q.question}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pl-7">
                    {q.options?.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[q.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border transition-all ${
                            isSelected
                              ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-600'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span>{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            {result ? 'Done' : 'Cancel'}
          </button>

          {!result && questions.length > 0 && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Grading...</span>
                </>
              ) : (
                <>
                  <span>Submit Assessment</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
