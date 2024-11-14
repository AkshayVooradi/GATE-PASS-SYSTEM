import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import GatePassRequest from './components/GatePassRequest';
import RequestList from './components/RequestList';
import AdminDashboard from './components/AdminDashboard';
import QRDisplay from './components/QRDisplay';
import ValidateGatePass from './components/ValidateGatePass';

function App() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        fetchGatePassRequests();
      } else {
        console.error(data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const fetchGatePassRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/gate-passes', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      // console.log(data)
      if (response.ok) {
        setRequests(data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  // Fetch gate pass requests upon login
  useEffect(() => {
    fetchGatePassRequests();
  }, []);

  // Submit a new gate pass request
  const handleGatePassRequest = async (reason) => {
    try {
      const response = await fetch('http://localhost:5000/api/gate-passes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });
      const newRequest = await response.json();
      
      if (response.ok) {
        fetchGatePassRequests();
        console.log(requests)
      } else {
        console.error(newRequest.message);
        alert(newRequest.message);
      }
    } catch (error) {
      console.error('Failed to create gate pass:', error);
    }
  };

  // Approve a gate pass request
  const handleApproveRequest = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/gate-passes/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const updatedRequest = await response.json();

      if (response.ok) {
        setRequests((prevRequests) =>
          prevRequests.map((req) => (req._id === id ? updatedRequest : req))
        );
      } else {
        console.error(updatedRequest.message);
        alert(updatedRequest.message);
      }
    } catch (error) {
      console.error('Failed to approve gate pass:', error);
    }
  };

  // Deny a gate pass request
  const handleDenyRequest = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/gate-passes/${id}/deny`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const updatedRequest = await response.json();

      if (response.ok) {
        setRequests((prevRequests) =>
          prevRequests.map((req) => (req._id === id ? updatedRequest : req))
        );
      } else {
        console.error(updatedRequest.message);
        alert(updatedRequest.message);
      }
    } catch (error) {
      console.error('Failed to deny gate pass:', error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="container mx-auto py-6 px-4">
          <Routes>
            <Route
              path="/"
              element={
                user ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <LoginForm onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                user ? (
                  user.role === 'admin' ? (
                    <AdminDashboard />
                  ) : (
                    <div className="space-y-6">
                      {user.role === 'student' && (
                        <>
                          <GatePassRequest onSubmit={handleGatePassRequest} />
                          <RequestList
                            requests={requests}
                            userRole="student"
                          />
                        </>
                      )}
                      {user.role === 'lecturer' && (
                        <RequestList
                          requests={requests}
                          onApprove={(id) => handleApproveRequest(id)} // Pass the id to handleApproveRequest
                          onDeny={(id) => handleDenyRequest(id)}       // Pass the id to handleDenyRequest
                          userRole="lecturer"
                        />
                      )}
                    </div>
                  )
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route path="/qr/:id" element={<QRDisplay requests={requests} />} />
            <Route path="/validate-gatepass" element={<ValidateGatePass />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
