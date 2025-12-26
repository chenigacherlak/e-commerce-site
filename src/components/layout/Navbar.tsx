import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, MessageSquare, ShoppingCart, User, LogOut, LayoutDashboard, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  cartCount?: number;
  notificationCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount = 0, notificationCount = 0 }) => {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:inline">ChatMart</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/products')} className="text-slate-300 hover:text-white transition">
              Products
            </button>
            <button onClick={() => navigate('/chat')} className="text-slate-300 hover:text-white transition flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <button
                  onClick={() => navigate('/cart')}
                  className="relative text-slate-300 hover:text-white transition"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => navigate('/notifications')}
                  className="relative text-slate-300 hover:text-white transition"
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => navigate('/profile')}
                  className="text-slate-300 hover:text-white transition"
                >
                  <User className="w-5 h-5" />
                </button>

                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="text-slate-300 hover:text-white transition"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={handleSignOut}
                  className="text-slate-300 hover:text-white transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-slate-300 hover:text-white transition text-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  Sign Up
                </button>
              </>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-slate-300"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <button
              onClick={() => {
                navigate('/products');
                setIsOpen(false);
              }}
              className="block w-full text-left px-2 py-2 text-slate-300 hover:text-white"
            >
              Products
            </button>
            <button
              onClick={() => {
                navigate('/chat');
                setIsOpen(false);
              }}
              className="block w-full text-left px-2 py-2 text-slate-300 hover:text-white"
            >
              Chat
            </button>
            {isAuthenticated && (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-2 py-2 text-slate-300 hover:text-white"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
