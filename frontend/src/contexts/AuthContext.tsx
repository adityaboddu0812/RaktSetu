import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "sonner";
import { Hospital, Donor } from '../types/bloodTypes';

type UserRole = 'donor' | 'hospital' | 'admin' | null;

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  isVerified: boolean;
  licenseNumber?: string;
  phone?: string;
  city?: string;
  state?: string;
  location?: string;
  contactPerson?: string;
  requestsMade?: number;
  requestsCompleted?: number;
  bloodType?: string;
  age?: number;
  gender?: string;
  lastDonation?: string;
  donations?: number;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (userData: any, role: UserRole) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        if (!parsedUser._id || !parsedUser.role) {
          console.error('Invalid user data in localStorage - missing _id or role');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
          toast.error('Your session has expired. Please log in again.');
        } else {
          console.log('Restored user from localStorage:', parsedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        toast.error('Your session has expired. Please log in again.');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/auth/login/${role}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login response data:', data);

      let loggedInUser: User | null = null;

      if (role === 'admin' && data.admin) {
        const adminData = data.admin;
        loggedInUser = {
          _id: adminData.id || adminData._id || 'admin',
          name: adminData.name || 'Admin',
          email: adminData.email,
          role: 'admin',
          token: data.token,
          isVerified: true
        };
      } else if (role === 'hospital' && data.hospital) {
        const hospitalData = data.hospital;
        if (!hospitalData.isVerified) {
          toast.warning('Login successful! Your hospital is pending admin verification.');
        }
        loggedInUser = {
          _id: hospitalData.id || hospitalData._id,
          name: hospitalData.name,
          email: hospitalData.email,
          role: 'hospital',
          token: data.token,
          isVerified: hospitalData.isVerified,
          licenseNumber: hospitalData.licenseNumber,
          phone: hospitalData.phone,
          city: hospitalData.city,
          state: hospitalData.state,
          location: hospitalData.city,
          contactPerson: hospitalData.contactPerson || 'N/A',
          requestsMade: hospitalData.requestsMade || 0,
          requestsCompleted: hospitalData.requestsCompleted || 0,
          createdAt: hospitalData.createdAt
        };
        
        console.log('Hospital data after mapping:', loggedInUser);
      } else if (role === 'donor' && data.donor) {
        const donorData = data.donor;
        loggedInUser = {
          _id: donorData.id || donorData._id,
          name: donorData.name,
          email: donorData.email,
          role: 'donor',
          token: data.token,
          isVerified: true,
          bloodType: donorData.bloodType || donorData.bloodGroup,
          age: donorData.age,
          gender: donorData.gender,
          location: donorData.location || donorData.city,
          phone: donorData.contactNumber || donorData.phone,
          lastDonation: donorData.lastDonation,
          donations: donorData.donations,
          createdAt: donorData.createdAt
        };
      } else {
        console.error('Login response missing expected data for role:', role, data);
        throw new Error('Login failed: Invalid data received from server.');
      }

      console.log('Constructed user object:', loggedInUser);

      if (!loggedInUser._id) {
        console.error('User object missing _id:', loggedInUser);
        throw new Error('Failed to create valid user object (missing ID)');
      }

      setUser(loggedInUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      localStorage.setItem('token', data.token);
      
      toast.success('Login successful!');

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any, role: UserRole): Promise<User> => {
    try {
      const response = await fetch(`http://localhost:5001/api/auth/register/${role}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      let user: User;

      if (role === 'admin') {
        user = {
          _id: data.admin._id,
          name: data.admin.name,
          email: data.admin.email,
          role: role,
          token: data.token,
          isVerified: true
        };
      } else if (role === 'hospital') {
        user = {
          _id: data.hospital._id,
          name: data.hospital.name,
          email: data.hospital.email,
          role: role,
          token: data.token,
          isVerified: data.hospital.isVerified
        };
      } else {
        user = {
          _id: data.donor._id,
          name: data.donor.name,
          email: data.donor.email,
          role: role,
          token: data.token,
          bloodType: data.donor.bloodGroup,
          location: data.donor.address,
          isVerified: true
        };
      }

      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', data.token);
      
      toast.success('Registration successful!');
      return user;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log("Logging out...");
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
