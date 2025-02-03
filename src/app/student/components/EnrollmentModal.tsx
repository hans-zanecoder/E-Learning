import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  XMarkIcon,
  ClockIcon,
  UserIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  startDate?: string;
  endDate?: string;
  teachers: Array<{
    _id: string;
    fullName: string;
    email: string;
  }>;
  schedule: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
  enrolledStudents?: Array<{
    _id: string;
    username: string;
  }>;
  lessons?: Array<any>;
  assignments?: Array<any>;
  exams?: Array<any>;
}

interface EnrollmentModalProps {
  isOpen: boolean;
  closeModal: () => void;
  course: Course | null;
  onEnroll: () => void;
  onUnenroll: () => void;
  isEnrolled: boolean;
}

export default function EnrollmentModal({
  isOpen,
  closeModal,
  course,
  onEnroll,
  onUnenroll,
  isEnrolled,
}: EnrollmentModalProps) {
  if (!course) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                  Course Details
                </Dialog.Title>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-4 space-y-6">
                {/* Course Title and Category */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <AcademicCapIcon className="h-6 w-6 text-blue-500" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {course.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                      {course.category}
                    </span>
                  </div>
                </div>

                {/* Course Description */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    {course.description}
                  </p>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-3 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {course.lessons?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Lessons
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {course.assignments?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Assignments
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {course.exams?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Exams
                    </div>
                  </div>
                </div>

                {/* Course Duration */}
                {(course.startDate || course.endDate) && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Course Duration
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {course.startDate && (
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Start Date:
                          </span>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatDate(course.startDate)}
                          </p>
                        </div>
                      )}
                      {course.endDate && (
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            End Date:
                          </span>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatDate(course.endDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Instructors */}
                {course.teachers && course.teachers.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Course Instructors
                    </h4>
                    <div className="space-y-3">
                      {course.teachers.map((teacher) => (
                        <div
                          key={teacher._id}
                          className="flex items-center gap-2"
                        >
                          <UserIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {teacher.fullName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {teacher.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Schedule */}
                {course.schedule && course.schedule.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Class Schedule
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {course.schedule.map((schedule, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <ClockIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {schedule.dayOfWeek}: {schedule.startTime} -{' '}
                            {schedule.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {isEnrolled ? (
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    onClick={onUnenroll}
                  >
                    Unenroll from Course
                  </button>
                ) : (
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onEnroll}
                  >
                    Enroll in Course
                  </button>
                )}
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
