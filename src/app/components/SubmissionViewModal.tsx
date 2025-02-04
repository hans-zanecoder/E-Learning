import { XMarkIcon } from '@heroicons/react/24/outline';

interface SubmissionViewModalProps {
  submission: {
    studentId: string;
    fileUrl?: string;
    submissionText?: string;
    submittedAt: string;
  };
  onClose: () => void;
}

export default function SubmissionViewModal({ submission, onClose }: SubmissionViewModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Submission Details
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Submitted on: {new Date(submission.submittedAt).toLocaleString()}
            </p>
          </div>

          {submission.submissionText && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Submission Text
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {submission.submissionText}
              </p>
            </div>
          )}

          {submission.fileUrl && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Attached File
              </h4>
              <a
                href={submission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
              >
                View File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 