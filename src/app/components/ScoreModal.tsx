import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  totalScore: number;
}

export default function ScoreModal({ isOpen, onClose, score, totalScore }: ScoreModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full mx-auto shadow-2xl p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Congratulations!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You have completed the exam
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Your Score: {score} / {totalScore}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round((score / totalScore) * 100)}%
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 