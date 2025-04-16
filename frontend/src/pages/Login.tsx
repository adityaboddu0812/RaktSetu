import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPassword, setDonorPassword] = useState('');
  const [hospitalEmail, setHospitalEmail] = useState('');
  const [hospitalPassword, setHospitalPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('donor');
  
  const handleDonorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await login(donorEmail, donorPassword, 'donor');
      navigate('/donor/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to connect to the server. Please make sure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleHospitalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await login(hospitalEmail, hospitalPassword, 'hospital');
      navigate('/hospital/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to connect to the server. Please make sure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await login(adminEmail, adminPassword, 'admin');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error instanceof Error ? error.message : 'Unable to connect to the server. Please make sure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Welcome to RaktSetu</h1>
            <p className="text-gray-600 mt-2">Log in to your account</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Choose your role and enter your credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="donor">Donor</TabsTrigger>
                  <TabsTrigger value="hospital">Hospital</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
                
                <TabsContent value="donor">
                  <form onSubmit={handleDonorLogin}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="donor-email">Email</Label>
                        <Input
                          id="donor-email"
                          type="email"
                          placeholder="donor@example.com"
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="donor-password">Password</Label>
                        <Input
                          id="donor-password"
                          type="password"
                          value={donorPassword}
                          onChange={(e) => setDonorPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Login as Donor'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="hospital">
                  <form onSubmit={handleHospitalLogin}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="hospital-email">Email</Label>
                        <Input
                          id="hospital-email"
                          type="email"
                          placeholder="hospital@example.com"
                          value={hospitalEmail}
                          onChange={(e) => setHospitalEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="hospital-password">Password</Label>
                        <Input
                          id="hospital-password"
                          type="password"
                          value={hospitalPassword}
                          onChange={(e) => setHospitalPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Login as Hospital'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="admin">
                  <form onSubmit={handleAdminLogin}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-email">Email</Label>
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="admin@example.com"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="admin-password">Password</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Login as Admin'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <p className="text-sm text-center text-gray-600 mt-4">
                Don't have an account?{' '}
                <Link to={`/register?role=${activeTab}`} className="text-blood-600 hover:underline">
                  Register
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
