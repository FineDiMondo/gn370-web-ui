import React from 'react';
import { GoogleLoginButton } from '../components/GoogleLoginButton';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#000',
      backgroundImage: 'radial-gradient(circle at center, #1a1f3a 0%, #000 70%)',
      color: '#fff',
      fontFamily: '"Fira Code", monospace'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          textAlign: 'center',
          padding: '40px',
          border: '1px solid #00D9FF',
          borderRadius: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          boxShadow: '0 0 30px rgba(0, 217, 255, 0.2)',
          maxWidth: '400px',
          width: '90%'
        }}
      >
        <h1 style={{ 
          fontSize: '3rem', 
          margin: '0 0 10px', 
          color: '#00D9FF',
          textShadow: '0 0 10px rgba(0, 217, 255, 0.5)'
        }}>
          🧬 GN370
        </h1>
        <p style={{ 
          fontSize: '1rem', 
          color: '#aaa', 
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          Accesso riservato alla piattaforma <br/> 
          <strong>Wikipedia - Contributi Giardina</strong>
        </p>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <GoogleLoginButton />
        </div>
        
        <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '20px' }}>
          Sistema di monitoraggio genealogico v2.0 <br/>
          &copy; 2026 Giardina-Negrini Family Archives
        </p>
      </motion.div>
      
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        fontSize: '0.7rem',
        color: '#333'
      }}>
        GATE_STATUS: LOCKED <br/>
        ENCRYPTION: AES-256-GCM
      </div>
    </div>
  );
};
