import React, { useEffect, useState } from 'react';
import { UserPlus, Users, School } from 'lucide-react';
import UserList from './UserList';
import UserForm from './UserForm';
import axios from 'axios';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  const [showAddForm, setShowAddForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Include authentication token if necessary
          },
        });
        setUsers(response.data);
      } catch (err) {
        setError(err.message || 'Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Determine user types to show based on the active tab
  const userTypesToShow = activeTab === 'students' ? ['student'] : ['lecturer', 'admin'];

  // Filter users based on active tab
  const filteredUsers = users.filter(user =>
    userTypesToShow.includes(user.role) // Assuming user.role indicates if they are a 'student', 'lecturer', or 'admin'
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add New User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('students')}
              className={`${
                activeTab === 'students'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center w-1/2 py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <School className="h-5 w-5 mr-2" />
              Students
            </button>
            <button
              onClick={() => setActiveTab('lecturers')}
              className={`${
                activeTab === 'lecturers'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex items-center w-1/2 py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <Users className="h-5 w-5 mr-2" />
              Lecturers
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            <UserList users={filteredUsers} />
          )}
        </div>
      </div>

      {showAddForm && (
        <UserForm
          userType={activeTab}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}
