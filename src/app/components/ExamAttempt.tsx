import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import ScoreModal from './ScoreModal';
import Swal from 'sweetalert2';

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
  const [answers, setAnswers] = useState<number[]>(new Array(exam?.questions?.length || 0).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [startTime] = useState(new Date());
  const [duration, setDuration] = useState('00:00');

  const formatDuration = (minutes: number, seconds: number) => {
    if (minutes < 60) {
      return `Duration: ${minutes}m ${seconds}s`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `Duration: ${hours}h ${remainingMinutes}m ${seconds}s`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setDuration(formatDuration(minutes, seconds));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    if (!exam?.questions || exam.questions.length === 0) {
      Swal.fire({
        title: 'No Questions Available',
        text: 'This exam does not have any questions available.',
        icon: 'info',
        confirmButtonText: 'Close',
        confirmButtonColor: '#9333EA',
        customClass: {
          popup: 'dark:bg-gray-800 dark:text-white rounded-2xl',
          title: 'text-xl font-medium',
          htmlContainer: 'dark:text-gray-300',
          confirmButton: 'px-6 py-3 rounded-xl text-sm font-medium transition-colors'
        }
      }).then(() => {
        onClose();
      });
    }
  }, [exam?.questions, onClose]);

  const calculateScore = () => {
    if (!exam?.questions) return 0;
    
    let score = 0;
    answers.forEach((answer, index) => {
      if (answer === exam.questions[index]?.correctAnswer) {
        score += exam.totalScore / exam.questions.length;
      }
    });
    return Math.round(score);
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!exam?.questions) return;
    
    const finalScore = calculateScore();
    await onSubmit(finalScore);
    
    const endTime = new Date();
    const totalSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    const durationMinutes = Math.floor(totalSeconds / 60);
    const durationSeconds = totalSeconds % 60;
    const finalDuration = formatDuration(durationMinutes, durationSeconds);
    
    onClose();
    
    const percentage = Math.round((finalScore / exam.totalScore) * 100);
    await Swal.fire({
      title: 'Exam Completed!',
      html: `
        <div class="space-y-4">
          <div class="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto">
            <svg class="w-12 h-12 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div class="grid grid-cols-2 gap-3">
              <div class="text-center">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Score</p>
                <p class="text-xl font-semibold text-gray-900 dark:text-white">${finalScore} / ${exam.totalScore}</p>
              </div>
              <div class="text-center">
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Percentage</p>
                <p class="text-xl font-semibold ${
                  percentage >= 70 ? 'text-green-600 dark:text-green-400' : 
                  percentage >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 
                  'text-red-600 dark:text-red-400'
                }">${percentage}%</p>
              </div>
            </div>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">${finalDuration}</p>
          </div>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Close',
      confirmButtonColor: '#9333EA',
      allowOutsideClick: false,
      padding: '2rem',
      customClass: {
        popup: 'dark:bg-gray-800 dark:text-white rounded-2xl',
        htmlContainer: 'dark:text-gray-300',
        confirmButton: 'px-6 py-3 rounded-xl text-sm font-medium transition-colors'
      }
    });
  };

  const getAnswerClassName = (questionIndex: number, optionIndex: number) => {
    if (!submitted) {
      return answers[questionIndex] === optionIndex
        ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400'
        : 'bg-white dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600';
    }

    if (optionIndex === exam.questions[questionIndex]?.correctAnswer) {
      return 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500';
    }

    if (answers[questionIndex] === optionIndex) {
      return 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500';
    }

    return 'bg-white dark:bg-gray-800 border-2 border-transparent opacity-50';
  };

  if (!exam?.questions || exam.questions.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white dark:bg-gray-800/95 rounded-2xl max-w-3xl w-full mx-auto shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-200/20 dark:border-gray-700/50">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {exam.title}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{exam.description}</p>
              </div>
              {!submitted && (
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-100 dark:bg-gray-700/50 rounded-full h-2">
                  <div 
                    className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / exam.questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {currentQuestion + 1} / {exam.questions.length}
                </span>
              </div>
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {duration}
            </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {exam.questions[currentQuestion].question}
                  </h3>
                  <div className="space-y-3">
                    {exam.questions[currentQuestion].options.map((option, oIndex) => (
                      <button
                        key={oIndex}
                        onClick={() => handleAnswerSelect(currentQuestion, oIndex)}
                        disabled={submitted}
                        className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                          getAnswerClassName(currentQuestion, oIndex)
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                            answers[currentQuestion] === oIndex
                              ? 'border-purple-500 dark:border-purple-400 bg-purple-100 dark:bg-purple-900/30'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {answers[currentQuestion] === oIndex && (
                              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 dark:bg-purple-400" />
                            )}
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 disabled:opacity-50 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    ← Previous
                  </button>
                  {currentQuestion === exam.questions.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={answers.includes(-1)}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Submit Exam
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestion(prev => Math.min(exam.questions.length - 1, prev + 1))}
                      className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                    >
                      Next →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 