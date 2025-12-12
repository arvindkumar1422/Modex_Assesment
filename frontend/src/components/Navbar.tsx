import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, Menu, LogOut } from 'lucide-react';
import LoginModal from './LoginModal';

export default function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <>
      <nav className="bg-gray-900 text-white py-4 px-8 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-red-500 tracking-tighter">
            BookMyShow
          </Link>
          
          <div className="hidden md:flex items-center bg-gray-800 rounded px-4 py-2 w-1/3">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search for Movies, Events, Plays, Sports and Activities" 
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-6">
            {user && (
              <Link to="/my-bookings" className="text-sm hover:text-red-500 transition-colors">My Bookings</Link>
            )}
            <Link to="/admin" className="text-sm hover:text-gray-300">Admin</Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="text-sm">Hi, {user.email}</span>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-white">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-semibold transition-colors"
              >
                Sign In
              </button>
            )}
            
            <Menu className="w-6 h-6 md:hidden" />
          </div>
        </div>
      </nav>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLoginSuccess={setUser} 
      />
    </>
  );
}
