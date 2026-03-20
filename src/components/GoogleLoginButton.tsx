import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export const GoogleLoginButton: React.FC = () => {
  const { user, login, logout, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="user-profile-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img 
          src={user.picture} 
          alt={user.name} 
          style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #00D9FF' }} 
        />
        <div className="user-info" style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{user.name}</span>
          <button 
            onClick={logout} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#aaa', 
              fontSize: '10px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0
            }}
          >
            <LogOut size={10} /> Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        if (credentialResponse.credential) {
          login(credentialResponse.credential);
        }
      }}
      onError={() => {
        console.error('Login Failed');
      }}
      useOneTap
      theme="filled_blue"
      shape="circle"
    />
  );
};
