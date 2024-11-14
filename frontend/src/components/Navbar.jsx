import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, School } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <School className="h-8 w-8" />
            <span className="font-bold text-xl">Gate Pass System</span>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                Welcome, {user.name} ({user.role})
              </span>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}