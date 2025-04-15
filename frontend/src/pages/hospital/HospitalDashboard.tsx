import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
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

const HospitalDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    getHospitalById, 
    getRequestsByHospital,
    updateBloodRequestStatus,
    getRequestById,
    hospitals,
    bloodRequests
  } = useData();
  
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false);
  
  const hospital = getHospitalById(user?.id || '');
  const allRequests = getRequestsByHospital(user?.id || '');
  const hospitalRequests = bloodRequests.filter(request => request.hospitalId === user?.id);
  
  const pendingRequests = allRequests.filter(req => req.status === 'pending');
  const acceptedRequests = allRequests.filter(req => req.status === 'accepted');
  const completedRequests = allRequests.filter(req => req.status === 'completed');
  const cancelledRequests = allRequests.filter(req => req.status === 'cancelled');
  
  const handleCancelRequest = (requestId: string) => {
    updateBloodRequestStatus(requestId, 'cancelled');
  };
  
  const handleViewDetails = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsRequestDetailsOpen(true);
  };
  
  const selectedRequest = selectedRequestId ? getRequestById(selectedRequestId) : null;
  
  // Loading state while waiting for hospital data
  if (!user || !hospital) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-12">
          <div className="container mx-auto">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blood-600"></div>
              <span className="ml-3">Loading hospital data...</span>
            </div>
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
            {/* Hospital Profile */}
            <div className="lg:col-span-1">
              <HospitalProfile hospital={hospital} />
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {!hospital.isVerified ? (
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
                      {hospitalRequests.length === 0 ? (
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
                          {hospitalRequests.map(request => (
                            <BloodRequestCard 
                              key={request.id}
                              id={request.id}
                              hospitalName={request.hospitalName}
                              bloodType={request.bloodType}
                              urgent={request.urgent}
                              status={request.status}
                              location={request.location}
                              createdAt={request.createdAt}
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
