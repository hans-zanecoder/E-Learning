import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface EditExamModalProps {
  exam: any;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  setEditingExam: (exam: any) => void;
}

const EditExamModal = ({ exam, onClose, onSubmit, setEditingExam }: EditExamModalProps) => {
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
    updatedQuestions[index] = { 
      ...updatedQuestions[index], 
      [field]: value 
    };
    setEditingExam({ ...exam, questions: updatedQuestions });
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

                {(exam.questions || []).map((question: Question, index: number) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Question {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                      placeholder="Enter question"
                      className="w-full p-2 border rounded-lg dark:bg-gray-700"
                      required
                    />

                    <div className="space-y-2">
                      {question.options.map((option: string, optionIndex: number) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => updateQuestion(index, 'correctAnswer', optionIndex)}
                            className="text-blue-600"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...question.options];
                              newOptions[optionIndex] = e.target.value;
                              updateQuestion(index, 'options', newOptions);
                            }}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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