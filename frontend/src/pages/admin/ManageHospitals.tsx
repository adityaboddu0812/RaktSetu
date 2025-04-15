import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Filter, MapPin, Phone, Search, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HospitalCard from '@/components/HospitalCard';

const ManageHospitals: React.FC = () => {
  const { hospitals, verifyHospital } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [isHospitalDetailsOpen, setIsHospitalDetailsOpen] = useState(false);
  
  // Filter hospitals based on search and filters
  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch = 
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      selectedStatus === 'all' || 
      (selectedStatus === 'verified' && hospital.isVerified) || 
      (selectedStatus === 'unverified' && !hospital.isVerified);
    
    return matchesSearch && matchesStatus;
  });
  
  const verifiedCount = hospitals.filter(h => h.isVerified).length;
  const unverifiedCount = hospitals.filter(h => !h.isVerified).length;
  
  const handleVerifyHospital = (hospitalId: string, verified: boolean) => {
    verifyHospital(hospitalId, verified);
  };
  
  const handleViewDetails = (hospitalId: string) => {
    setSelectedHospitalId(hospitalId);
    setIsHospitalDetailsOpen(true);
  };
  
  const selectedHospital = selectedHospitalId ? hospitals.find(hospital => hospital.id === selectedHospitalId) : null;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Manage Hospitals</h1>
          <p className="text-gray-600 mb-8">
            View and manage all registered hospitals
          </p>
          
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search by name, location or contact person..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <div className="w-40">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Hospitals</SelectItem>
                      <SelectItem value="verified">Verified Only</SelectItem>
                      <SelectItem value="unverified">Unverified Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          {filteredHospitals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHospitals.map((hospital) => (
                <HospitalCard
                  key={hospital.id}
                  id={hospital.id}
                  name={hospital.name}
                  location={hospital.location}
                  city={hospital.city}
                  contactPerson={hospital.contactPerson}
                  contactNumber={hospital.contactNumber}
                  phone={hospital.phone}
                  isVerified={hospital.isVerified}
                  onVerify={() => handleVerifyHospital(hospital.id, true)}
                  onUnverify={() => handleVerifyHospital(hospital.id, false)}
                  onView={() => handleViewDetails(hospital.id)}
                  isAdminView={true}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Hospitals Found</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                No hospitals match your search criteria. Try adjusting your filters.
              </p>
            </div>
          )}
          
          {/* Hospital Details Dialog */}
          <Dialog open={isHospitalDetailsOpen} onOpenChange={setIsHospitalDetailsOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Hospital Details</DialogTitle>
                <DialogDescription>
                  Complete information about this hospital
                </DialogDescription>
              </DialogHeader>
              
              {selectedHospital && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Hospital Name</h3>
                    <p className="font-medium">{selectedHospital.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p>{selectedHospital.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <p className={selectedHospital.isVerified ? 'text-green-600' : 'text-yellow-600'}>
                        {selectedHospital.isVerified ? 'Verified' : 'Pending Verification'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Location</h3>
                      <p>{selectedHospital.location}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <User className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
                        <p>{selectedHospital.contactPerson}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                        <p>{selectedHospital.contactNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <DialogFooter className="flex sm:justify-between">
                <Button variant="outline" onClick={() => setIsHospitalDetailsOpen(false)}>
                  Close
                </Button>
                
                {selectedHospital && (
                  <Button 
                    variant={selectedHospital.isVerified ? "destructive" : "default"}
                    onClick={() => {
                      if (selectedHospitalId) {
                        handleVerifyHospital(selectedHospitalId, !selectedHospital.isVerified);
                        setIsHospitalDetailsOpen(false);
                      }
                    }}
                  >
                    {selectedHospital.isVerified ? 'Unverify Hospital' : 'Verify Hospital'}
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

export default ManageHospitals;
