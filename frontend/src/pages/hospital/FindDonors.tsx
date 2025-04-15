import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Calendar, Filter, MapPin, Phone, Search, UserCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DonorCard from '@/components/DonorCard';
import { format } from 'date-fns';
import { BLOOD_TYPES } from '@/types/bloodTypes';
import VerificationNotice from '@/components/hospital/VerificationNotice';
import { toast } from 'sonner';

interface RequestDetails {
  unitsRequired: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
}

const FindDonors: React.FC = () => {
  const { user } = useAuth();
  const { donors, getHospitalById, createBloodRequest } = useData();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState<string>('all');
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [isDonorDetailsOpen, setIsDonorDetailsOpen] = useState(false);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [requestDetails, setRequestDetails] = useState<RequestDetails>({
    unitsRequired: 1,
    urgency: 'medium',
    notes: ''
  });
  
  console.log('Current user in FindDonors:', user);
  
  // Get hospital data
  const hospital = user?.role === 'hospital' && user?.id 
    ? getHospitalById(user.id) 
    : null;
  
  console.log('Found hospital:', hospital);
  
  useEffect(() => {
    // Set loading to false once we have the hospital data
    if (hospital !== undefined) {
      setIsLoading(false);
    }
  }, [hospital]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8 px-4 bg-gray-50">
          <div className="container mx-auto">
            <div className="text-center">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blood-200 border-t-blood-500 rounded-full mb-4"></div>
              <p className="text-gray-600">Loading hospital information...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // If not a hospital user or no hospital found, show error
  if (!user || user.role !== 'hospital' || !user.id || !hospital) {
    console.log('Access denied - not a hospital user:', { 
      user, 
      hospital,
      hasId: Boolean(user?.id),
      role: user?.role 
    });
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8 px-4 bg-gray-50">
          <div className="container mx-auto">
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h2 className="text-red-800 text-lg font-semibold mb-2">Access Denied</h2>
              <p className="text-red-600">
                {!user 
                  ? 'Please log in to access this feature.'
                  : !user.id
                  ? 'Invalid user data. Please try logging in again.'
                  : user.role !== 'hospital'
                  ? 'Only registered hospitals can access this feature.'
                  : 'Hospital information not found. Please try logging in again.'}
              </p>
              <p className="text-red-500 mt-2 text-sm">
                Debug info: User ID: {user?.id || 'none'}, Role: {user?.role || 'none'}
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // If hospital is not verified, show verification notice
  const isVerified = Boolean(hospital.isVerified);
  console.log('Hospital verification status:', { isVerified, rawValue: hospital.isVerified });
  
  if (!isVerified) {
    console.log('Access denied - hospital not verified');
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow py-8 px-4 bg-gray-50">
          <div className="container mx-auto">
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded p-4">
              <h2 className="text-yellow-800 text-lg font-semibold mb-2">Hospital Status</h2>
              <p className="text-yellow-700">
                Your hospital account is currently {hospital.isVerified ? 'verified' : 'not verified'}.
                Raw verification value: {String(hospital.isVerified)}
              </p>
            </div>
            <VerificationNotice isVerified={false} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Filter donors based on search and filters
  const filteredDonors = donors.filter((donor) => {
    const matchesSearch = 
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.bloodType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBloodType = 
      selectedBloodType === 'all' || 
      donor.bloodType === selectedBloodType;
    
    return matchesSearch && matchesBloodType;
  });
  
  const handleCreateRequest = async () => {
    if (!selectedDonorId) return;

    const donor = donors.find(d => d.id === selectedDonorId);
    if (!donor) return;

    setIsCreatingRequest(true);
    try {
      await createBloodRequest({
        donorId: selectedDonorId,
        bloodType: donor.bloodType,
        unitsRequired: requestDetails.unitsRequired,
        urgency: requestDetails.urgency,
        notes: requestDetails.notes
      });
      
      toast.success('Blood request created successfully');
      setIsDonorDetailsOpen(false);
    } catch (error) {
      console.error('Error creating blood request:', error);
      toast.error('Failed to create blood request');
    } finally {
      setIsCreatingRequest(false);
    }
  };
  
  const handleViewDetails = (donorId: string) => {
    setSelectedDonorId(donorId);
    setIsDonorDetailsOpen(true);
  };
  
  const selectedDonor = selectedDonorId ? donors.find(donor => donor.id === selectedDonorId) : null;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Find Blood Donors</h1>
          <p className="text-gray-600 mb-8">
            Search for blood donors based on blood type and location
          </p>
          
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search by name, location or blood type..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <div className="w-40">
                  <Select value={selectedBloodType} onValueChange={setSelectedBloodType}>
                    <SelectTrigger>
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Blood Type" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {BLOOD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Blood Type Distribution</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {BLOOD_TYPES.map((type) => {
                const count = donors.filter(d => d.bloodType === type).length;
                return (
                  <Card 
                    key={type} 
                    className={`cursor-pointer hover:border-blood-300 ${selectedBloodType === type ? 'border-blood-500 bg-blood-50' : ''}`}
                    onClick={() => setSelectedBloodType(type === selectedBloodType ? 'all' : type)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-blood-100 border border-blood-200 flex items-center justify-center mx-auto mb-2">
                        <span className="text-blood-800 font-semibold">{type}</span>
                      </div>
                      <p className="font-medium">{count}</p>
                      <p className="text-xs text-gray-500">Donors</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          
          {filteredDonors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonors.map((donor) => (
                <DonorCard
                  key={donor.id}
                  id={donor.id}
                  name={donor.name}
                  bloodType={donor.bloodType}
                  age={donor.age}
                  gender={donor.gender}
                  location={donor.location}
                  lastDonation={donor.lastDonation}
                  donations={donor.donations}
                  onContact={() => handleViewDetails(donor.id)}
                  onView={() => handleViewDetails(donor.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Donors Found</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                No donors match your search criteria. Try adjusting your filters or check back later for new donors.
              </p>
            </div>
          )}
          
          {/* Donor Details Dialog */}
          <Dialog open={isDonorDetailsOpen} onOpenChange={setIsDonorDetailsOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Donor Details</DialogTitle>
                <DialogDescription>
                  Create a blood request to connect with this donor
                </DialogDescription>
              </DialogHeader>
              
              {selectedDonor && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-blood-100 border border-blood-200 flex items-center justify-center">
                      <span className="text-blood-800 text-xl font-bold">{selectedDonor.bloodType}</span>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg">{selectedDonor.name}</h3>
                      <p className="text-gray-500">
                        {selectedDonor.age}, {selectedDonor.gender}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                        <p>{selectedDonor.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <UserCheck className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <p className={selectedDonor.available ? "text-green-600" : "text-yellow-600"}>
                          {selectedDonor.available ? 'Available for donation' : 'Currently unavailable'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Last Donation</h3>
                        <p>
                          {selectedDonor.lastDonation 
                            ? format(new Date(selectedDonor.lastDonation), 'MMM d, yyyy')
                            : 'Never donated'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Total Donations</h3>
                      <p>{selectedDonor.donations}</p>
                    </div>
                  </div>
                  
                  {selectedDonor.available ? (
                    <div className="mt-2 bg-green-50 border border-green-200 rounded p-3 text-sm">
                      <p className="text-green-800">
                        This donor is available for blood donation. Create a request to initiate the donation process.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                      <p className="text-yellow-800">
                        This donor is currently unavailable for donation. Please check back later.
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <p className="text-gray-600">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Contact information will be shared once the donor accepts your request.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Units Required</label>
                      <Input
                        type="number"
                        min="1"
                        value={requestDetails.unitsRequired}
                        onChange={(e) => setRequestDetails(prev => ({
                          ...prev,
                          unitsRequired: parseInt(e.target.value) || 1
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Urgency Level</label>
                      <Select
                        value={requestDetails.urgency}
                        onValueChange={(value) => setRequestDetails(prev => ({
                          ...prev,
                          urgency: value as 'low' | 'medium' | 'high' | 'critical'
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Notes (Optional)</label>
                      <Input
                        value={requestDetails.notes}
                        onChange={(e) => setRequestDetails(prev => ({
                          ...prev,
                          notes: e.target.value
                        }))}
                        placeholder="Add any additional information..."
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <DialogFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDonorDetailsOpen(false)}
                >
                  Close
                </Button>
                {selectedDonor?.available && (
                  <Button
                    onClick={handleCreateRequest}
                    disabled={isCreatingRequest}
                  >
                    {isCreatingRequest ? (
                      <>
                        <span className="animate-spin mr-2">⌛</span>
                        Creating Request...
                      </>
                    ) : (
                      'Create Blood Request'
                    )}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FindDonors;
