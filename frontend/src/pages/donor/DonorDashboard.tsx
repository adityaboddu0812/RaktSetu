
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Droplets, Calendar } from 'lucide-react';
import { format, parseISO, addMonths, isAfter } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DonorEligibility from '@/components/DonorEligibility';

const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getDonorById, getCompletedRequestsByDonorId } = useData();
  
  // Create a default donor if one doesn't exist yet
  const donor = getDonorById(user?.id || '') || {
    id: user?.id || 'default',
    name: user?.name || 'New Donor',
    email: user?.email || '',
    bloodType: user?.bloodType || 'O+',
    age: 25,
    gender: 'Not specified',
    location: user?.location || 'Not specified',
    contactNumber: '',
    donations: 0,
    createdAt: new Date().toISOString()
  };
  
  const completedRequests = getCompletedRequestsByDonorId(user?.id || '');
  
  const lastDonationDate = donor.lastDonation ? format(new Date(donor.lastDonation), 'PPP') : 'Never donated';
  const nextEligibleDate = donor.lastDonation 
    ? format(addMonths(new Date(donor.lastDonation), 3), 'PPP')
    : 'Eligible now';
  const isEligible = donor.lastDonation 
    ? !isAfter(addMonths(new Date(donor.lastDonation), 3), new Date())
    : true;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Donor Dashboard</h1>
          <p className="text-gray-600 mb-8">Welcome, {donor.name}</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Name</h3>
                        <p className="font-medium">{donor.name}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Age</h3>
                        <p>{donor.age} years</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                        <p>{donor.gender}</p>
                      </div>
                      
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Location</h3>
                          <p>{donor.location}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Droplets className="h-5 w-5 mr-2 text-blood-600" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Blood Type</h3>
                          <div className="flex items-center">
                            <Badge className="bg-blood-100 text-blood-800 hover:bg-blood-200">
                              {donor.bloodType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Phone className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                          <p>{donor.contactNumber}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Last Donation</h3>
                          <p>{lastDonationDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Next Eligible Date</h3>
                          <p className={isEligible ? "text-green-600" : "text-red-600"}>{nextEligibleDate}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Total Donations</h3>
                        <p>{donor.donations}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Donations</CardTitle>
                </CardHeader>
                <CardContent>
                  {completedRequests.length > 0 ? (
                    <div className="space-y-4">
                      {completedRequests.slice(0, 3).map((request) => (
                        <div key={request.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="font-medium">{request.hospitalName}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{request.location}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Completed
                              </Badge>
                              <Badge variant="outline" className="ml-2 bg-blood-50 text-blood-700 border-blood-200">
                                {request.bloodType}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>{format(parseISO(request.createdAt), "MMM d, yyyy")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No donation history yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <DonorEligibility lastDonation={donor.lastDonation} />
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Donation Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 border-l-4 border-green-500 p-3">
                    <h3 className="font-medium text-green-800">Before Donation</h3>
                    <ul className="mt-2 space-y-1 text-sm text-green-700">
                      <li>Get a good night's sleep</li>
                      <li>Drink plenty of water</li>
                      <li>Eat a healthy meal</li>
                      <li>Avoid fatty foods</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
                    <h3 className="font-medium text-blue-800">After Donation</h3>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700">
                      <li>Rest for at least 15 minutes</li>
                      <li>Drink extra fluids</li>
                      <li>Avoid strenuous activities for 24 hours</li>
                      <li>Keep the bandage on for a few hours</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DonorDashboard;
