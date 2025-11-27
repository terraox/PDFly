import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Default to true

  // Load state from localStorage on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem('pdfly_auth_token');
    const savedRole = localStorage.getItem('pdfly_user_role');
    const savedEmail = localStorage.getItem('pdfly_user_email');
    const savedPlan = localStorage.getItem('pdfly_user_plan');
    const savedExpiry = localStorage.getItem('pdfly_plan_expiry');
    
    if (savedToken && savedEmail) {
      setToken(savedToken);
      setUser({ email: savedEmail, role: savedRole, plan: savedPlan, planExpiry: savedExpiry });
    }
    // Set loading to false only after checking localStorage
    setLoading(false); 
  }, []);

  // Function to handle successful login
  const login = (authToken, userEmail, userRole, userPlan, planExpiry) => {
    localStorage.setItem('pdfly_auth_token', authToken);
    localStorage.setItem('pdfly_user_email', userEmail);
    localStorage.setItem('pdfly_user_role', userRole);
    localStorage.setItem('pdfly_user_plan', userPlan || 'FREE');
    localStorage.setItem('pdfly_plan_expiry', planExpiry || '');
    setToken(authToken);
    setUser({ email: userEmail, role: userRole, plan: userPlan || 'FREE', planExpiry: planExpiry || '' });
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('pdfly_auth_token');
    localStorage.removeItem('pdfly_user_email');
    localStorage.removeItem('pdfly_user_role');
    localStorage.removeItem('pdfly_user_plan');
    localStorage.removeItem('pdfly_plan_expiry');
    setToken(null);
    setUser(null);
  };

  const value = { user, token, login, logout, isAuthenticated: !!token, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};