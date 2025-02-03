'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function UserManagement() {
  const [users, setUsers] = useState([]);

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
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleDelete = async (userId: string, role: string) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/users', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, role }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        await Swal.fire('Deleted!', 'User has been deleted.', 'success');
        fetchUsers();
      }
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b">Username</th>
              <th className="px-6 py-3 border-b">Email</th>
              <th className="px-6 py-3 border-b">Role</th>
              <th className="px-6 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user._id}>
                <td className="px-6 py-4 border-b">{user.username}</td>
                <td className="px-6 py-4 border-b">{user.email}</td>
                <td className="px-6 py-4 border-b">{user.role}</td>
                <td className="px-6 py-4 border-b">
                  <button
                    onClick={() => handleDelete(user._id, user.role)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
