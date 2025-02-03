'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bars3Icon,
  ChartPieIcon,
  UsersIcon,
  UserPlusIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  BookOpenIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import CourseEditModal from '@/app/admin/components/CourseEditModal';

// Add interface for user type
interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  fullName?: string;
  isActive: boolean;
}

const navigation = [
  {
    name: 'Dashboard',
    icon: ChartPieIcon,
    view: 'dashboard',
  },
  {
    name: 'Users',
    icon: UsersIcon,
    view: 'users',
  },
  {
    name: 'Courses',
    icon: BookOpenIcon,
    view: 'courses',
  },
  {
    name: 'Add Course',
    icon: PlusIcon,
    href: '/admin/courses/add',
  },
  {
    name: 'Register Admin',
    icon: UserPlusIcon,
    href: '/admin/register-admin',
  },
  {
    name: 'Register Teacher',
    icon: UserPlusIcon,
    href: '/admin/register-teacher',
  },
];

//Cards below are for testing purposes, will add fetch soon
export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    teachersCount: 0,
    activeStudentsCount: 0,
    coursesCount: 0,
    teacherGrowth: 0,
    studentGrowth: 0,
    courseGrowth: 0,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!storedUser || !token) {
      router.push('/auth/login');
      return;
    }
    const ADMIN_ROLE = 'admin';
    const TEACHER_ROLE = 'teacher';
    const STUDENT_ROLE = 'student';
    const userData = JSON.parse(storedUser);
    if (userData.role !== ADMIN_ROLE && userData.role !== TEACHER_ROLE) {
      router.push('/auth/login');
      return;
    }

    fetchCourses();
    fetchDashboardStats();
    setUser(userData);
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/courses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      // Add this console.log to debug the courses data
      console.log('Fetched courses with teacher data:', data.courses);
      
      setCourses(data.courses);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard', {
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

  if (!user) return null;

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth/login');
  };

  const DashboardStats = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Total Teachers Card */}
          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Teachers
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardStats.teachersCount}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>

          {/* Total Courses Card */}
          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Courses
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardStats.coursesCount}
                </h3>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <BookOpenIcon className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </div>

          {/* Active Students Card */}
          <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Students
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardStats.activeStudentsCount}
                </h3>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <UsersIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="mt-6">
          <div className="sm:flex sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              All Courses
            </h2>
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="block w-full pl-10 pr-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
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
                            {course.teacherId ? course.teacherId.fullName.charAt(0) : 'U'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {course.teacherId ? course.teacherId.fullName : 'Unassigned'}
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
                            setIsEditModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
                        >
                          Manage →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const UsersView = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
      username: '',
      email: '',
      fullName: '',
    });

    useEffect(() => {
      fetchUsers();
    }, []);

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setUsers(data.users);
      } catch (error: any) {
        console.error('Error fetching users:', error);
      }
    };

    const handleEdit = (user: User) => {
      setSelectedUser(user);
      setEditFormData({
        username: user.username,
        email: user.email,
        fullName: user.fullName || '',
      });
      setIsEditModalOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedUser) return;
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editFormData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        setUsers(
          users.map((user: User) =>
            user._id === selectedUser._id ? { ...user, ...editFormData } : user
          )
        );
        setIsEditModalOpen(false);

        Swal.fire({
          title: 'Success!',
          text: 'User updated successfully',
          icon: 'success',
          timer: 2000,
        });
      } catch (error: any) {
        Swal.fire('Error', error.message, 'error');
      }
    };

    const handleSoftDelete = async (userId: string) => {
      try {
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: 'This user will be deactivated but can be restored later.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, deactivate',
        });

        if (result.isConfirmed) {
          const token = localStorage.getItem('token');
          const response = await fetch(
            `/api/admin/users/${userId}/soft-delete`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await response.json();
          if (!response.ok) throw new Error(data.error);

          setUsers(
            users.map((user: User) =>
              user._id === userId ? { ...user, isActive: false } : user
            )
          );

          Swal.fire('Deactivated!', 'User has been deactivated.', 'success');
        }
      } catch (error: any) {
        Swal.fire('Error', error.message, 'error');
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Users Management
          </h2>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <input
              type="text"
              placeholder="Search users..."
              className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {users.map((user: User) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.fullName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'teacher'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.role !== 'admin' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleSoftDelete(user._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Deactivate
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleUpdate}>
                  <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Edit User
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Username
                        </label>
                        <input
                          type="text"
                          value={editFormData.username}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              username: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editFormData.email}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              email: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editFormData.fullName}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              fullName: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardStats />;
      case 'users':
        return <UsersView />;
      case 'courses':
        return <div>Courses View</div>;
      default:
        return null;
    }
  };

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
              <Link href="/admin/dashboard" className="flex items-center gap-2 ms-2 md:me-24">
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
              <li key={item.view || item.href}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex w-full items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 gap-x-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setCurrentView(item.view as string)}
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
                )}
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
        <div className="p-4 mt-14">
          {renderContent()}
        </div>
      </div>

      {selectedCourse && (
        <CourseEditModal
          isOpen={isEditModalOpen}
          closeModal={() => setIsEditModalOpen(false)}
          course={selectedCourse}
          onUpdate={fetchCourses}
        />
      )}
    </>
  );
}
