import React from 'react';

interface EditExamModalProps {
  exam: any;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  setEditingExam: (exam: any) => void;
}

const EditExamModal = ({ exam, onClose, onSubmit, setEditingExam }: EditExamModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Edit Exam
          </h3>
          <form onSubmit={onSubmit}>
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