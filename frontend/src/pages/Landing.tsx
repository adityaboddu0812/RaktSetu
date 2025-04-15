import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Droplets, Heart, Search, UserCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BloodCompatibilityChart from '@/components/BloodCompatibilityChart';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section id="home" className="bg-gradient-to-br from-blood-600 to-blood-800 text-white py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 blood-drop-bg opacity-10"></div>
          <div className="container mx-auto flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Connecting <span className="text-blood-100">Blood Donors</span> with Lives in Need
              </h1>
              <p className="text-lg mb-8 text-blood-100">
                RaktSetu bridges the gap between blood donors and hospitals, making the blood donation process seamless, efficient, and life-saving.
              </p>
              
              {/* Quote replacing buttons */}
              <div className="relative py-6 px-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg animate-fade-in my-8">
                <blockquote className="text-xl md:text-2xl italic font-medium">
                  <span className="text-4xl leading-none font-serif text-blood-200">"</span>
                  Be the reason someone gets a second chance at life—donate blood.
                  <span className="text-4xl leading-none font-serif text-blood-200">"</span>
                </blockquote>
                <footer className="text-right text-blood-200 mt-3 font-light">— RaktSetu</footer>
              </div>
            </div>
            
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
                  <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-32 h-32 bg-blood-100 rounded-full flex items-center justify-center shadow-xl">
                      <Droplets className="h-16 w-16 text-blood-700" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full animate-pulse-ring opacity-50"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="about" className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How RaktSetu Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blood-100 rounded-full flex items-center justify-center mb-4">
                      <UserCheck className="h-8 w-8 text-blood-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Register</h3>
                    <p className="text-gray-600">
                      Sign up as a donor or hospital. Provide your details including blood type and location.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blood-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-blood-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Connect</h3>
                    <p className="text-gray-600">
                      Hospitals can search for donors by blood type and location. Donors receive notifications about requests.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blood-100 rounded-full flex items-center justify-center mb-4">
                      <Heart className="h-8 w-8 text-blood-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Donate</h3>
                    <p className="text-gray-600">
                      Accept donation requests, coordinate with hospitals, and save lives through your donation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Compatibility Chart Section */}
        <section id="compatibility" className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Blood Compatibility</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Understanding blood types is crucial for successful transfusions. Different blood types have different compatibility rules for donations.
              </p>
            </div>
            
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-4">Compatibility Chart</h3>
              <BloodCompatibilityChart />
            </div>
          </div>
        </section>
      </main>
      
      <Footer onScrollToSection={scrollToSection} />
    </div>
  );
};

export default Landing;
