import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/content/supabaseClient';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation?: string;
}

export default function MCQTest({ topicId }: { topicId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Filter State: 'all' | 'wrong' | 'correct'
  const [filterMode, setFilterMode] = useState<'all' | 'wrong' | 'correct'>('all');

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);

      // Supabase se questions aur explanation fetch karna
      const { data, error } = await supabase
        .from('mcq_questions')
        .select('id, question_text, options, correct_option, explanation')
        .eq('topic_id', topicId);

      if (!error && data) {
        setQuestions(data);
      }
      setLoading(false);
    }
    fetchQuestions();
  }, [topicId]);

  const handleOptionSelect = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: optionIndex,
    });
  };

  // Galat aur Sahi questions ke index nikalna
  const wrongIndices = questions
    .map((q, idx) => (selectedAnswers[idx] !== undefined && selectedAnswers[idx] !== q.correct_option ? idx : -1))
    .filter((idx) => idx !== -1);

  const correctIndices = questions
    .map((q, idx) => (selectedAnswers[idx] === q.correct_option ? idx : -1))
    .filter((idx) => idx !== -1);

  // Active filter ke hisab se index list select karna
  let activeIndices = questions.map((_, idx) => idx);
  if (isSubmitted && filterMode === 'wrong') activeIndices = wrongIndices;
  if (isSubmitted && filterMode === 'correct') activeIndices = correctIndices;

  const calculateScore = () => correctIndices.length;

  if (loading) return <div className="p-4 text-center text-sm text-stone-400">Questions Load Ho Rahe Hain...</div>;
  if (questions.length === 0) return <div className="p-4 text-center text-sm text-stone-400">Is topic ke test questions abhi add nahi hue hain.</div>;

  const actualIndex = activeIndices[currentIndex] ?? 0;
  const currentQ = questions[actualIndex];
  const userAns = selectedAnswers[actualIndex];
  const isCorrectAns = userAns === currentQ?.correct_option;

  return (
    <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-stone-100 mt-2">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-3">
        <h4 className="text-sm font-bold text-amber-400">MCQ Practice Test</h4>
        <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
          Q {currentIndex + 1} / {activeIndices.length}
        </span>
      </div>

      {/* Result Scoreboard & Filter Tabs (Test Submit Hone Ke Baad) */}
      {isSubmitted && (
        <div className="bg-stone-900 border border-stone-800 p-3 rounded-xl mb-4 space-y-3">
          <div className="text-center">
            <h5 className="text-base font-bold text-emerald-400">Test Completed! 🎉</h5>
            <p className="text-xs text-stone-300 mt-0.5">
              Aapka Score: <span className="text-amber-400 font-bold">{calculateScore()}</span> / {questions.length} | 
              <span className="text-rose-400 font-bold ml-1.5">{wrongIndices.length} Galat</span>
            </p>
          </div>

          {/* Filters: Sabhi / Galat / Sahi */}
          <div className="flex gap-1.5 justify-center pt-1 border-t border-stone-800 text-xs">
            <button
              onClick={() => { setFilterMode('all'); setCurrentIndex(0); }}
              className={`px-2.5 py-1 rounded-lg border font-medium ${filterMode === 'all' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-stone-950 border-stone-800 text-stone-400'}`}
            >
              Sabhi ({questions.length})
            </button>
            <button
              onClick={() => { setFilterMode('wrong'); setCurrentIndex(0); }}
              className={`px-2.5 py-1 rounded-lg border font-medium ${filterMode === 'wrong' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-stone-950 border-stone-800 text-stone-400'}`}
            >
              ❌ Galat ({wrongIndices.length})
            </button>
            <button
              onClick={() => { setFilterMode('correct'); setCurrentIndex(0); }}
              className={`px-2.5 py-1 rounded-lg border font-medium ${filterMode === 'correct' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-stone-950 border-stone-800 text-stone-400'}`}
            >
              ✅ Sahi ({correctIndices.length})
            </button>
          </div>
        </div>
      )}

      {/* Question Section */}
      {activeIndices.length > 0 ? (
        <div className="mb-4">
          <p className="text-stone-100 font-medium text-sm sm:text-base mb-3 leading-relaxed">
            {actualIndex + 1}. {currentQ.question_text}
          </p>

          {/* Options */}
          <div className="space-y-2">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = userAns === optIdx;
              const isCorrect = currentQ.correct_option === optIdx;

              let btnStyle = "w-full text-left p-2.5 rounded-lg border text-xs sm:text-sm font-medium transition-all ";

              if (isSubmitted) {
                if (isCorrect) {
                  btnStyle += "bg-emerald-900/60 border-emerald-500 text-emerald-200 font-bold";
                } else if (isSelected && !isCorrect) {
                  btnStyle += "bg-rose-900/60 border-rose-500 text-rose-200";
                } else {
                  btnStyle += "bg-stone-900 border-stone-800 text-stone-500";
                }
              } else {
                if (isSelected) {
                  btnStyle += "bg-amber-600 border-amber-500 text-white shadow-sm";
                } else {
                  btnStyle += "bg-stone-900 hover:bg-stone-800 border-stone-800 text-stone-300";
                }
              }

              return (
                <button key={optIdx} onClick={() => handleOptionSelect(optIdx)} className={btnStyle}>
                  {String.fromCharCode(65 + optIdx)}. {opt}
                </button>
              );
            })}
          </div>

          {/* Explanation Box (Submit Ke Baad Dikhne Wala Part) */}
          {isSubmitted && (
            <div className="mt-4 p-3 rounded-lg border border-stone-800 bg-stone-900/80 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-400">Status:</span>
                {userAns === undefined ? (
                  <span className="text-stone-400 font-semibold">Not Attempted (छोड़ा गया)</span>
                ) : isCorrectAns ? (
                  <span className="text-emerald-400 font-bold">✓ Sahi Uttar</span>
                ) : (
                  <span className="text-rose-400 font-bold">✗ Galat Uttar</span>
                )}
              </div>

              <p className="text-emerald-300 font-medium">
                <span className="font-bold text-stone-400">Sahi Option:</span> {String.fromCharCode(65 + currentQ.correct_option)}. {currentQ.options[currentQ.correct_option]}
              </p>

              {currentQ.explanation && (
                <div className="mt-2 pt-2 border-t border-stone-800 text-stone-300">
                  <span className="font-bold text-amber-400 block mb-1">💡 व्याख्या / Vivran:</span>
                  <p className="leading-relaxed text-stone-300">{currentQ.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 text-center text-xs text-stone-400">Is filter mein koi questions nahi hain.</div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between items-center border-t border-stone-800 pt-3">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
          className="px-3 py-1.5 bg-stone-800 text-stone-300 text-xs rounded-lg disabled:opacity-40"
        >
          Previous
        </button>

        {!isSubmitted && currentIndex === questions.length - 1 ? (
          <button
            onClick={() => setIsSubmitted(true)}
            className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700"
          >
            Submit Test
          </button>
        ) : (
          <button
            disabled={currentIndex === activeIndices.length - 1}
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="px-3 py-1.5 bg-amber-600 text-white text-xs rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
