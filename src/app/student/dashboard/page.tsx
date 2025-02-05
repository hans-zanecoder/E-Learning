'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bars3Icon,
  ChartPieIcon,
  BookOpenIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  ClipboardDocumentCheckIcon,
  AcademicCapIcon,
  UsersIcon,
  ClockIcon,
  PlusCircleIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import EnrollmentModal from '../components/EnrollmentModal';
import { swalSuccess, swalError, swalConfirm } from '@/app/utils/swalUtils';
import CourseCalendar from '../components/CourseCalendar';
import { Course } from '../types/course';
import { Enrollment } from '../types/enrollment';
import mongoose from 'mongoose';
import ExamAttempt from '@/app/components/ExamAttempt';
import LessonModal from '@/app/components/LessonModal';
import AssignmentModal from '@/app/components/AssignmentModal';
import CourseUnenrollModal from '../components/CourseUnenrollModal';

interface CourseDetailsModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

interface ExamSubmission {
  studentId: string;
  score: number;
  submittedAt: string;
}

const CourseDetailsModal = ({ course, isOpen, onClose }: CourseDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState('lessons');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black opacity-30"></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{course.title}</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  onClose();
                  confirmDropCourse(course._id);
                }}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
              >
                Drop Course
              </button>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="mt-6">
            {activeTab === 'lessons' && (
              <div className="space-y-4">
                {course.lessons?.map((lesson) => (
                  <div key={lesson._id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <h3 className="font-medium text-gray-900 dark:text-white">{lesson.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Due: {new Date(lesson.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-4">
                {course.assignments?.map((assignment) => (
                  <div key={assignment._id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <h3 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      <span className="ml-2">Points: {assignment.totalScore}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'exams' && (
              <div className="space-y-4">
                {course.exams?.map((exam) => (
                  <div key={exam._id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <h3 className="font-medium text-gray-900 dark:text-white">{exam.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Duration: {exam.duration} minutes
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Course Schedule</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Start Date: {new Date(course.startDate as string).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">Teacher</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {course.teachers?.[0]?.fullName || 'Not assigned'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    enrolledCourses: 0,
    completedCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<Course | null>(null);
  const [isCourseDetailsModalOpen, setIsCourseDetailsModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isUnenrollModalOpen, setIsUnenrollModalOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      icon: ChartPieIcon,
      view: 'dashboard',
    },
    {
      name: 'My Courses',
      icon: BookOpenIcon,
      view: 'my-courses',
    },
    {
      name: 'Exams',
      icon: AcademicCapIcon,
      view: 'exams',
    },
    {
      name: 'Lessons',
      icon: BookmarkIcon,
      view: 'lessons',
    },
    {
      name: 'My Calendar',
      icon: ClockIcon,
      view: 'calendar',
    },
    {
      name: 'Available Courses',
      icon: PlusCircleIcon,
      view: 'available-courses',
    },
    {
      name: 'Assignments',
      icon: ClipboardDocumentCheckIcon,
      view: 'assignments',
    },
    {
      name: 'Profile',
      icon: UserCircleIcon,
      view: 'profile',
    },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
  
    if (!storedUser || !token) {
      router.push('/auth/login');
      return;
    }
  
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'student') {
      router.push('/auth/login');
      return;
    }
  
    setUser(userData);
  
    // Initial fetch
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.allSettled([
          fetchEnrolledCourses(),
          fetchCourses(),
          fetchDashboardStats()
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        swalError(error, {
          defaultMessage: 'Failed to load dashboard data'
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAvailableCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/courses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch courses');
      }
      
      console.log('Fetched courses:', data);
      setCourses(data.courses);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      swalError(error, {
        defaultMessage: 'Failed to fetch courses'
      });
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDashboardStats(data);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleLogout = async () => {
    const confirmed = await swalConfirm({
      title: 'Are you sure?',
      text: 'You will be logged out of your account',
      icon: 'warning',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    });

    if (confirmed) {
      localStorage.clear();
      router.push('/auth/login');
    }
  };

  const handleEnrollment = async () => {
    if (!selectedCourse) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/student/enroll/${selectedCourse._id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Update the local user data with the new enrollment
      const updatedUser = {
        ...user,
        enrolledCourses: [...(user.enrolledCourses || []), selectedCourse._id],
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      await swalSuccess({
        text: 'Successfully enrolled in the course!'
      });

      // Refresh all necessary data
      await Promise.all([
        fetchEnrolledCourses(),
        fetchCourses(),
        fetchDashboardStats(),
      ]);

      setIsEnrollmentModalOpen(false);
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      swalError(error, {
        defaultMessage: 'Failed to enroll in course'
      });
    }
  };

  const isEnrolled = (courseId: string) => {
    return user?.enrolledCourses?.includes(courseId) || false;
  };

  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course);
    setIsEnrollmentModalOpen(true);
  };

  const fetchEnrolledCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/student/enrolled-courses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch enrolled courses');
      }

      setEnrolledCourses(data.courses.map((course: any) => ({
        ...course,
        exams: course.exams || [] // Ensure exams array exists
      })));
    } catch (error: any) {
      console.error('Error fetching enrolled courses:', error);
      swalError(error, {
        defaultMessage: 'Failed to fetch enrolled courses'
      });
      setEnrolledCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDropCourse = async (courseId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/student/enroll/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      // First get the response text
      const text = await response.text();
      
      // Try to parse it as JSON if there's content
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Error parsing response:', e);
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to drop course');
      }

      await swalSuccess({
        text: 'Successfully dropped the course'
      });

      setIsEnrollmentModalOpen(false);
      await fetchEnrolledCourses(); // Refresh the enrolled courses list
      
    } catch (error: any) {
      console.error('Error dropping course:', error);
      swalError(error, {
        defaultMessage: 'Failed to drop course'
      });
    }
  };

  const confirmDropCourse = async (courseId: string) => {
    const confirmed = await swalConfirm({
      text: "You won't be able to revert this!",
      confirmButtonText: 'Yes, drop course!'
    });
    
    if (confirmed) {
      handleDropCourse(courseId);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/student/available-courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch available courses');
      }

      setAvailableCourses(data.courses);
    } catch (error: any) {
      console.error('Error fetching available courses:', error);
      swalError(error, {
        defaultMessage: 'Failed to fetch available courses'
      });
      setAvailableCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const AvailableCoursesView = () => {
    return (
      <div className="mt-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Available Courses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <BookOpenIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {course.title}
                    </h3>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {course.teachers?.[0]?.fullName?.charAt(0) || 'T'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {course.lessons?.length || 0} lessons
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setIsEnrollmentModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center"
                      >
                        Course Details
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <EnrollmentModal
          isOpen={isEnrollmentModalOpen}
          closeModal={() => setIsEnrollmentModalOpen(false)}
          course={selectedCourse}
          onEnroll={handleEnrollment}
          onUnenroll={handleDropCourse}
          isEnrolled={false}
        />
      </div>
    );
  };

  const MyCourses = () => {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isUnenrollModalOpen, setIsUnenrollModalOpen] = useState(false);

    const handleUnenroll = async (courseId: string) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`/api/student/enroll/${courseId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        // First get the response text
        const text = await response.text();
        
        // Try to parse it as JSON if there's content
        let data;
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          console.error('Error parsing response:', e);
        }

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to unenroll from course');
        }

        await swalSuccess({
          text: 'Successfully unenrolled from the course'
        });

        setIsUnenrollModalOpen(false);
        await fetchEnrolledCourses(); // Refresh the enrolled courses list
        
      } catch (error: any) {
        console.error('Error unenrolling from course:', error);
        swalError(error, {
          defaultMessage: 'Failed to unenroll from course'
        });
      }
    };

    return (
      <div className="mt-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Courses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex flex-col h-full"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <BookOpenIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {course.title}
                    </h3>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {course.teachers?.[0]?.fullName?.charAt(0) || 'T'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {course.lessons?.length || 0} lessons
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setIsUnenrollModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center"
                      >
                        Course Details
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <CourseUnenrollModal
          isOpen={isUnenrollModalOpen}
          closeModal={() => setIsUnenrollModalOpen(false)}
          course={selectedCourse}
          onUnenroll={handleUnenroll}
        />
      </div>
    );
  };

  const CalendarView = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Calendar
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Course Schedule
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View your upcoming lessons and exams
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl">
              {enrolledCourses && enrolledCourses.length > 0 ? (
                <CourseCalendar 
                  enrolledCourses={enrolledCourses}
                  className="w-full"
                />
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No courses scheduled at the moment
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DashboardStats = () => {
    // Process lessons
    const allLessons = enrolledCourses.flatMap((course) =>
      (course.lessons || []).map((lesson) => ({
        ...lesson,
        courseName: course.title,
      }))
    );

    // Add counts for enrolled and finished courses
    const enrolledCoursesCount = enrolledCourses.length;
    const finishedCoursesCount = enrolledCourses.filter(
      course => course.status === 'completed'
    ).length;

    // Process exams
    const allExams = enrolledCourses.flatMap((course) =>
      (course.exams || []).map((exam) => ({
        ...exam,
        courseName: course.title,
      }))
    );

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Enrolled Courses Card */}
          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Enrolled Courses
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {enrolledCoursesCount}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <BookOpenIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>

          {/* Upcoming Classes Card */}
          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Upcoming Classes
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    enrolledCourses.filter(
                      (course) =>
                        new Date(course.startDate as string) > new Date()
                    ).length
                  }
                </h3>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <ClockIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>

          {/* Finished Courses Card */}
          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Finished Courses
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {finishedCoursesCount}
                </h3>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <AcademicCapIcon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Next Exam Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Next Exam
              </h3>
              <button 
                onClick={() => setCurrentView('exams')}
                className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
              >
                View All
              </button>
            </div>

            {allExams.length > 0 ? (
              <div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <AcademicCapIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                        {allExams[0].title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {allExams[0].courseName} • {allExams[0].duration} min
                      </p>
                    </div>
                  </div>
                </div>
                {allExams.length > 1 && (
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    and {allExams.length - 1} other {allExams.length - 1 === 1 ? 'exam' : 'exams'}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No upcoming exams
              </p>
            )}
          </div>

          {/* Recent Lessons Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Lessons
              </h3>
              <button 
                onClick={() => setCurrentView('lessons')}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View All
              </button>
            </div>

            {allLessons.length > 0 ? (
              <div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <BookmarkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                        {allLessons[0].title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {allLessons[0].courseName} • Due {new Date(allLessons[0].dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                {allLessons.length > 1 && (
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    and {allLessons.length - 1} other {allLessons.length - 1 === 1 ? 'lesson' : 'lessons'}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No lessons available
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ExamsView = () => {
    // Group exams by course
    const examsByCourse = enrolledCourses.reduce((acc, course) => {
      if (course.exams && course.exams.length > 0) {
        acc[course._id] = {
          courseName: course.title,
          exams: course.exams.map(exam => ({
            ...exam,
            courseName: course.title,
            courseId: course._id,
            submissions: exam.submissions || []
          }))
        };
      }
      return acc;
    }, {} as Record<string, { courseName: string; exams: any[] }>);

    const handleExamClick = (exam: any) => {
      const userSubmission = exam.submissions?.find(
        (sub: any) => sub.studentId === user._id
      );
      
      setSelectedExam(exam);
      setIsExamModalOpen(true);
    };

    const handleExamSubmit = async (score: number) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/student/exams/${selectedExam._id}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ score }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        await fetchEnrolledCourses();
        return { score }; 
      } catch (error: any) {
        console.error('Error submitting exam:', error);
        throw error;
      }
    };

    return (
      <div className="space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Exams
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {enrolledCourses.reduce((total, course) => total + (course.exams?.length || 0), 0)}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <AcademicCapIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completed Exams
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {enrolledCourses.reduce((total, course) => {
                    return total + (course.exams?.filter(exam => 
                      exam.submissions?.some(sub => sub.studentId === user._id)
                    ).length || 0);
                  }, 0)}
                </h3>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Exams
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {/* Add pending exams count logic here */}
                  {enrolledCourses.reduce((total, course) => total + (course.exams?.length || 0), 0)}
                </h3>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Exams List - Redesigned */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 h-[540px] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Available Exams
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                •
              </span>
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {enrolledCourses[0]?.teachers?.[0]?.fullName?.charAt(0) || 'T'}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {enrolledCourses[0]?.teachers?.[0]?.fullName || 'Teacher'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {Object.entries(examsByCourse).map(([courseId, { courseName, exams }]) => (
              <div key={`course-${courseId}`} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-8 last:pb-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <AcademicCapIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {courseName}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {exams.length} {exams.length === 1 ? 'exam' : 'exams'}
                  </span>
                </div>

                <div className="space-y-3">
                  {exams.map((exam) => {
                    const userSubmission = exam.submissions?.find(
                      (sub) => sub.studentId === user._id
                    );
                    
                    return (
                      <button
                        key={`assignment-${exam._id}`}
                        onClick={() => handleExamClick(exam)}
                        className={`w-full text-left group cursor-pointer bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 
                          hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
                          relative overflow-hidden ${userSubmission ? 'cursor-default hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}`}
                      >
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="flex-shrink-0 p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                              {userSubmission ? (
                                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <AcademicCapIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                                {exam.title}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {userSubmission ? (
                                  <span className="text-green-600 dark:text-green-400">
                                    Score: {userSubmission.score} / {exam.totalScore}
                                  </span>
                                ) : (
                                  `Duration: ${exam.duration} minutes`
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                              {userSubmission ? 'Completed' : 'Start Exam'}
                            </span>
                            {!userSubmission && (
                              <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                            )}
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-100 dark:to-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedExam && isExamModalOpen && (
          <ExamAttempt
            exam={selectedExam}
            onSubmit={handleExamSubmit}
            onClose={() => setIsExamModalOpen(false)}
            existingSubmission={
              selectedExam.submissions?.find(
                (sub: any) => sub.studentId === user._id
              )
            }
          />
        )}
      </div>
    );
  };

  const LessonsView = () => {
    // Group lessons by course
    const lessonsByCourse = enrolledCourses.reduce((acc, course) => {
      if (course.lessons && course.lessons.length > 0) {
        acc[course._id] = {
          courseName: course.title,
          lessons: course.lessons.map(lesson => ({
            ...lesson,
            courseName: course.title,
            courseId: course._id
          }))
        };
      }
      return acc;
    }, {} as Record<string, { courseName: string; lessons: any[] }>);

    const allLessons = enrolledCourses.flatMap((course) =>
      (course.lessons || []).map((lesson) => ({
        ...lesson,
        courseName: course.title,
        courseId: course._id
      }))
    );

    // Sort lessons by due date
    const sortedLessons = allLessons.sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    // Get upcoming and completed lessons
    const upcomingLessons = sortedLessons.filter(
      (lesson) => !lesson.completed && new Date(lesson.dueDate) > new Date()
    );
    const completedLessons = sortedLessons.filter((lesson) => lesson.completed);

    return (
      <div className="space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Lessons
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {allLessons.length}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <BookmarkIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completed Lessons
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedLessons.length}
                </h3>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Upcoming Lessons
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {upcomingLessons.length}
                </h3>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Lessons List - Redesigned */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 h-[540px] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Course Lessons
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                •
              </span>
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {enrolledCourses[0]?.teachers?.[0]?.fullName?.charAt(0) || 'T'}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {enrolledCourses[0]?.teachers?.[0]?.fullName || 'Teacher'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {Object.entries(lessonsByCourse).map(([courseId, { courseName, lessons }]) => (
              <div key={`course-${courseId}`} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-8 last:pb-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <BookOpenIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {courseName}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                  </span>
                </div>

                <div className="space-y-3">
                  {lessons.map((lesson) => (
                    <button
                      key={`assignment-${lesson._id}`}
                      onClick={() => {
                        setSelectedLesson(lesson);
                        setIsLessonModalOpen(true);
                      }}
                      className="w-full text-left group cursor-pointer bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 
                        hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                        relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`flex-shrink-0 p-2 rounded-lg ${
                            lesson.completed 
                              ? 'bg-green-100 dark:bg-green-900/30' 
                              : 'bg-blue-100 dark:bg-blue-900/30'
                            }`}
                          >
                            {lesson.completed ? (
                              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <BookmarkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {lesson.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Due: {new Date(lesson.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            View Details
                          </span>
                          <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-100 dark:to-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedLesson && isLessonModalOpen && (
          <LessonModal
            lesson={selectedLesson}
            onClose={() => setIsLessonModalOpen(false)}
          />
        )}
      </div>
    );
  };

  const AssignmentsView = () => {
    const [assignments, setAssignments] = useState([]);
    const [stats, setStats] = useState({
      total: 0,
      submitted: 0,
      pending: 0
    });

    useEffect(() => {
      const hasLoadedKey = 'assignmentsLoaded';
      const hasLoaded = sessionStorage.getItem(hasLoadedKey);

      const fetchAssignments = async () => {
        try {
          const token = localStorage.getItem('token');
          const promises = enrolledCourses.map(course => 
            fetch(`/api/courses/${course._id}/assignments`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }).then(res => res.json())
          );
          
          const courseAssignments = await Promise.all(promises);
          const allAssignments = courseAssignments.flat();
          
          // Calculate stats
          const submitted = allAssignments.filter(a => 
            a.submissions?.some(s => s.studentId === user._id)
          ).length;
          
          setStats({
            total: allAssignments.length,
            submitted,
            pending: allAssignments.length - submitted
          });
          
          setAssignments(allAssignments);
          sessionStorage.setItem(hasLoadedKey, 'true');
        } catch (error) {
          console.error('Error fetching assignments:', error);
        }
      };

      if (!hasLoaded) {
        fetchAssignments();
      }

      // Cleanup on component unmount
      return () => {
        sessionStorage.removeItem(hasLoadedKey);
      };
    }, []); // Empty dependency array

    const handleAssignmentClick = (assignment: any) => {
      if (!assignment || !assignment._id) {
        console.error('Assignment missing _id:', assignment);
        return;
      }
      setSelectedAssignment(assignment);
      setIsAssignmentModalOpen(true);
    };

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Assignments
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Submitted
                </p>
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.submitted}
                </h3>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending
                </p>
                <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pending}
                </h3>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 h-[540px] overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Your Assignments
          </h2>
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const isSubmitted = assignment.submissions?.some(s => s.studentId === user._id);
              return (
                <button
                  key={`assignment-${assignment._id}`}
                  onClick={() => handleAssignmentClick(assignment)}
                  className="w-full text-left group cursor-pointer bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 
                    hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${
                        isSubmitted 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {isSubmitted ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <ClipboardDocumentCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                          {assignment.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {assignment.totalScore} points
                      </span>
                      <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardStats />;
      case 'my-courses':
        return <MyCourses />;
      case 'exams':
        return <ExamsView />;
      case 'lessons':
        return <LessonsView />;
      case 'calendar':
        return <CalendarView />;
      case 'available-courses':
        return <AvailableCoursesView />;
      case 'assignments':
        return <AssignmentsView />;
      default:
        return <DashboardStats />;
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-3 py-4 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <Link href="/student/dashboard" className="flex items-center gap-2 ms-2 md:me-24">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <BookOpenIcon className="w-6 h-6" />
                </div>
                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                  E-Learning Hub
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:block text-sm font-medium text-gray-600 dark:text-gray-300">
                Welcome, {user.username}
              </span>
              <div className="relative group">
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200">
                  <UserCircleIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700`}
      >
        <div className="h-full flex flex-col px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
          <ul className="space-y-1 flex-1">
            {navigation.map((item) => (
              <li key={item.view}>
                <button
                  onClick={() => setCurrentView(item.view)}
                  className={`flex w-full items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 gap-x-3
                    ${
                      currentView === item.view
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <item.icon 
                    className={`w-5 h-5 transition-colors duration-200
                      ${
                        currentView === item.view
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }
                    `}
                  />
                  <span>{item.name}</span>
                  {currentView === item.view && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </button>
              </li>
            ))}
          </ul>
          
          {/* Logout section */}
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 gap-x-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="p-4 sm:ml-64">
        <div className="p-4 mt-14">{renderContent()}</div>
      </div>

      {/* Enrollment Modal */}
      {selectedCourse && (
        <EnrollmentModal
          isOpen={isEnrollmentModalOpen}
          closeModal={() => setIsEnrollmentModalOpen(false)}
          course={selectedCourse}
          onEnroll={handleEnrollment}
          onUnenroll={handleDropCourse}
          isEnrolled={false}
        />
      )}

      {/* Lesson Modal */}
      {selectedLesson && isLessonModalOpen && (
        <LessonModal
          lesson={selectedLesson}
          onClose={() => setIsLessonModalOpen(false)}
        />
      )}

      {/* Assignment Modal */}
      {selectedAssignment && isAssignmentModalOpen && (
        <AssignmentModal
          assignment={selectedAssignment}
          onClose={() => setIsAssignmentModalOpen(false)}
        />
      )}
    </>
  );
}
