
import React from 'react';
import { addMonths, isAfter } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Phone, User } from 'lucide-react';
import { Donor } from '@/types/bloodTypes';

interface DonorDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donor: Donor | null;
}

const DonorDetailsDialog: React.FC<DonorDetailsDialogProps> = ({
  open,
  onOpenChange,
  donor
}) => {
  // Calculate next eligible donation date
  const calculateNextEligibleDate = (lastDonation?: string) => {
    if (!lastDonation) return null;
    
    const lastDonationDate = new Date(lastDonation);
    return addMonths(lastDonationDate, 3);
  };

  if (!donor) {
    return null;
  }

  const nextEligibleDate = donor.lastDonation ? calculateNextEligibleDate(donor.lastDonation) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Donor Details</DialogTitle>
          <DialogDescription>
            Complete information about this donor
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
              <p className="font-medium">{donor.name}</p>
            </div>
            
            <div className="w-12 h-12 rounded-full bg-blood-100 flex items-center justify-center">
              <span className="text-blood-800 font-bold">{donor.bloodType}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p>{donor.email}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className={donor.available ? 'text-green-600' : 'text-red-600'}>
                {donor.available ? 'Available' : 'Not Available'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start">
              <User className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Age & Gender</h3>
                <p>{donor.age} years, {donor.gender}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p>{donor.location}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start">
              <Phone className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                <p>{donor.contactNumber || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Donation</h3>
                <p>
                  {donor.lastDonation
                    ? new Date(donor.lastDonation).toLocaleDateString() 
                    : 'Never donated'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Donations</h3>
              <p className="font-semibold">{donor.donations || 0}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Next Eligible Date</h3>
              <p>
                {nextEligibleDate
                  ? nextEligibleDate.toLocaleDateString()
                  : 'Eligible now'}
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DonorDetailsDialog;
