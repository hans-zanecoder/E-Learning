'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  description: string;
}

export default function AdminRegister() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'teacher',
    courses: [] as string[],
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      router.push('/auth/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.role !== 'admin') {
      router.push('/auth/login');
      return;
    }

    fetchCourses(token);
  }, []);

  const fetchCourses = async (token: string) => {
    try {
      const response = await fetch('/api/admin/courses', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch courses');
      }

      const data = await response.json();
      if (!data.courses || !Array.isArray(data.courses)) {
        throw new Error('Invalid course data received');
      }

      setCourses(data.courses);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to load courses',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        title: 'Error!',
        text: 'Passwords do not match!',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (formData.password.length < 6) {
      Swal.fire({
        title: 'Error!',
        text: 'Password must be at least 6 characters long!',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/register-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          fullName: formData.fullName,
          courses: formData.courses,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Teacher registered successfully!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      router.push('/admin/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Registration failed!',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="flex justify-center min-h-screen">
        <div
          className="hidden bg-cover lg:block lg:w-2/5"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=715&q=80')",
          }}
        />

        <div className="flex items-center w-full max-w-3xl p-8 mx-auto lg:px-12 lg:w-3/5">
          <div className="w-full">
            <h1 className="text-2xl font-semibold tracking-wider text-gray-800 capitalize dark:text-white">
              Add New Teacher to E-Learning Hub
            </h1>

            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Create a new teacher account to join our educational platform.
            </p>

            <form
              className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2"
              onSubmit={handleSubmit}
            >
              <div className="col-span-2">
                <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="teachername"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="teacher@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">
                  Confirm password
                </label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">
                  Assigned Courses
                </label>
                <select
                  multiple
                  value={formData.courses}
                  onChange={(e) => {
                    const selectedCourses = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    setFormData({ ...formData, courses: selectedCourses });
                  }}
                  className="block w-full px-5 py-3 mt-2 text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40"
                  required
                >
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Hold Ctrl (Windows) or Command (Mac) to select multiple
                  courses
                </p>
              </div>

              <div className="col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 text-sm tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                >
                  Register Teacher
                </button>
                <Link
                  href="/admin/dashboard"
                  className="px-6 py-3 text-sm text-blue-500 transition-colors duration-300 transform border border-blue-500 rounded-lg dark:text-blue-400 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 flex items-center justify-center"
                >
                  Back to Dashboard
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
