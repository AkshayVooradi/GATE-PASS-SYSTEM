// Frontend code to fetch gate pass details based on query parameters
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function ValidateGatePass() {
  const [gatePassDetails, setGatePassDetails] = useState(null);
  const [error, setError] = useState(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const gatePassId = queryParams.get('id');
  const expiresAt = queryParams.get('expiresAt');

  useEffect(() => {
    const fetchGatePassDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/gate-passes/validate-gatepass`, {
          params: { id: gatePassId, expiresAt },
        });
        setGatePassDetails(response.data);
      } catch (error) {
        setError(error.response?.data.message || 'Error fetching gate pass details');
      }
    };

    fetchGatePassDetails();
  }, [gatePassId, expiresAt]);

  if (error) return <div>{error}</div>;
  if (!gatePassDetails) return <div>Loading...</div>;

  return (
    <div>
      <h1>Gate Pass Details</h1>
      <p>Name: {gatePassDetails.studentName}</p>
      <p>Roll No: {gatePassDetails.rollNo}</p>
      <p>Class: {gatePassDetails.class}</p>
      <img src={`http://localhost:5000/${gatePassDetails.image}`} alt="Student Image" style={{ width: '500px', height: '500px' }}/>

    </div>
  );
}

export default ValidateGatePass;
