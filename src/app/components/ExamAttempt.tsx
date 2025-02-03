import React, { useState } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ExamAttemptProps {
  exam: {
    _id: string;
    title: string;
    description: string;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;
    totalScore: number;
    courseId: string;
  };
  onSubmit: (score: number) => void;
  onClose: () => void;
}

export default function ExamAttempt({ exam, onSubmit, onClose }: ExamAttemptProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    new Array(exam.questions.length).fill(-1)
  );
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    exam.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / exam.questions.length) * exam.totalScore);
  };

  const handleSubmit = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setSubmitted(true);
    onSubmit(finalScore);
  };

  const nextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full mx-auto shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{exam.title}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{exam.description}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            {!submitted && (
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / exam.questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {currentQuestion + 1} / {exam.questions.length}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {!submitted ? (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {exam.questions[currentQuestion].question}
                  </h3>
                  <div className="space-y-3">
                    {exam.questions[currentQuestion].options.map((option, oIndex) => (
                      <button
                        key={oIndex}
                        onClick={() => handleAnswerSelect(currentQuestion, oIndex)}
                        className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                          selectedAnswers[currentQuestion] === oIndex
                            ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400'
                            : 'bg-white dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                            selectedAnswers[currentQuestion] === oIndex
                              ? 'border-blue-500 dark:border-blue-400'
                              : 'border-gray-300 dark:border-gray-500'
                          }`}>
                            {selectedAnswers[currentQuestion] === oIndex && (
                              <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400" />
                            )}
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={previousQuestion}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {currentQuestion === exam.questions.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={selectedAnswers.includes(-1)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Exam
                    </button>
                  ) : (
                    <button
                      onClick={nextQuestion}
                      className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Exam Completed!
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Your Score: {score} / {exam.totalScore}
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 