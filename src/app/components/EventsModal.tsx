import { XMarkIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface EventsModalProps {
  date: Date;
  events: Array<{
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: {
      _id: string;
      title: string;
      description: string;
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
    };
  }>;
  onClose: () => void;
}

export default function EventsModal({ date, events, onClose }: EventsModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full mx-auto shadow-2xl">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Courses for {format(date, 'MMMM d, yyyy')}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {events.length > 0 ? (
              <div className="space-y-6">
                {events.map((event) => (
                  <div 
                    key={event.id}
                    className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {event.resource.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {event.resource.description}
                    </p>

                    <div className="space-y-4">
                      {/* Course Duration */}
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <ClockIcon className="w-5 h-5 mr-2" />
                        {format(event.start, 'PPP')} - {format(event.end, 'PPP')}
                      </div>

                      {/* Teachers */}
                      {event.resource.teachers?.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Instructors
                          </h4>
                          <div className="space-y-2">
                            {event.resource.teachers.map((teacher) => (
                              <div key={teacher._id} className="flex items-center space-x-2">
                                <UserIcon className="w-5 h-5 text-gray-400" />
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
                      {event.resource.schedule?.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Class Schedule
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {event.resource.schedule.map((schedule, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <ClockIcon className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  {schedule.dayOfWeek}: {schedule.startTime} - {schedule.endTime}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No courses scheduled for this date
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 