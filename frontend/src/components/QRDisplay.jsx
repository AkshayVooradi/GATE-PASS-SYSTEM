import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import QRCode from 'qrcode.react';

export default function QRDisplay({ requests }) {
  const { id } = useParams();
  const request = requests.find(r => r.id === id);

  if (!request || request.status !== 'approved') {
    return <Navigate to="/dashboard" />;
  }

  const isExpired = new Date(request.qrData.expiresAt) < new Date();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Gate Pass QR Code</h2>
          <div className="flex justify-center mb-4">
            <QRCode value={JSON.stringify(request.qrData)} size={256} />
          </div>
        </div>
      </div>
    </div>
  );
}