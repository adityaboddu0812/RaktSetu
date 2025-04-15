
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut, Menu, X } from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isLandingPage = location.pathname === '/';
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleScrollToSection = (id: string) => {
    if (isLandingPage) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    } else {
      navigate(`/#${id}`);
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blood-600 text-white flex items-center justify-center relative">
                <span className="animate-pulse-ring absolute w-full h-full rounded-full bg-blood-500 opacity-50"></span>
                <span className="block transform -rotate-45 -translate-y-0.5">R</span>
              </div>
            </div>
            <span className="text-2xl font-bold ml-2 text-blood-700">RaktSetu</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {isLandingPage ? (
            <nav className="flex space-x-1">
              <Button variant="ghost" onClick={() => handleScrollToSection('home')}>Home</Button>
              <Button variant="ghost" onClick={() => handleScrollToSection('about')}>About Us</Button>
              <Button variant="ghost" onClick={() => handleScrollToSection('compatibility')}>Compatibility</Button>
            </nav>
          ) : (
            <nav className="flex space-x-1">
              <Button variant="ghost" onClick={() => navigate('/')}>Home</Button>
              <Button variant="ghost" onClick={() => navigate('/#about')}>About Us</Button>
            </nav>
          )}
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4 ml-4">
              {user?.role === 'donor' && (
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Donor</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-3 p-4 w-[200px]">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link to="/donor/dashboard" className="block p-2 hover:bg-gray-100 rounded">Dashboard</Link>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              )}
              
              {user?.role === 'hospital' && (
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Hospital</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-3 p-4 w-[200px]">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link to="/hospital/dashboard" className="block p-2 hover:bg-gray-100 rounded">Dashboard</Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link to="/hospital/donors" className="block p-2 hover:bg-gray-100 rounded">Find Donors</Link>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              )}
              
              {user?.role === 'admin' && (
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-3 p-4 w-[200px]">
                          <li>
                            <NavigationMenuLink asChild>
                              <Link to="/admin/dashboard" className="block p-2 hover:bg-gray-100 rounded">Dashboard</Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link to="/admin/hospitals" className="block p-2 hover:bg-gray-100 rounded">Hospitals</Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <NavigationMenuLink asChild>
                              <Link to="/admin/donors" className="block p-2 hover:bg-gray-100 rounded">Donors</Link>
                            </NavigationMenuLink>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              )}
              
              <div className="flex items-center">
                <div className="text-right mr-4">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full h-10 w-10 p-0">
                      <div className="h-8 w-8 rounded-full bg-blood-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blood-600" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ) : (
            <div className="flex space-x-2 ml-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="default" onClick={() => navigate('/register')}>
                Register
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-2">
              {isLandingPage ? (
                <>
                  <Button variant="ghost" className="justify-start" onClick={() => handleScrollToSection('home')}>Home</Button>
                  <Button variant="ghost" className="justify-start" onClick={() => handleScrollToSection('about')}>About Us</Button>
                  <Button variant="ghost" className="justify-start" onClick={() => handleScrollToSection('compatibility')}>Compatibility</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="justify-start" onClick={() => navigate('/')}>Home</Button>
                  <Button variant="ghost" className="justify-start" onClick={() => navigate('/#about')}>About Us</Button>
                </>
              )}
              
              {isAuthenticated ? (
                <>
                  {user?.role === 'donor' && (
                    <>
                      <div className="py-1 px-2 text-sm font-medium text-gray-500">Donor Menu</div>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/donor/dashboard'); setMobileMenuOpen(false); }}>Dashboard</Button>
                    </>
                  )}
                  
                  {user?.role === 'hospital' && (
                    <>
                      <div className="py-1 px-2 text-sm font-medium text-gray-500">Hospital Menu</div>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/hospital/dashboard'); setMobileMenuOpen(false); }}>Dashboard</Button>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/hospital/donors'); setMobileMenuOpen(false); }}>Find Donors</Button>
                    </>
                  )}
                  
                  {user?.role === 'admin' && (
                    <>
                      <div className="py-1 px-2 text-sm font-medium text-gray-500">Admin Menu</div>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/admin/dashboard'); setMobileMenuOpen(false); }}>Dashboard</Button>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/admin/hospitals'); setMobileMenuOpen(false); }}>Hospitals</Button>
                      <Button variant="ghost" className="justify-start" onClick={() => { navigate('/admin/donors'); setMobileMenuOpen(false); }}>Donors</Button>
                    </>
                  )}
                  
                  <div className="border-t border-gray-200 my-2"></div>
                  <Button variant="ghost" className="justify-start text-red-600" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Button variant="ghost" className="justify-start" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Login</Button>
                  <Button variant="ghost" className="justify-start" onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>Register</Button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
