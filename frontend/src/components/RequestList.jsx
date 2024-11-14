import React, { useState } from 'react';
import { Check, X, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode.react';

export default function RequestList({ requests, onApprove, onDeny, userRole }) {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', or 'denied'
  const [otp, setOtp] = useState(''); // State to store OTP input
  const [verified, setVerified] = useState(false); // State to track OTP verification
  const [error, setError] = useState(''); // State to show OTP verification error

  // Filter requests based on the active tab
  const filteredRequests = requests.filter(request => request.status === activeTab);

  //verify the entered OTP with parents OTP
  const handleOtpSubmit = async (requestId) => {
    try {
      const response = await fetch('http://localhost:5000/api/gate-passes/verify-otp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ gatePassId: requestId, otp: otp }),
      });

      const data = await response.json();
      if (response.ok) {
        setVerified(true); // Mark as verified and display QR code
        setError(''); // Clear any previous error messages
      } else {
        setError(data.message); // Show the error message
        setVerified(false); // Ensure QR code is not shown
      }
    } catch (error) {
      setError('OTP verification failed. Try again later.');
      setVerified(false); // Ensure QR code is not shown
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        {userRole === 'lecturer' ? 'Manage Requests' : 'Your Requests'}
      </h2>

      {/* Tabs for switching between request statuses */}
      <div className="flex justify-center mb-6">
        {['pending', 'approved', 'denied'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold text-sm rounded ${activeTab === tab
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredRequests.map((request) => (
            <li key={request._id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {userRole === 'lecturer' && (
                    <>
                      <p className="text-sm font-medium text-gray-900">Name: {request.student.name}</p>
                      <p className="text-sm text-gray-500">Roll No: {request.student.rollNo}</p>
                    </>
                  )}
                  <p className="text-sm font-medium text-gray-900">
                    Request Date: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">{request.reason}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Status:{' '}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : request.status === 'denied'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      `}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </p>

                  {/* OTP Verification and Display QR code if status is 'approved' and user is 'student' */}
                  {request.status === 'approved' && userRole === 'student' && !verified && (
                    <div className="mt-4">
                      <div className="flex flex-col items-center space-y-4">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter OTP sent to parent"
                          className="px-4 py-2 border border-gray-300 rounded-md"
                        />
                        <button
                          onClick={() => handleOtpSubmit(request._id)}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-md"
                        >
                          Verify OTP
                        </button>

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                      </div>
                    </div>
                  )}

                  {/* Show QR code after OTP is verified */}
                  {verified && (
                    <div className="mt-4">
                      <div className="flex items-center space-x-4">
                        <QRCode value={JSON.stringify(request.qrData)} size={128} />
                        <div className="text-sm text-gray-500">
                          <Link
                            to={`/qr/${request._id}`}
                            className="inline-flex items-center mt-2 text-indigo-600 hover:text-indigo-900"
                          >
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Display approve/deny buttons if user is 'lecturer' and status is 'pending' */}
                  {userRole === 'lecturer' && request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onApprove(request._id)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDeny(request._id)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Display a message if no requests match the selected status */}
        {filteredRequests.length === 0 && (
          <div className="p-4 text-gray-500 text-center">
            No {activeTab} requests to show.
          </div>
        )}
      </div>
    </div>
  );
}
