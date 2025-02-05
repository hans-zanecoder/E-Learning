'use client';

import { Dialog, Transition } from '@headlessui/react';
import { useState, useEffect, Fragment } from 'react';
import { swalSuccess, swalError } from '@/app/utils/swalUtils';
import { useRouter } from 'next/navigation';

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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    teacherId: '',
  });
  const [teachers, setTeachers] = useState<Array<{ _id: string; fullName: string }>>([]);
  const router = useRouter();

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
        endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '',
        teacherId: course.teacherId?._id || '',
      });
      fetchTeachers();
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
      swalError(error, { defaultMessage: 'Failed to fetch teachers' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Submitting update for course:', {
        courseId: course._id,
        course: course,
        formData: formData
      });

      const response = await fetch(`/api/admin/courses/${course._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          teacherId: formData.teacherId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error;
        } catch (e) {
          errorMessage = `Failed to update course (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data) {
        throw new Error('Invalid response from server');
      }

      await swalSuccess({ text: 'Course updated successfully' });
      onUpdate();
      closeModal();
      router.refresh();
    } catch (error: any) {
      console.error('Update error details:', error);
      swalError(error, { defaultMessage: 'Failed to update course' });
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog onClose={closeModal} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Edit Course
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Course Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="programming">Programming</option>
                          <option value="design">Design</option>
                          <option value="business">Business</option>
                          <option value="marketing">Marketing</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Assigned Teacher
                        </label>
                        <select
                          value={formData.teacherId}
                          onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
