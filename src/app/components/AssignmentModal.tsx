import { Dialog } from '@headlessui/react';
import { XMarkIcon, PhotoIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function AssignmentModal({ 
  assignment, 
  onClose,
  user 
}: { 
  assignment: any;
  onClose: () => void;
  user: any;
}) {
  const [submissionType, setSubmissionType] = useState<'text' | 'file' | 'photo'>('text');
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let fileUrl = '';
      if (submissionFile) {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(submissionFile);
        });
        fileUrl = base64 as string;
      }

      // Debug the assignment object
      console.log('Assignment object:', {
        id: assignment._id,
        title: assignment.title,
        fullObject: assignment
      });

      // Validate assignment object
      if (!assignment || typeof assignment !== 'object') {
        throw new Error('Invalid assignment object');
      }

      if (!assignment._id || typeof assignment._id !== 'string') {
        throw new Error(`Invalid assignment ID: ${JSON.stringify(assignment._id)}`);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/student/assignments/${assignment._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileUrl,
          submissionText,
          submissionType
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit assignment');
      }

      onClose();
    } catch (error: any) {
      console.error('Error submitting assignment:', error);
      alert(`Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSubmissionInput = () => {
    switch (submissionType) {
      case 'text':
        return (
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 text-gray-900 dark:text-white min-h-[150px]"
            placeholder="Enter your submission text here..."
          />
        );
      case 'file':
      case 'photo':
        return (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <input
              type="file"
              accept={submissionType === 'photo' ? "image/*" : undefined}
              onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              {submissionType === 'photo' ? (
                <PhotoIcon className="w-12 h-12 text-gray-400" />
              ) : (
                <DocumentIcon className="w-12 h-12 text-gray-400" />
              )}
              <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {submissionFile ? submissionFile.name : `Click to upload ${submissionType}`}
              </span>
            </label>
          </div>
        );
    }
  };

  return (
    <>
      <Dialog open={true} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg max-h-[80vh] flex flex-col">
            <div className="p-6 flex-shrink-0">
              <div className="flex justify-between items-center">
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                  {assignment.title}
                </Dialog.Title>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                <p className="text-gray-600 dark:text-gray-300">
                  {assignment.description}
                </p>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Submission Type
                </label>
                <div className="flex space-x-4">
                  {['text', 'file', 'photo'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSubmissionType(type as any)}
                      className={`px-4 py-2 rounded-lg ${
                        submissionType === type
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                {renderSubmissionInput()}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
} 