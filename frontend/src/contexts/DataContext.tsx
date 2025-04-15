import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "sonner";
import { BloodRequest, Donor, Hospital, BloodRequestPayload } from '../types/bloodTypes';
import { generateMockBloodRequests } from '../utils/mockData';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataContextType {
  bloodRequests: BloodRequest[];
  donors: Donor[];
  hospitals: Hospital[];
  addBloodRequest: (request: Omit<BloodRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<BloodRequest>;
  updateBloodRequestStatus: (requestId: string, urgent: boolean) => Promise<void>;
  getDonorById: (id: string) => Donor | undefined;
  getHospitalById: (id: string) => Hospital | null;
  getRequestById: (id: string) => BloodRequest | undefined;
  getDonorsByBloodType: (bloodType: string) => Donor[];
  getRequestsByHospital: (hospitalId: string) => BloodRequest[];
  getRequestsByDonor: (donorId: string) => BloodRequest[];
  getBloodRequestsForDonor: (donorId: string) => BloodRequest[];
  getCompletedRequestsByDonorId: (donorId: string) => BloodRequest[];
  addDonor: (donor: Omit<Donor, 'id' | 'createdAt' | 'donations'>) => void;
  addHospital: (hospital: Omit<Hospital, 'id' | 'createdAt' | 'requestsMade' | 'requestsCompleted'>) => void;
  verifyHospital: (hospitalId: string, verified: boolean) => Promise<void>;
  getBloodRequests: () => Promise<void>;
  createBloodRequest: (request: BloodRequestPayload) => Promise<BloodRequest>;
}

interface BloodRequestResponse {
  _id: string;
  hospitalId: string;
  donorId: string;
  bloodType: string;
  contactPerson: string;
  contactNumber: string;
  urgent: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  // Fetch blood requests from backend
  useEffect(() => {
    const fetchBloodRequests = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          console.error('No user found in localStorage');
          return;
        }
        const user = JSON.parse(storedUser);

        // Determine the endpoint based on user role
        const endpoint = user.role === 'hospital'
          ? 'http://localhost:5001/api/hospital/blood-requests/new'
          : user.role === 'donor'
          ? 'http://localhost:5001/api/donor/blood-requests'
          : 'http://localhost:5001/api/admin/blood-requests';

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch blood requests: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        const mappedRequests = data.map((request: any) => ({
          id: request._id,
          hospitalId: request.hospitalId,
          hospitalName: request.hospitalName,
          bloodType: request.bloodType,
          urgent: request.urgent,
          status: request.status,
          location: request.location,
          contactPerson: request.contactPerson,
          contactNumber: request.contactNumber,
          notes: request.notes,
          createdAt: request.createdAt,
          acceptedBy: request.acceptedBy,
          completedAt: request.completedAt,
          cancelReason: request.cancelReason,
          patientName: request.patientName,
          patientAge: request.patientAge,
          unitsRequired: request.unitsRequired
        }));

        setBloodRequests(mappedRequests);
      } catch (error) {
        console.error('Error in fetchBloodRequests:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to fetch blood requests');
      }
    };

    fetchBloodRequests();
  }, []);

  // Fetch real hospitals from backend
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        // Get the stored user from localStorage to access the token
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          console.error('No user found in localStorage');
          return;
        }
        const user = JSON.parse(storedUser);
        console.log('Current user:', { id: user.id, role: user.role });

        // Fetch hospital data based on user role
        const endpoint = user.role === 'hospital' 
          ? 'http://localhost:5001/api/hospital/profile'
          : 'http://localhost:5001/api/admin/hospitals';

        console.log('Fetching hospital data from:', endpoint);

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Failed to fetch hospitals: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Raw hospital data:', data);

        // Handle both single hospital and array of hospitals
        const hospitalsData = Array.isArray(data) ? data : [data];
        console.log('Processed hospital data:', hospitalsData);

        const mappedHospitals = hospitalsData.map((hospital: any) => {
          console.log('Mapping hospital data:', hospital);
          const mappedHospital = {
            id: hospital._id,
            name: hospital.name,
            email: hospital.email,
            city: hospital.city || 'Not specified',
            state: hospital.state || 'Not specified',
            location: hospital.city || 'Not specified',
            contactPerson: hospital.contactPerson || 'Not specified',
            phone: hospital.phone || 'Not specified',
            contactNumber: hospital.phone || 'Not specified',
            isVerified: Boolean(hospital.isVerified), // Ensure boolean conversion
            requestsMade: hospital.requestsMade || 0,
            requestsCompleted: hospital.requestsCompleted || 0,
            createdAt: hospital.createdAt
          };
          console.log('Mapped hospital:', mappedHospital);
          return mappedHospital;
        });

        console.log('Final mapped hospitals:', mappedHospitals);
        setHospitals(mappedHospitals);

        // Update user in localStorage if verification status has changed
        if (user.role === 'hospital' && hospitalsData.length === 1) {
          const hospital = hospitalsData[0];
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (currentUser.isVerified !== hospital.isVerified) {
            const updatedUser = {
              ...currentUser,
              isVerified: hospital.isVerified
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('Updated user verification status:', updatedUser.isVerified);
          }
        }
      } catch (error) {
        console.error('Error in fetchHospitals:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to fetch hospitals');
      }
    };

    // Initial fetch
    fetchHospitals();

    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(fetchHospitals, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Fetch real donors from backend
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        // Get the stored user from localStorage to access the token
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          console.error('No user found in localStorage');
          return;
        }
        const user = JSON.parse(storedUser);
        console.log('Attempting to fetch donors...'); // Debug log

        const response = await fetch('http://localhost:5001/api/donor', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
            'Accept': 'application/json'
          }
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Failed to fetch donors: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched donors data:', data); // Debug log

        if (!Array.isArray(data)) {
          console.error('Unexpected data format:', data);
          throw new Error('Received invalid data format from server');
        }

        setDonors(data.map((donor: any) => ({
          id: donor._id,
          name: donor.name,
          email: donor.email,
          bloodType: donor.bloodGroup || donor.bloodType,
          age: donor.age || 25,
          gender: donor.gender || 'Not specified',
          location: donor.city || donor.location,
          state: donor.state,
          contactNumber: donor.phone || donor.contactNumber,
          lastDonation: donor.lastDonation,
          donations: donor.donations || 0,
          createdAt: donor.createdAt,
          available: donor.isAvailable !== false
        })));
      } catch (error) {
        console.error('Error in fetchDonors:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to fetch donors');
      }
    };

    fetchDonors();
  }, []);

  // Add a blood request
  const addBloodRequest = async (request: BloodRequestPayload): Promise<BloodRequest> => {
    try {
      console.log('Starting blood request creation...');
      console.log('Initial request data:', request);

      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        console.error('No user found in localStorage');
        toast.error('Please log in to create a blood request');
        throw new Error('No user found in localStorage');
      }
      const user = JSON.parse(storedUser);
      console.log('Logged in user:', { id: user.id, role: user.role });

      // Validate required fields
      if (!request.contactPerson || !request.contactNumber) {
        console.error('Missing required fields:', {
          contactPerson: request.contactPerson,
          contactNumber: request.contactNumber
        });
        toast.error('Please provide contact person and contact number');
        throw new Error('Missing required fields');
      }

      // Prepare the request payload according to backend schema
      const requestPayload = {
        hospitalId: user.id,
        bloodType: request.bloodType,
        contactPerson: request.contactPerson,
        contactNumber: request.contactNumber,
        urgent: request.urgent || false
      };

      console.log('Prepared request payload:', requestPayload);

      const response = await axios.post<BloodRequestResponse>(`${API_URL}/hospital/blood-requests`, requestPayload, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        }
      });

      console.log('Server response:', response.data);

      if (!response.data) {
        console.error('No response data received from server');
        toast.error('No response received from server');
        throw new Error('No data received from server');
      }

      const newRequest: BloodRequest = {
        id: response.data._id,
        hospitalId: response.data.hospitalId,
        donorId: response.data.donorId || null,
        bloodType: response.data.bloodType,
        contactPerson: response.data.contactPerson,
        contactNumber: response.data.contactNumber,
        urgent: response.data.urgent,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt
      };

      console.log('Created new blood request:', newRequest);

      setBloodRequests((prevRequests: BloodRequest[]): BloodRequest[] => {
        const updatedRequests = [...prevRequests, newRequest];
        console.log('Updated blood requests list:', updatedRequests);
        return updatedRequests;
      });

      return newRequest;
    } catch (error: any) {
      console.error('Error creating blood request:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestPayload: error.config?.data
      });

      if (error?.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Invalid request data';
        console.error('Validation error details:', error.response.data);
        toast.error(`Failed to create blood request: ${errorMessage}`);
      } else if (error?.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
      } else {
        toast.error(error?.message || 'Failed to create blood request');
      }
      throw error;
    }
  };

  // Update blood request status
  const updateBloodRequestStatus = async (requestId: string, urgent: boolean) => {
    try {
      const response = await axios.patch(`${API_URL}/hospital/blood-requests/${requestId}`, { urgent }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setBloodRequests(prev => prev.map(request => 
        request.id === requestId ? { ...request, urgent } : request
      ));
      
      toast(`Request urgency updated to ${urgent ? 'urgent' : 'not urgent'}`);
    } catch (error) {
      console.error('Error updating blood request status:', error);
      throw error;
    }
  };

  // Get donor by ID
  const getDonorById = (id: string) => {
    return donors.find(donor => donor.id === id);
  };

  // Get hospital by ID
  const getHospitalById = (id: string) => {
    console.log('Getting hospital by id:', id);
    console.log('Current hospitals state:', hospitals);
    
    if (!id) {
      console.error('Invalid hospital ID provided:', id);
      return null;
    }
    
    // Try to find by id
    const hospital = hospitals.find(hospital => {
      const isMatch = hospital.id === id;
      console.log('Comparing hospital:', { 
        hospitalId: hospital.id, 
        searchId: id,
        isMatch,
        isVerified: hospital.isVerified
      });
      return isMatch;
    });
    
    if (!hospital) {
      console.log('No hospital found with id:', id);
      return null;
    }
    
    console.log('Found hospital:', hospital);
    return hospital;
  };

  // Get request by ID
  const getRequestById = (id: string) => {
    return bloodRequests.find(request => request.id === id);
  };

  // Get donors by blood type
  const getDonorsByBloodType = (bloodType: string) => {
    return donors.filter(donor => donor.bloodType === bloodType);
  };

  // Get requests by hospital
  const getRequestsByHospital = (hospitalId: string) => {
    return bloodRequests.filter(request => request.hospitalId === hospitalId);
  };

  // Get requests relevant to a donor (matching blood type)
  const getRequestsByDonor = (donorId: string) => {
    return bloodRequests.filter(request => request.donorId === donorId);
  };

  // Get all blood requests for a donor (combined function for donor dashboard)
  const getBloodRequestsForDonor = (donorId: string) => {
    return bloodRequests.filter(request => request.donorId === donorId);
  };

  // Get completed requests by donor ID (new function to fix error)
  const getCompletedRequestsByDonorId = (donorId: string) => {
    return bloodRequests.filter(request => request.donorId === donorId);
  };

  // Add a new donor
  const addDonor = (donorData: Omit<Donor, 'id' | 'createdAt' | 'donations'>) => {
    const newDonor: Donor = {
      ...donorData,
      id: `d${Date.now()}`,
      createdAt: new Date().toISOString(),
      donations: 0
    };
    
    setDonors(prev => [...prev, newDonor]);
    toast("Donor profile created successfully");
  };

  // Add a new hospital
  const addHospital = (hospitalData: Omit<Hospital, 'id' | 'createdAt' | 'requestsMade' | 'requestsCompleted'>) => {
    const newHospital: Hospital = {
      ...hospitalData,
      id: `h${Date.now()}`,
      createdAt: new Date().toISOString(),
      requestsMade: 0,
      requestsCompleted: 0
    };
    
    setHospitals(prev => [...prev, newHospital]);
    toast("Hospital profile created successfully");
  };

  // Verify or unverify a hospital
  const verifyHospital = async (hospitalId: string, verified: boolean) => {
    try {
      // Get the stored user from localStorage to access the token
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('No user found in localStorage');
      }
      const user = JSON.parse(storedUser);

      // First, update the local state optimistically
      setHospitals(prev => 
        prev.map(hospital => 
          hospital.id === hospitalId 
            ? { ...hospital, isVerified: verified } 
            : hospital
        )
      );

      // Then make the API call to verify/unverify
      const response = await fetch(`http://localhost:5001/api/admin/verify-hospital/${hospitalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        // If the API call fails, revert the local state
        setHospitals(prev => 
          prev.map(hospital => 
            hospital.id === hospitalId 
              ? { ...hospital, isVerified: !verified } 
              : hospital
          )
        );
        const errorText = await response.text();
        throw new Error(`Failed to verify hospital: ${response.status} ${response.statusText}`);
      }

      // After successful verification, refresh the hospitals list
      const refreshResponse = await fetch('http://localhost:5001/api/admin/hospitals', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        }
      });

      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        const mappedHospitals = refreshedData.map((hospital: any) => ({
          id: hospital._id,
          name: hospital.name,
          email: hospital.email,
          city: hospital.city || 'Not specified',
          state: hospital.state || 'Not specified',
          location: hospital.city || 'Not specified',
          contactPerson: hospital.contactPerson || 'Not specified',
          phone: hospital.phone || 'Not specified',
          contactNumber: hospital.phone || 'Not specified',
          isVerified: hospital.isVerified,
          requestsMade: hospital.requestsMade || 0,
          requestsCompleted: hospital.requestsCompleted || 0,
          createdAt: hospital.createdAt
        }));
        setHospitals(mappedHospitals);
      }
      
      if (verified) {
        toast.success("Hospital has been verified successfully!");
      } else {
        toast.warning("Hospital verification has been revoked.");
      }
    } catch (error) {
      console.error('Error in verifyHospital:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to verify hospital');
    }
  };

  const getBloodRequests = async () => {
    try {
      const response = await axios.get<BloodRequest[]>(`${API_URL}/hospital/blood-requests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBloodRequests(response.data);
    } catch (error) {
      console.error('Error fetching blood requests:', error);
      throw error;
    }
  };

  const createBloodRequest = async (request: BloodRequestPayload): Promise<BloodRequest> => {
    try {
      console.log('Starting blood request creation...');
      console.log('Initial request data:', request);

      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        console.error('No user found in localStorage');
        toast.error('Please log in to create a blood request');
        throw new Error('No user found in localStorage');
      }
      const user = JSON.parse(storedUser);
      console.log('Logged in user:', { id: user.id, role: user.role });

      // Validate required fields
      if (!request.contactPerson || !request.contactNumber) {
        console.error('Missing required fields:', {
          contactPerson: request.contactPerson,
          contactNumber: request.contactNumber
        });
        toast.error('Please provide contact person and contact number');
        throw new Error('Missing required fields');
      }

      // Prepare the request payload according to backend schema
      const requestPayload = {
        hospitalId: user.id,
        bloodType: request.bloodType,
        contactPerson: request.contactPerson,
        contactNumber: request.contactNumber,
        urgent: request.urgent || false
      };

      console.log('Prepared request payload:', requestPayload);

      const response = await axios.post<BloodRequestResponse>(`${API_URL}/hospital/blood-requests`, requestPayload, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        }
      });

      console.log('Server response:', response.data);

      if (!response.data) {
        console.error('No response data received from server');
        toast.error('No response received from server');
        throw new Error('No data received from server');
      }

      const newRequest: BloodRequest = {
        id: response.data._id,
        hospitalId: response.data.hospitalId,
        donorId: response.data.donorId || null,
        bloodType: response.data.bloodType,
        contactPerson: response.data.contactPerson,
        contactNumber: response.data.contactNumber,
        urgent: response.data.urgent,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt
      };

      console.log('Created new blood request:', newRequest);

      setBloodRequests((prevRequests: BloodRequest[]): BloodRequest[] => {
        const updatedRequests = [...prevRequests, newRequest];
        console.log('Updated blood requests list:', updatedRequests);
        return updatedRequests;
      });

      toast.success('Blood request created successfully');
      return newRequest;
    } catch (error: any) {
      console.error('Error creating blood request:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestPayload: error.config?.data
      });

      if (error?.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Invalid request data';
        console.error('Validation error details:', error.response.data);
        toast.error(`Failed to create blood request: ${errorMessage}`);
      } else if (error?.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
      } else {
        toast.error(error?.message || 'Failed to create blood request');
      }
      throw error;
    }
  };

  return (
    <DataContext.Provider 
      value={{ 
        bloodRequests,
        donors,
        hospitals,
        addBloodRequest,
        updateBloodRequestStatus,
        getDonorById,
        getHospitalById,
        getRequestById,
        getDonorsByBloodType,
        getRequestsByHospital,
        getRequestsByDonor,
        getBloodRequestsForDonor,
        getCompletedRequestsByDonorId,
        addDonor,
        addHospital,
        verifyHospital,
        getBloodRequests,
        createBloodRequest
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};