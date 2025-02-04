import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface EditExamModalProps {
  exam: {
    _id: string;
    title: string;
    description: string;
    questions: Question[];
    dueDate: string;
    totalScore: number;
  };
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  setEditingExam: (exam: any) => void;
}

const EditExamModal = ({ exam, onClose, onSubmit, setEditingExam }: EditExamModalProps) => {
  console.log('Exam data in modal:', exam);

  const addQuestion = () => {
    setEditingExam({
      ...exam,
      questions: [...(exam.questions || []), { 
        question: '', 
        options: ['', '', '', ''], 
        correctAnswer: 0 
      }]
    });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...(exam.questions || [])];
    updatedQuestions.splice(index, 1);
    setEditingExam({ ...exam, questions: updatedQuestions });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...(exam.questions || [])];
    if (field === 'options') {
      updatedQuestions[index] = { 
        ...updatedQuestions[index], 
        options: value 
      };
    } else if (field === 'correctAnswer') {
      updatedQuestions[index] = { 
        ...updatedQuestions[index], 
        correctAnswer: value 
      };
    } else {
      updatedQuestions[index] = { 
        ...updatedQuestions[index], 
        [field]: value 
      };
    }
    setEditingExam({
      ...exam,
      questions: updatedQuestions
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Edit Exam
          </h3>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={exam.title}
                  onChange={(e) => setEditingExam({ ...exam, title: e.target.value })}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  value={exam.description}
                  onChange={(e) => setEditingExam({ ...exam, description: e.target.value })}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Total Score
                </label>
                <input
                  type="number"
                  value={exam.totalScore}
                  onChange={(e) => setEditingExam({ ...exam, totalScore: parseInt(e.target.value) })}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  min="0"
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Questions</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Question
                  </button>
                </div>

                {Array.isArray(exam.questions) && exam.questions.length > 0 ? (
                  exam.questions.map((question, qIndex) => (
                    <div key={qIndex} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Question {qIndex + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Question Text
                          </label>
                          <input
                            type="text"
                            value={question.question || ''}
                            onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Options
                          </label>
                          {(question.options || ['', '', '', '']).map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={question.correctAnswer === oIndex}
                                onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                className="text-blue-600"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(question.options || ['', '', '', ''])];
                                  newOptions[oIndex] = e.target.value;
                                  updateQuestion(qIndex, 'options', newOptions);
                                }}
                                className={`w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white ${
                                  question.correctAnswer === oIndex 
                                  ? 'border-green-500 dark:border-green-500' 
                                  : ''
                                }`}
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No questions added yet. Click "Add Question" to begin.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={exam.dueDate ? exam.dueDate.split('T')[0] : ''}
                  onChange={(e) => setEditingExam({ ...exam, dueDate: e.target.value })}
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Exam
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditExamModal; 