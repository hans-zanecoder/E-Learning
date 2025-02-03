import { XMarkIcon } from '@heroicons/react/24/outline';

interface LessonModalProps {
  lesson: any;
  onClose: () => void;
}

export default function LessonModal({ lesson, onClose }: LessonModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full mx-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lesson.title}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Given on: {new Date(lesson.dueDate).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="prose dark:prose-invert max-w-none">
              {lesson.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 