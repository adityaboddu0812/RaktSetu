import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Filter, Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HospitalCard from '@/components/HospitalCard';
import { HospitalDetailsDialog } from '@/components/admin/HospitalDetailsDialog';

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
      `${hospital.city}, ${hospital.state}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      selectedStatus === 'all' || 
      (selectedStatus === 'verified' && hospital.isVerified) || 
      (selectedStatus === 'unverified' && !hospital.isVerified);
    
    return matchesSearch && matchesStatus;
  });
  
  const handleVerifyHospital = (hospitalId: string, verified: boolean) => {
    verifyHospital(hospitalId, verified);
  };
  
  const handleViewDetails = (hospitalId: string) => {
    setSelectedHospitalId(hospitalId);
    setIsHospitalDetailsOpen(true);
  };
  
  const selectedHospital = selectedHospitalId ? hospitals.find(hospital => hospital._id === selectedHospitalId) : null;
  
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
                  key={hospital._id}
                  id={hospital._id}
                  name={hospital.name}
                  city={hospital.city}
                  state={hospital.state}
                  contactPerson={hospital.contactPerson}
                  phone={hospital.phone}
                  isVerified={hospital.isVerified}
                  onVerify={() => handleVerifyHospital(hospital._id, true)}
                  onUnverify={() => handleVerifyHospital(hospital._id, false)}
                  onView={() => handleViewDetails(hospital._id)}
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
          
          <HospitalDetailsDialog
            open={isHospitalDetailsOpen}
            onClose={() => setIsHospitalDetailsOpen(false)}
            hospital={selectedHospital}
            onUnverify={
              selectedHospital?.isVerified 
                ? () => {
                    if (selectedHospitalId) {
                      handleVerifyHospital(selectedHospitalId, false);
                      setIsHospitalDetailsOpen(false);
                    }
                  }
                : undefined
            }
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ManageHospitals;
