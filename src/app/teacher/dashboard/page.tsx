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
  BookmarkIcon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { swalSuccess, swalError, swalConfirm } from '@/app/utils/swalUtils';

interface Exam {
  _id: string;
  title: string;
  description: string;
  courseId: string;
  examQuestionId: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  courseId: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  _id: string;
  title: string;
  content: string;
  courseId: string;
  studentProgress: Array<{
    studentId: string;
    completed: boolean;
  }>;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  _id: string;
  username: string;
  fullName: string;
  email: string;
}

interface Course {
  _id: string;
  name: string;
  description: string;
  enrolledStudents: Student[];
  lessons: Lesson[];
  exams: Exam[];
  assignments: Assignment[];
  teacherId: string;
}

interface CourseDetailsModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const CourseDetailsModal = ({ course, isOpen, onClose, onUpdate }: CourseDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState('students');
  const [newLesson, setNewLesson] = useState({ 
    title: '', 
    content: '', 
    dueDate: '' 
  });
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    totalScore: 0,
    dueDate: '',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]
  });
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalScore: 0
  });

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teacher/courses/${course._id}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLesson),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add lesson');
      }
      
      const data = await response.json();
      console.log('Lesson added:', data);
      
      await swalSuccess({ text: 'Lesson added successfully' });
      setNewLesson({ title: '', content: '', dueDate: '' });
      
      // Call onUpdate to refresh the course data
      onUpdate();
    } catch (error: any) {
      console.error('Error adding lesson:', error);
      swalError(error);
    }
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Format the exam data to match the schema
      const examData = {
        title: newExam.title,
        description: newExam.description,
        courseId: course._id,
        questions: newExam.questions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        })),
        totalScore: newExam.totalScore || 100, // Default score if not specified
        dueDate: new Date(newExam.dueDate).toISOString()
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teacher/courses/${course._id}/exams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(examData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add exam');
      }
      
      await swalSuccess({ text: 'Exam added successfully' });
      setNewExam({
        title: '',
        description: '',
        totalScore: 0,
        dueDate: '',
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
      });
      
      // Refresh course data
      onUpdate();
    } catch (error: any) {
      console.error('Error adding exam:', error);
      swalError(error);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teacher/courses/${course._id}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAssignment),
      });

      if (!response.ok) throw new Error('Failed to add assignment');
      
      await swalSuccess({ text: 'Assignment added successfully' });
      setNewAssignment({ title: '', description: '', dueDate: '', totalScore: 0 });
      // Refresh course data
    } catch (error: any) {
      swalError(error);
    }
  };

  const addQuestion = () => {
    setNewExam({
      ...newExam,
      questions: [
        ...newExam.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ]
    });
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = newExam.questions.map((q, i) => {
      if (i === index) {
        if (field === 'options') {
          const optionIndex = parseInt(value.target.dataset.optionindex);
          const newOptions = [...q.options];
          newOptions[optionIndex] = value.target.value;
          return { ...q, options: newOptions };
        }
        return { ...q, [field]: value.target.value };
      }
      return q;
    });

    setNewExam({
      ...newExam,
      questions: updatedQuestions
    });
  };

  const handleEditExam = async (examId: string) => {
    // Implement exam editing functionality
    console.log('Edit exam:', examId);
  };

  const handleDeleteExam = async (examId: string) => {
    const confirmed = await swalConfirm({
      text: "You won't be able to revert this!",
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/teacher/courses/${course._id}/exams/${examId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete exam');
        }

        await swalSuccess({ text: 'Exam deleted successfully' });
        onUpdate(); // Refresh course data
      } catch (error: any) {
        console.error('Error deleting exam:', error);
        swalError(error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full mx-auto shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpenIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{course.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Course Management</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 h-[calc(100vh-200px)] overflow-y-auto">
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 sticky top-0 bg-white dark:bg-gray-800 py-2 z-10">
              {['students', 'lessons', 'exams', 'assignments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeTab === tab
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-6">
              {activeTab === 'students' && (
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Progress
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {course.enrolledStudents?.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                  {student?.fullName?.charAt(0) || student?.username?.charAt(0) || 'S'}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {student?.fullName || student?.username || 'Unknown Student'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {student?.email || 'No email provided'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">45%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'lessons' && (
                <form onSubmit={handleAddLesson} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Lesson Title"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700"
                    required
                  />
                  <textarea
                    placeholder="Lesson Content"
                    value={newLesson.content}
                    onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700"
                    rows={4}
                    required
                  />
                  <input
                    type="date"
                    placeholder="Due Date"
                    value={newLesson.dueDate}
                    onChange={(e) => setNewLesson({ ...newLesson, dueDate: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Lesson
                  </button>
                </form>
              )}

              {activeTab === 'exams' && (
                <form onSubmit={handleAddExam} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Exam</h2>
                    </div>
                    <input
                      type="text"
                      placeholder="Exam Title"
                      value={newExam.title}
                      onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700"
                      required
                    />
                    <textarea
                      placeholder="Exam Description"
                      value={newExam.description}
                      onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700"
                      rows={4}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Due Date
                        </label>
                        <input
                          type="date"
                          placeholder="Due Date"
                          value={newExam.dueDate}
                          onChange={(e) => setNewExam({ ...newExam, dueDate: e.target.value })}
                          className="w-full p-2 border rounded-lg dark:bg-gray-700"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Questions</h3>
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Question
                      </button>
                    </div>

                    {newExam.questions.map((question, questionIndex) => (
                      <div
                        key={questionIndex}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Question {questionIndex + 1}
                          </h4>
                        </div>

                        <textarea
                          placeholder="Enter your question"
                          value={question.question}
                          onChange={(e) => handleQuestionChange(questionIndex, 'question', e)}
                          className="w-full p-2 border rounded-lg dark:bg-gray-700"
                          rows={2}
                          required
                        />

                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Options:</p>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`correct-${questionIndex}`}
                                checked={question.correctAnswer === optionIndex}
                                onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', optionIndex)}
                                className="w-4 h-4 text-blue-600"
                              />
                              <input
                                type="text"
                                placeholder={`Option ${optionIndex + 1}`}
                                value={option}
                                onChange={(e) => handleQuestionChange(questionIndex, 'options', {
                                  target: {
                                    value: e.target.value,
                                    dataset: { optionindex: optionIndex }
                                  }
                                })}
                                className="flex-1 p-2 border rounded-lg dark:bg-gray-700"
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Exam
                  </button>
                </form>
              )}

              {activeTab === 'assignments' && (
                <form onSubmit={handleAddAssignment} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Assignment Title"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700"
                    required
                  />
                  <textarea
                    placeholder="Assignment Description"
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700"
                    rows={4}
                    required
                  />
                  <input
                    type="date"
                    placeholder="Due Date"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Total Score"
                    value={newAssignment.totalScore}
                    onChange={(e) => setNewAssignment({ ...newAssignment, totalScore: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Assignment
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedCourseModal, setSelectedCourseModal] = useState<Course | null>(null);

  const navigation = [
    {
      name: 'Dashboard',
      icon: ChartPieIcon,
      view: 'dashboard',
    },
    {
      name: 'My Courses',
      icon: BookOpenIcon,
      view: 'courses',
    },
    {
      name: 'Manage Lessons',
      icon: BookmarkIcon,
      view: 'lessons',
    },
    {
      name: 'Manage Exams',
      icon: AcademicCapIcon,
      view: 'exams',
    },
    {
      name: 'Manage Quizzes',
      icon: ClipboardDocumentCheckIcon,
      view: 'quizzes',
    },
    {
      name: 'Students',
      icon: UsersIcon,
      view: 'students',
    },
  ];

  useEffect(() => {
    // Check authentication
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      router.push('/auth/login');
      return;
    }

    const TEACHER_ROLE = 'teacher';

    const userData = JSON.parse(storedUser);
    console.log('Stored user data:', userData); // For debugging only
    if (userData.role !== TEACHER_ROLE) {
      router.push('/auth/login');
      return;
    }

    setUser(userData);
    if (!token) {
      swalError(new Error('Authentication token not found'));
      return;
    }

    fetchTeacherCourses(userData._id, token);
  }, []);

  const fetchTeacherCourses = async (teacherId: string, token: string) => {
    try {
      const response = await fetch(`/api/teacher/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Response text:', text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched courses:', data); // For debugging
      setCourses(data.courses);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      swalError(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

  const handleDeleteCourse = async (courseId: string) => {
    const confirmed = await swalConfirm({
      text: "You won't be able to revert this!",
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/teacher/courses/${courseId}`, {
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
          text: 'Course has been deleted'
        });
        
        fetchTeacherCourses(user._id, token!);
      } catch (error: any) {
        console.error('Error deleting course:', error);
        swalError(error);
      }
    }
  };

  const DashboardStats = () => {
    const totalStudents = courses.reduce(
      (total, course) => total + (course.enrolledStudents?.length || 0),
      0
    );

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Assigned Courses
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {courses.length}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <BookOpenIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Students
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalStudents}
                </h3>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <UsersIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>
        </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            My Assigned Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <BookOpenIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {course.name}
                      </h3>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <UsersIcon className="h-4 w-4 inline mr-1" />
                        {course.enrolledStudents?.length || 0} students
                      </div>
                      <button
                        onClick={() => setSelectedCourseModal(course)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        {selectedCourseModal && (
          <CourseDetailsModal
            course={selectedCourseModal}
            isOpen={!!selectedCourseModal}
            onClose={() => setSelectedCourseModal(null)}
            onUpdate={() => fetchTeacherCourses(user._id, localStorage.getItem('token')!)}
          />
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardStats />;
      case 'courses':
        return selectedCourse ? (
          <CourseDetailsModal course={selectedCourse} isOpen={isAddLessonModalOpen} onClose={() => setIsAddLessonModalOpen(false)} onUpdate={() => fetchTeacherCourses(user._id, localStorage.getItem('token')!)} />
        ) : (
          <DashboardStats />
        );
      default:
        return <DashboardStats />;
    }
  };

  if (!user) return null;

  return (
    <>
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
              <Link href="/teacher/dashboard" className="flex items-center gap-2 ms-2 md:me-24">
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

      <div className="p-4 sm:ml-64">
        <div className="p-4 mt-14">
          {renderContent()}
        </div>
      </div>
    </>
  );
}
