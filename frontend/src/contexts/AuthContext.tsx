import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "sonner";

type UserRole = 'donor' | 'hospital' | 'admin' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  bloodType?: string;
  location?: string;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  isVerified: boolean;
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
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Validate that the user has required fields
        if (!parsedUser.id || !parsedUser.role) {
          console.error('Invalid user data in localStorage - missing id or role');
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

  // Mock login function (would connect to backend API in production)
  const login = async (email: string, password: string, role: UserRole) => {
    try {
      const response = await fetch(`http://localhost:5001/api/auth/login/${role}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      let user;

      if (role === 'admin') {
        user = {
          id: 'admin',
          name: 'Admin',
          email: data.admin.email,
          role: role,
          token: data.token,
          isVerified: true
        };
      } else {
        // Check if hospital is verified
        if (role === 'hospital' && !data.hospital.isVerified) {
          throw new Error('Your account is pending verification by admin. Please wait for approval.');
        }

        // Get the correct entity data based on role
        const entityData = data[role];
        
        // Debug log the response data
        console.log('Login response data:', data);
        console.log('Entity data for role', role, ':', entityData);
        
        if (!entityData || (!entityData._id && !entityData.id)) {
          console.error('Invalid response data structure:', data);
          throw new Error('Invalid response data from server');
        }

        user = {
          id: entityData._id || entityData.id,
          name: entityData.name || '',
          email: entityData.email || '',
          role: role,
          token: data.token,
          bloodType: entityData.bloodGroup,
          location: entityData.city || entityData.address || '',
          lastDonationDate: entityData.lastDonation,
          isVerified: entityData.isVerified ?? false
        };

        // Debug log the constructed user object
        console.log('Constructed user object:', user);
      }

      // Validate user object before storing
      if (!user.id) {
        console.error('User object missing ID:', user);
        throw new Error('Failed to create valid user object');
      }

      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Show appropriate success message based on role and verification status
      if (role === 'hospital') {
        if (data.hospital.isVerified) {
          toast.success('Login successful! Your hospital is verified and you have access to all features.');
        } else {
          toast.warning('Login successful! Your hospital is pending admin verification.');
        }
      } else {
        toast.success('Login successful!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
      throw error;
    }
  };

  // Mock register function
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
      let user;

      if (role === 'admin') {
        user = {
          id: data.admin._id,
          name: data.admin.name,
          email: data.admin.email,
          role: role,
          token: data.token,
          isVerified: true
        };
      } else if (role === 'hospital') {
        user = {
          id: data.hospital._id,
          name: data.hospital.name,
          email: data.hospital.email,
          role: role,
          token: data.token,
          isVerified: data.hospital.isVerified
        };
      } else {
        user = {
          id: data.donor._id,
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
      
      toast.success('Registration successful!');
      return user;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
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
