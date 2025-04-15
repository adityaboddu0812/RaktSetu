
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DonorFilters from '@/components/admin/DonorFilters';
import DonorList from '@/components/admin/DonorList';
import DonorDetailsDialog from '@/components/admin/DonorDetailsDialog';

const ManageDonors: React.FC = () => {
  const { donors } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [isDonorDetailsOpen, setIsDonorDetailsOpen] = useState(false);
  
  // Filter donors based on search and filters
  const filteredDonors = donors.filter((donor) => {
    const matchesSearch = 
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBloodType = 
      selectedBloodType === 'all' || 
      donor.bloodType === selectedBloodType;
    
    const matchesAvailability = 
      selectedAvailability === 'all' || 
      (selectedAvailability === 'available' && donor.available === true) || 
      (selectedAvailability === 'unavailable' && donor.available === false);
    
    return matchesSearch && matchesBloodType && matchesAvailability;
  });
  
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
          <h1 className="text-3xl font-bold mb-2">Manage Donors</h1>
          <p className="text-gray-600 mb-8">
            View and manage all registered blood donors
          </p>
          
          <DonorFilters 
            searchTerm={searchTerm}
            selectedBloodType={selectedBloodType}
            selectedAvailability={selectedAvailability}
            onSearchChange={setSearchTerm}
            onBloodTypeChange={setSelectedBloodType}
            onAvailabilityChange={setSelectedAvailability}
          />
          
          <DonorList 
            donors={filteredDonors} 
            onViewDetails={handleViewDetails} 
          />
          
          <DonorDetailsDialog
            open={isDonorDetailsOpen}
            onOpenChange={setIsDonorDetailsOpen}
            donor={selectedDonor}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ManageDonors;
