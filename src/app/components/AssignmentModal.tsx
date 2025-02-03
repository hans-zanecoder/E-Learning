import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AssignmentModalProps {
  assignment: {
    title: string;
    description: string;
    dueDate: string;
    totalScore: number;
  };
  onClose: () => void;
}

const AssignmentModal = ({ assignment, onClose }: AssignmentModalProps) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full mx-auto shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {assignment.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{assignment.description}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</h3>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Score</h3>
                <p className="mt-1 text-gray-900 dark:text-white">{assignment.totalScore} points</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal; 