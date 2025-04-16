import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from "sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Register: React.FC = () => {
  const { register } = useAuth();
  const { addDonor, addHospital } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse role from URL query params
  const queryParams = new URLSearchParams(location.search);
  const roleParam = queryParams.get('role');
  
  const [activeTab, setActiveTab] = useState<string>(roleParam || 'donor');
  const [isLoading, setIsLoading] = useState(false);
  
  // Donor form state
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPassword, setDonorPassword] = useState('');
  const [donorBloodType, setDonorBloodType] = useState('');
  const [donorAge, setDonorAge] = useState('');
  const [donorGender, setDonorGender] = useState('');
  const [donorLocation, setDonorLocation] = useState('');
  const [donorState, setDonorState] = useState('');
  const [donorContactNumber, setDonorContactNumber] = useState('');
  const [donorAvailable, setDonorAvailable] = useState(true);
  
  // Hospital form state
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalEmail, setHospitalEmail] = useState('');
  const [hospitalPassword, setHospitalPassword] = useState('');
  const [hospitalLocation, setHospitalLocation] = useState('');
  const [hospitalState, setHospitalState] = useState('');
  const [hospitalContactPerson, setHospitalContactPerson] = useState('');
  const [hospitalContactNumber, setHospitalContactNumber] = useState('');
  const [hospitalLicenseNumber, setHospitalLicenseNumber] = useState('');
  
  // Update URL when tab changes
  useEffect(() => {
    const newUrl = `/register?role=${activeTab}`;
    window.history.replaceState(null, '', newUrl);
  }, [activeTab]);
  
  const handleDonorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Create donor data object
      const donorData = {
        name: donorName,
        email: donorEmail,
        password: donorPassword,
        bloodType: donorBloodType,
        age: parseInt(donorAge),
        gender: donorGender,
        location: donorLocation,
        state: donorState,
        contactNumber: donorContactNumber,
        available: donorAvailable
      };
      
      // Register donor in auth context with backend field names
      const backendData = {
        name: donorName,
        email: donorEmail,
        password: donorPassword,
        bloodGroup: donorBloodType,
        phone: donorContactNumber,
        city: donorLocation,    // Use location as city
        state: donorState,
        age: parseInt(donorAge),
        gender: donorGender,
        isAvailable: donorAvailable
      };
      
      // Register with backend
      const user = await register(backendData, 'donor');
      
      // Add to frontend data context
      addDonor(donorData);
      
      toast.success("Registration successful! Redirecting to dashboard...");
      
      // Navigate to donor dashboard
      navigate('/donor/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleHospitalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Create hospital data object for frontend
      const hospitalData = {
        name: hospitalName,
        email: hospitalEmail,
        phone: hospitalContactNumber,
        city: hospitalLocation,
        state: hospitalState,
        contactPerson: hospitalContactPerson,
        licenseNumber: hospitalLicenseNumber,
        isVerified: false
      };
      
      // Create hospital data object for backend
      const backendData = {
        name: hospitalName,
        email: hospitalEmail,
        password: hospitalPassword,
        licenseNumber: hospitalLicenseNumber,
        phone: hospitalContactNumber,
        city: hospitalLocation,
        state: hospitalState,
        contactPerson: hospitalContactPerson
      };
      
      // Register with backend
      const user = await register(backendData, 'hospital');
      
      // Add to frontend data context
      addHospital(hospitalData);
      
      toast.success("Registration successful! Your account is pending admin verification. You will be redirected to the dashboard.");
      
      // Navigate to hospital dashboard
      navigate('/hospital/dashboard');
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Join RaktSetu</h1>
            <p className="text-gray-600 mt-2">Register as a donor or hospital</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Create an Account</CardTitle>
              <CardDescription>
                Fill in your details to register
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="donor">Donor</TabsTrigger>
                  <TabsTrigger value="hospital">Hospital</TabsTrigger>
                </TabsList>
                
                <TabsContent value="donor">
                  <form onSubmit={handleDonorRegister}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="donor-name">Full Name</Label>
                          <Input
                            id="donor-name"
                            placeholder="John Doe"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="donor-email">Email</Label>
                          <Input
                            id="donor-email"
                            type="email"
                            placeholder="john@example.com"
                            value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        
                        <div className="space-y-2">
                          <Label htmlFor="donor-blood-type">Blood Type</Label>
                          <Select 
                            value={donorBloodType} 
                            onValueChange={setDonorBloodType}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="donor-age">Age</Label>
                          <Input
                            id="donor-age"
                            type="number"
                            min="18"
                            max="65"
                            placeholder="25"
                            value={donorAge}
                            onChange={(e) => setDonorAge(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="donor-gender">Gender</Label>
                          <Select 
                            value={donorGender} 
                            onValueChange={setDonorGender}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="donor-location">Location</Label>
                          <Input
                            id="donor-location"
                            placeholder="Enter your location"
                            value={donorLocation}
                            onChange={(e) => setDonorLocation(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="donor-state">State</Label>
                          <Input
                            id="donor-state"
                            placeholder="Enter your state"
                            value={donorState}
                            onChange={(e) => setDonorState(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="donor-contact">Contact Number</Label>
                          <Input
                            id="donor-contact"
                            placeholder="+91 9876543210"
                            value={donorContactNumber}
                            onChange={(e) => setDonorContactNumber(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="donor-available"
                          checked={donorAvailable}
                          onCheckedChange={setDonorAvailable}
                        />
                        <Label htmlFor="donor-available">
                          I am available to donate blood
                        </Label>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                      {isLoading ? 'Registering...' : 'Register as Donor'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="hospital">
                  <form onSubmit={handleHospitalRegister}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hospital-name">Hospital Name</Label>
                          <Input
                            id="hospital-name"
                            placeholder="City Hospital"
                            value={hospitalName}
                            onChange={(e) => setHospitalName(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="hospital-email">Email</Label>
                          <Input
                            id="hospital-email"
                            type="email"
                            placeholder="contact@hospital.com"
                            value={hospitalEmail}
                            onChange={(e) => setHospitalEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        
                        <div className="space-y-2">
                          <Label htmlFor="hospital-license">License Number</Label>
                          <Input
                            id="hospital-license"
                            placeholder="HOSP123456"
                            value={hospitalLicenseNumber}
                            onChange={(e) => setHospitalLicenseNumber(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hospital-contact-person">Contact Person</Label>
                          <Input
                            id="hospital-contact-person"
                            placeholder="Dr. Smith"
                            value={hospitalContactPerson}
                            onChange={(e) => setHospitalContactPerson(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="hospital-contact-number">Contact Number</Label>
                          <Input
                            id="hospital-contact-number"
                            placeholder="+91 9876543210"
                            value={hospitalContactNumber}
                            onChange={(e) => setHospitalContactNumber(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hospital-location">City</Label>
                          <Input
                            id="hospital-location"
                            placeholder="City"
                            value={hospitalLocation}
                            onChange={(e) => setHospitalLocation(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hospital-state">State</Label>
                          <Input
                            id="hospital-state"
                            placeholder="State"
                            value={hospitalState}
                            onChange={(e) => setHospitalState(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p>Note: New hospital registrations require admin verification before accessing all features.</p>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                      {isLoading ? 'Registering...' : 'Register as Hospital'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <p className="text-sm text-center text-gray-600 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-blood-600 hover:underline">
                  Login
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

export default Register;
