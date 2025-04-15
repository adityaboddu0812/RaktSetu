
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock } from 'lucide-react';
import { format, addMonths, isAfter } from 'date-fns';

interface DonorEligibilityProps {
  lastDonation?: string;  // ISO date string or undefined
}

const DonorEligibility: React.FC<DonorEligibilityProps> = ({ lastDonation }) => {
  const lastDonationDate = lastDonation ? new Date(lastDonation) : null;
  const nextEligibleDate = lastDonationDate ? addMonths(lastDonationDate, 3) : null;
  const isEligible = nextEligibleDate ? !isAfter(nextEligibleDate, new Date()) : true;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Donation Eligibility</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Last Donation</TableHead>
              <TableHead className="w-1/2">Next Eligible Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="py-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blood-600" />
                  <span className="font-medium">
                    {lastDonationDate 
                      ? format(lastDonationDate, 'MMM d, yyyy')
                      : 'No previous donations'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blood-600" />
                  <span className={`font-medium ${isEligible ? 'text-green-600' : 'text-red-600'}`}>
                    {nextEligibleDate
                      ? format(nextEligibleDate, 'MMM d, yyyy')
                      : 'Eligible Now'}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        
        <div className="mt-4 bg-gray-50 p-3 rounded-md text-sm">
          <p className="font-medium mb-1">Donation Guidelines:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>You must wait at least 3 months between whole blood donations</li>
            <li>You must be feeling well and healthy on the day of donation</li>
            <li>Maintain adequate iron levels and hydration before donating</li>
            <li>Bring a valid ID to the donation center</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonorEligibility;
