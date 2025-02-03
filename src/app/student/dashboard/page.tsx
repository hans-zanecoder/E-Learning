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
  AcademicCapIcon,
  UsersIcon,
  ClockIcon,
  PlusCircleIcon,
  BookmarkIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import EnrollmentModal from '../components/EnrollmentModal';
import { swalSuccess, swalError, swalConfirm } from '@/app/utils/swalUtils';
import CourseCalendar from '../components/CourseCalendar';
import { Course } from '../types/course';
import { Enrollment } from '../types/enrollment';
import mongoose from 'mongoose';
import ExamAttempt from '@/app/components/ExamAttempt';
import LessonModal from '@/app/components/LessonModal';

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
  
    // Fetch data
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
  
    const pollInterval = setInterval(fetchEnrolledCourses, 30000);
    return () => clearInterval(pollInterval);
  }, []);

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

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth/login');
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
    return user?.enrolledCourses?.includes(courseId);
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
      const response = await fetch(`/api/student/enroll/${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      await swalSuccess({
        text: 'Successfully dropped the course'
      });

      fetchEnrolledCourses();
    } catch (error: any) {
      console.error('Error dropping course:', error);
      swalError(error);
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

  const AvailableCoursesView = () => {
    return (
      <div className="mt-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Available Courses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
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
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      (course.enrolledStudents?.length || 0) > 0
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {(course.enrolledStudents?.length || 0) > 0
                      ? 'Active'
                      : 'New'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {course.description || 'No description available'}
                </p>

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {(course.teachers &&
                            course.teachers[0]?.fullName?.charAt(0)) ||
                            'U'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                        {(course.teachers && course.teachers[0]?.fullName) ||
                          'Unassigned'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {course.enrolledStudents?.length || 0} students
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setIsEnrollmentModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
                      >
                        Enroll →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MyCourses = () => {
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchEnrolledCourses = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/student/enrolled-courses', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch courses');
          }

          const data = await response.json();
          setEnrolledCourses(data.courses || []);
        } catch (error) {
          console.error('Error fetching enrolled courses:', error);
          setEnrolledCourses([]);
        } finally {
          setLoading(false);
        }
      };

      fetchEnrolledCourses();
    }, []);

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          My Enrolled Courses
        </h2>
        
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
                  {course.description || 'No description available'}
                </p>

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {course.teachers && course.teachers[0]?.fullName?.charAt(0) || 'T'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                        {course.teachers && course.teachers[0]?.fullName || 'Teacher'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {course.lessons?.length || 0} lessons
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex justify-end">
                      <Link
                        href={`/student/courses/${course._id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        View Course →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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

    const upcomingExams = allExams.filter(
      (exam) => !exam.completed && new Date(exam.dueDate) > new Date()
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

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

            {upcomingExams.length > 0 ? (
              <div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <AcademicCapIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                        {upcomingExams[0].title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {upcomingExams[0].courseName} • {upcomingExams[0].duration} min
                      </p>
                    </div>
                  </div>
                </div>
                {upcomingExams.length > 1 && (
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    and {upcomingExams.length - 1} other {upcomingExams.length - 1 === 1 ? 'exam' : 'exams'}
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
            courseId: course._id
          }))
        };
      }
      return acc;
    }, {} as Record<string, { courseName: string; exams: any[] }>);

    const handleExamSubmit = async (score: number) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`/api/student/exams/${selectedExam._id}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ score }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to submit exam');
        }

        await swalSuccess({ text: 'Exam submitted successfully!' });
        fetchEnrolledCourses();
      } catch (error: any) {
        console.error('Error submitting exam:', error);
        swalError(error);
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
                  {/* Add completed exams count logic here */}
                  0
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
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
              <div key={courseId} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-8 last:pb-0">
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
                  {exams.map((exam) => (
                    <button
                      key={exam._id}
                      onClick={() => {
                        setSelectedExam(exam);
                        setIsExamModalOpen(true);
                      }}
                      className="w-full text-left group cursor-pointer bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 
                        hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
                        relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex-shrink-0 p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <AcademicCapIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                              {exam.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Duration: {exam.duration} minutes
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                            Start Exam
                          </span>
                          <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
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

        {selectedExam && isExamModalOpen && (
          <ExamAttempt
            exam={selectedExam}
            onSubmit={handleExamSubmit}
            onClose={() => setIsExamModalOpen(false)}
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
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
              <div key={courseId} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-8 last:pb-0">
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
                      key={lesson._id}
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
        />
      )}

      {/* Lesson Modal */}
      {selectedLesson && isLessonModalOpen && (
        <LessonModal
          lesson={selectedLesson}
          onClose={() => setIsLessonModalOpen(false)}
        />
      )}
    </>
  );
}
