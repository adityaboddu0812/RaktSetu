import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hospital, UserCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatCard from '@/components/StatCard';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { donors, hospitals } = useData();
  
  // Calculate statistics
  const totalDonors = donors.length;
  const totalHospitals = hospitals.length;
  const pendingVerification = hospitals.filter(hospital => !hospital.isVerified).length;
  const verifiedHospitals = hospitals.filter(hospital => hospital.isVerified).length;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-8 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatCard
              title="Total Donors"
              value={totalDonors}
              icon={<UserCheck className="h-5 w-5 text-blood-600" />}
              description="Registered donors"
            />
            
            <StatCard
              title="Total Hospitals"
              value={totalHospitals}
              icon={<Hospital className="h-5 w-5 text-blood-600" />}
              description={`${verifiedHospitals} verified, ${pendingVerification} pending`}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-3">
              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <CardTitle>Hospitals Pending Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingVerification > 0 ? (
                    <div className="space-y-3">
                      {hospitals
                        .filter(h => !h.isVerified)
                        .slice(0, 3)
                        .map((hospital) => (
                          <div 
                            key={hospital.id} 
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <p className="font-medium">{hospital.name}</p>
                              <p className="text-xs text-gray-500">{hospital.city}</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/admin/hospitals`}>
                                Verify
                              </Link>
                            </Button>
                          </div>
                        ))}
                      
                      {pendingVerification > 3 && (
                        <Button variant="link" className="w-full" asChild>
                          <Link to="/admin/hospitals">
                            View all {pendingVerification} pending hospitals
                          </Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hospitals pending verification</p>
                  )}
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

export default AdminDashboard;
