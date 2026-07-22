import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/content/supabaseClient';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_option: number;
}

export default function MCQTest({ topicId }: { topicId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      const { data, error } = await supabase
        .from('mcq_questions')
        .select('id, question_text, options, correct_option')
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

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_option) {
        score += 1;
      }
    });
    return score;
  };

  if (loading) return <div className="p-6 text-center text-lg">Questions Load Ho Rahe Hain...</div>;
  if (questions.length === 0) return <div className="p-6 text-center">Is topic mein abhi test questions nahi hain.</div>;

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-lg mt-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <h2 className="text-lg font-bold text-gray-800">MCQ Practice Test</h2>
        <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded">
          Q {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Result Scoreboard (Sirf submit ke baad dikhega) */}
      {isSubmitted && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6 text-center">
          <h3 className="text-2xl font-extrabold text-green-700">Test Completed! 🎉</h3>
          <p className="text-lg mt-2 font-medium">
            Aapka Score: <span className="text-blue-600 font-bold">{calculateScore()}</span> / {questions.length}
          </p>
        </div>
      )}

      {/* Question & Options */}
      <div className="mb-6">
        <p className="text-gray-900 font-medium text-base sm:text-lg mb-4">
          {currentIndex + 1}. {currentQ.question_text}
        </p>

        <div className="space-y-3">
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = selectedAnswers[currentIndex] === optIdx;
            const isCorrect = currentQ.correct_option === optIdx;

            let btnStyle = "w-full text-left p-3 rounded-md border font-medium transition-all ";

            if (isSubmitted) {
              if (isCorrect) {
                btnStyle += "bg-green-100 border-green-500 text-green-900 font-bold";
              } else if (isSelected && !isCorrect) {
                btnStyle += "bg-red-100 border-red-500 text-red-900";
              } else {
                btnStyle += "bg-gray-50 border-gray-200 text-gray-500";
              }
            } else {
              if (isSelected) {
                btnStyle += "bg-blue-600 border-blue-600 text-white";
              } else {
                btnStyle += "bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-800";
              }
            }

            return (
              <button key={optIdx} onClick={() => handleOptionSelect(optIdx)} className={btnStyle}>
                {String.fromCharCode(65 + optIdx)}. {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex justify-between items-center border-t pt-4">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(currentIndex - 1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>

        {!isSubmitted && currentIndex === questions.length - 1 ? (
          <button
            onClick={() => setIsSubmitted(true)}
            className="px-5 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700"
          >
            Submit Test
          </button>
        ) : (
          <button
            disabled={currentIndex === questions.length - 1}
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
