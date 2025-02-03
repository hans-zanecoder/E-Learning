'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

interface Teacher {
  _id: string;
  fullName: string;
}

interface CourseEditModalProps {
  isOpen: boolean;
  closeModal: () => void;
  course: any;
  onUpdate: () => void;
}

export default function CourseEditModal({
  isOpen,
  closeModal,
  course,
  onUpdate,
}: CourseEditModalProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');

  useEffect(() => {
    fetchTeachers();
    if (course?.teacherId) {
      setSelectedTeacher(course.teacherId);
    }
  }, [course]);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/teachers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTeachers(data.teachers);
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to load teachers',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/courses/${course._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teacherId: selectedTeacher }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Course updated successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      onUpdate();
      closeModal();
    } catch (error: any) {
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to update course',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
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
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                Edit Course: {course?.title}
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Assign Teacher
                  </label>
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Update Course
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
