'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function AdminRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
  });

  useEffect(() => {
    // Check authentication
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      router.push('/auth/login');
      return;
    }

    const ADMIN_ROLE = 'admin';
    const TEACHER_ROLE = 'teacher';

    const userData = JSON.parse(storedUser);

    if (userData.role !== ADMIN_ROLE && userData.role !== TEACHER_ROLE) {
      router.push('/auth/login');
      return;
    }
  }, [router]);

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

      // Create the request payload without confirmPassword
      const requestData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: 'admin',
      };
      //Debugging Purpose, for testing will delete soon
      console.log('Sending registration data:', requestData);

      const response = await fetch('/api/admin/register-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        //Debugging Purpose, for testing will delete soon
        throw new Error(data.error || 'Registration failed');
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Admin registered successfully!',
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
              "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')",
          }}
        />

        <div className="flex items-center w-full max-w-3xl p-8 mx-auto lg:px-12 lg:w-3/5">
          <div className="w-full">
            <h1 className="text-2xl font-semibold tracking-wider text-gray-800 capitalize dark:text-white">
              Add New Administrator to E-Learning Hub
            </h1>

            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Create a new administrator account to help manage the platform.
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
                  placeholder="adminuser"
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
                  placeholder="admin@example.com"
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

              <div className="col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 text-sm tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                >
                  Register Admin
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
