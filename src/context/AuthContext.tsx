import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (credential: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (local storage)
    const savedToken = localStorage.getItem('gn370_auth_token');
    if (savedToken) {
      try {
        const decoded: any = jwtDecode(savedToken);
        // Check expiration
        const currentTime = Date.now() / 1000;
        if (decoded.exp > currentTime) {
          setUser({
            id: decoded.sub || '',
            email: decoded.email || '',
            name: decoded.name || '',
            picture: decoded.picture || '',
          });
        } else {
          localStorage.removeItem('gn370_auth_token');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('gn370_auth_token');
      }
    }
    setLoading(false);
  }, []);

  const login = (credential: string) => {
    try {
      const decoded: any = jwtDecode(credential);
      const profile: UserProfile = {
        id: decoded.sub || '',
        email: decoded.email || '',
        name: decoded.name || '',
        picture: decoded.picture || '',
      };
      setUser(profile);
      localStorage.setItem('gn370_auth_token', credential);
      console.log('Login successful for:', profile.email);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gn370_auth_token');
    console.log('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
