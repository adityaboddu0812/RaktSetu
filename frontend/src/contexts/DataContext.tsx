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
          console.log('DataContext: No user found, skipping blood request fetch.');
          return;
        }
        const user = JSON.parse(storedUser);

        // Determine the endpoint based on user role
        let endpoint = '';
        if (user.role === 'hospital') {
          endpoint = `${API_URL}/hospital/blood-requests`;
        } else if (user.role === 'donor') {
          endpoint = `${API_URL}/donor/blood-requests`;
        } else if (user.role === 'admin') {
          console.log('DataContext: Skipping blood request fetch for admin role.');
          setBloodRequests([]);
          return;
        }

        if (!endpoint) {
            console.log('DataContext: No valid endpoint determined for blood requests.');
            return;
        }

        console.log('Fetching blood requests from:', endpoint);

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
          console.error(`Error fetching blood requests (${endpoint}): ${response.status} ${response.statusText}`, errorText);
          throw new Error(`Failed to fetch blood requests: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched blood requests:', data);
        setBloodRequests(data);
      } catch (error) {
        console.error('Error in fetchBloodRequests:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to fetch blood requests');
      }
    };

    fetchBloodRequests();
  }, []);

  // Fetch real donors from backend
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const storedUser = localStorage.getItem('user');

        if (!storedUser) {
          console.log('DataContext: No user found, skipping donor fetch.');
          return;
        }
        const user = JSON.parse(storedUser);
        console.log('Attempting to fetch donors...'); 

        // Determine endpoint based on role
        let endpoint = '';
        if (user.role === 'admin') {
            endpoint = `${API_URL}/admin/donors`;
            console.log('Using admin donors endpoint');
        } else if (user.role === 'hospital') {
            endpoint = `${API_URL}/hospital/search-donors`;
            console.log("DataContext: Skipping bulk donor fetch for hospital role (use search page).");
            setDonors([]);
            return;
        } else if (user.role === 'donor') {
            console.log("DataContext: Skipping bulk donor fetch for donor role.");
            setDonors([]);
            return;
        }

        if (!endpoint) {
            console.log('DataContext: No valid endpoint determined for donors.');
            return;
        }

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
            'Accept': 'application/json'
          }
        });

        console.log('Donor fetch response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response fetching donors:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Failed to fetch donors: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched donors data:', data);
        setDonors(data);
      } catch (error) {
        console.error('Error in fetchDonors:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to fetch donors');
        setDonors([]);
      }
    };

    fetchDonors();
  }, []);

  // Fetch real hospitals from backend
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const storedUser = localStorage.getItem('user');

        if (!storedUser) {
          console.log('DataContext: No user found, skipping hospital fetch.');
          return;
        }
        const user = JSON.parse(storedUser);
        console.log('Current user role for hospital fetch:', user.role);

        // Determine endpoint based on user role
        let endpoint = '';
        if (user.role === 'hospital') {
            endpoint = `${API_URL}/hospital/profile`;
        } else if (user.role === 'admin') {
            endpoint = `${API_URL}/admin/hospitals`;
        } else if (user.role === 'donor') {
            console.log("DataContext: Skipping hospital fetch for donor role.");
            setHospitals([]);
            return;
        }

        if (!endpoint) {
            console.log('DataContext: No valid endpoint determined for hospitals.');
            return;
        }

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
          console.error('Error response fetching hospitals:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            endpoint: endpoint
          });
          throw new Error(`Failed to fetch hospitals: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Raw hospital data:', data);
        const hospitalsData = Array.isArray(data) ? data : [data];
        console.log('Processed hospital data:', hospitalsData);

        const mappedHospitals = hospitalsData.map((hospital: any) => {
          return {
            _id: hospital._id || hospital.id,
            name: hospital.name,
            email: hospital.email,
            licenseNumber: hospital.licenseNumber,
            phone: hospital.phone,
            city: hospital.city || 'Not specified',
            state: hospital.state || 'Not specified',
            location: hospital.city || 'Not specified',
            contactPerson: hospital.contactPerson || 'Not specified',
            contactNumber: hospital.phone || 'Not specified',
            isVerified: Boolean(hospital.isVerified),
            requestsMade: hospital.requestsMade || 0,
            requestsCompleted: hospital.requestsCompleted || 0,
            createdAt: hospital.createdAt
          };
        });

        console.log('Final mapped hospitals:', mappedHospitals);
        setHospitals(mappedHospitals);

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
        setHospitals([]);
      }
    };

    fetchHospitals();
    const refreshInterval = setInterval(fetchHospitals, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Add a blood request
  const addBloodRequest = async (request: Omit<BloodRequest, '_id' | 'createdAt' | 'updatedAt'>): Promise<BloodRequest> => {
    console.warn("addBloodRequest is using mock data or needs full backend implementation");
    // Example: Create a new request object with a temporary ID and timestamps
    const newRequest: BloodRequest = {
      ...request,
      _id: Math.random().toString(36).substring(2), // Temporary ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending' // Ensure status is included if needed by BloodRequest type
    };
    setBloodRequests(prev => [...prev, newRequest]);
    toast.success("Blood request added (mock)");
    return newRequest; // Return the created request
  };

  // Update blood request status
  const updateBloodRequestStatus = async (requestId: string, urgent: boolean /* Adjusted parameters if needed */) => {
    console.warn("updateBloodRequestStatus needs backend implementation");
    // Find the request and update its status/urgency locally
    // TODO: Implement actual API call to PATCH request status/urgency
    setBloodRequests(prevRequests =>
      prevRequests.map(req =>
        req._id === requestId ? { ...req, urgent: urgent, status: 'cancelled' /* Example status update */ } : req
      )
    );
    toast.info(`Request ${requestId} status updated (mock)`);
  };

  // Get donor by ID
  const getDonorById = (donor_id: string): Donor | undefined => {
    return donors.find(donor => donor._id === donor_id);
  };

  // Get hospital by ID
  const getHospitalById = (hospital_id: string): Hospital | null => {
    if (!hospital_id) {
        console.error("Invalid hospital ID provided:", hospital_id, new Error().stack); // Log stack trace
        return null;
    }
    console.log("Getting hospital by id:", hospital_id);
    console.log("Current hospitals state:", hospitals);
    const hospital = hospitals.find(h => h._id === hospital_id);
     if (!hospital) {
        console.warn("No hospital found with id:", hospital_id);
        return null;
    }
    return hospital;
  };

  // Get request by ID
  const getRequestById = (request_id: string): BloodRequest | undefined => {
    return bloodRequests.find(req => req._id === request_id);
  };

  // Get donors by blood type
  const getDonorsByBloodType = (bloodType: string): Donor[] => {
    return donors.filter(donor => donor.bloodType === bloodType);
  };

  // Get requests made by a specific hospital
  const getRequestsByHospital = (hospitalId: string): BloodRequest[] => {
    return bloodRequests.filter(req => req.hospitalId === hospitalId);
  };

  // Get requests accepted/handled by a specific donor (assuming donorId exists on BloodRequest)
  const getRequestsByDonor = (donorId: string): BloodRequest[] => {
    console.warn('getRequestsByDonor assumes donorId exists on BloodRequest type');
    // Adjust filtering based on actual BloodRequest structure if donorId is not present
    return bloodRequests.filter(req => (req as any).donorId === donorId); // Use type assertion if needed
  };

  // Get requests relevant for a donor to potentially accept (adjust logic as needed)
  const getBloodRequestsForDonor = (donorId: string): BloodRequest[] => {
    console.warn('getBloodRequestsForDonor assumes donorId exists on BloodRequest type for filtering');
    // Example: Return pending requests NOT associated with the current donor? Needs clear definition.
    return bloodRequests.filter(req => req.status === 'pending' && (req as any).donorId !== donorId);
  };

  // Get completed requests by a specific donor (assuming donorId exists)
  const getCompletedRequestsByDonorId = (donorId: string): BloodRequest[] => {
    console.warn('getCompletedRequestsByDonorId assumes donorId exists on BloodRequest type');
    return bloodRequests.filter(req => req.status === 'completed' && (req as any).donorId === donorId);
  };

  // Add a new donor
  const addDonor = (donor: Omit<Donor, '_id' | 'createdAt' | 'donations'>) => {
    console.warn("addDonor is using mock data or needs backend implementation");
    const newDonor: Donor = {
      ...donor,
      _id: Math.random().toString(36).substring(2), // Temporary ID
      createdAt: new Date().toISOString(),
      donations: 0
    };
    setDonors(prev => [...prev, newDonor]);
  };

  // Add a new hospital
  const addHospital = (hospital: Omit<Hospital, '_id' | 'createdAt' | 'requestsMade' | 'requestsCompleted'>) => {
    console.warn("addHospital is using mock data or needs backend implementation");
    const newHospital: Hospital = {
      ...hospital,
      _id: Math.random().toString(36).substring(2),
      createdAt: new Date().toISOString(),
      requestsMade: 0,
      requestsCompleted: 0,
      isVerified: false // Default to not verified
    };
    setHospitals(prev => [...prev, newHospital]);
  };

  // Verify hospital
  const verifyHospital = async (hospitalId: string, verified: boolean) => {
    try {
      if (!hospitalId) {
        throw new Error('Hospital ID is required');
      }

      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('User not found');
      }
      const user = JSON.parse(storedUser);

      console.log('Verifying hospital:', { hospitalId, verified, userRole: user.role });

      const response = await fetch(`${API_URL}/admin/verify-hospital/${hospitalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ isVerified: verified })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from verify-hospital:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          hospitalId
        });
        throw new Error(`Failed to update hospital verification status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Hospital verification response:', data);

      // Update local state
      setHospitals(prevHospitals =>
        prevHospitals.map(h =>
          h._id === hospitalId ? { ...h, isVerified: verified } : h
        )
      );

      // Update user verification status if it's the current user's hospital
      if (user.role === 'hospital' && user._id === hospitalId) {
        const updatedUser = {
          ...user,
          isVerified: verified
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      toast.success(data.message);
    } catch (error) {
      console.error('Error in verifyHospital:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update hospital verification status');
    }
  };

  // Get all blood requests (placeholder, might be redundant with useEffect fetch)
  const getBloodRequests = async () => {
    console.warn("getBloodRequests function called, likely redundant with useEffect fetch.");
    // This function might not be needed if useEffect handles fetching.
    // If needed, ensure it fetches data correctly based on role.
  };

  // Create blood request (Placeholder - needs backend integration)
  const createBloodRequest = async (request: BloodRequestPayload): Promise<BloodRequest> => {
    console.warn("createBloodRequest needs full backend implementation using axios/fetch");
    // TODO: Replace mock implementation with actual API call
    // Example of how it might look (needs correct endpoint and payload structure):
    // const token = localStorage.getItem('token');
    // const response = await axios.post(`${API_URL}/hospital/blood-requests`, request, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // const createdRequest = response.data; 
    // setBloodRequests(prev => [...prev, createdRequest]);
    // return createdRequest;

    // Mock Implementation:
    const mockRequest: BloodRequest = {
      ...request,
      _id: Math.random().toString(36).substring(2),
      hospitalId: 'mockHospitalId', // Needs real ID
      hospitalName: 'Mock Hospital', // Needs real name
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBloodRequests(prev => [...prev, mockRequest]);
    toast.success("Blood request created (mock)");
    return mockRequest;
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