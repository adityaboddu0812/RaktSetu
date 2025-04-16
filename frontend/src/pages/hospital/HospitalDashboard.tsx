import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HospitalProfile from '@/components/hospital/HospitalProfile';
import RequestDetailsDialog from '@/components/hospital/RequestDetailsDialog';
import VerificationNotice from '@/components/hospital/VerificationNotice';
import BloodRequestTabs from '@/components/hospital/BloodRequestTabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import BloodRequestCard from '@/components/BloodRequestCard';
import { toast } from 'sonner';
import axios from 'axios';
import { BloodRequest, Hospital } from '@/types/bloodTypes';

const HospitalDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user || !user.token) {
        console.log('Dashboard useEffect: Waiting for user or token.');
        setLoading(false);
        return;
      }

      setLoading(true);
      const token = user.token;

      try {
        console.log(`Fetching blood requests with token: Bearer ${token.substring(0, 10)}...`);
        const response = await axios.get<BloodRequest[]>('http://localhost:5001/api/hospital/blood-requests', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Blood requests response:', response.data);
        setBloodRequests(response.data);
      } catch (error: any) {
        console.error('Error fetching blood requests:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired or invalid (API fetch). Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (logout) logout();
          navigate('/login');
        } else {
          toast.error(error.response?.data?.message || 'Failed to fetch blood requests');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        fetchInitialData(); 
    }

  }, [user, navigate, logout]);

  const handleCancelRequest = async (requestId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to continue.');
      navigate('/login');
      return;
    }

    try {
      await axios.patch(`http://localhost:5001/api/hospital/blood-requests/${requestId}`, 
        { status: 'cancelled' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setBloodRequests(prev => prev.map(req => 
        req._id === requestId ? { ...req, status: 'cancelled' } : req
      ));
      toast.success('Request action attempted.');
    } catch (error: any) {
      console.error('Error updating request:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (logout) logout();
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update request');
      }
    }
  };
  
  const handleViewDetails = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsRequestDetailsOpen(true);
  };
  
  const selectedRequest = selectedRequestId ? 
    bloodRequests.find(req => req._id === selectedRequestId) : null;
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-12">
          <div className="container mx-auto">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blood-600"></div>
              <span className="ml-3">Loading dashboard...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
     console.log("User data not available after load. Ensure login state is correct.")
     return (
       <div className="flex flex-col min-h-screen">
         <Header />
         <main className="flex-grow py-12">
           <div className="container mx-auto text-center">
             Authenticating or redirecting...
           </div>
         </main>
         <Footer />
       </div>
     ); 
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-12 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <HospitalProfile hospital={user} />
            </div>
            
            <div className="lg:col-span-2 space-y-8">
              {!user.isVerified ? (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-yellow-800">Registration Pending Verification</h3>
                        <p className="text-yellow-700 mt-1">
                          Your hospital registration is currently pending admin verification. 
                          You will not be able to access any features until your account is verified.
                          This usually takes 1-2 business days.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Blood Requests</CardTitle>
                          <CardDescription>
                            Manage your blood donation requests
                          </CardDescription>
                        </div>
                        <Button asChild>
                          <Link to="/hospital/requests/new">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            New Request
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {bloodRequests.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No blood requests found</p>
                          <Button variant="outline" className="mt-4" asChild>
                            <Link to="/hospital/requests/new">
                              Create your first request
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {bloodRequests.map(request => (
                            <BloodRequestCard 
                              key={request._id}
                              id={request._id}
                              hospitalName={request.hospitalName}
                              bloodType={request.bloodType}
                              urgent={request.urgent}
                              status={request.status || 'pending'}
                              location={user.location}
                              createdAt={request.createdAt}
                              onCancel={() => handleCancelRequest(request._id)}
                              onView={() => handleViewDetails(request._id)}
                              showActionButtons={true}
                              isDonorView={false}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HospitalDashboard;
