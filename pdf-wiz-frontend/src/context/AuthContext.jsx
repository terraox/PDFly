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
    const savedUsage = localStorage.getItem('pdfly_daily_usage');

    if (savedToken && savedEmail) {
      setToken(savedToken);
      setUser({
        email: savedEmail,
        role: savedRole,
        plan: savedPlan,
        planExpiry: savedExpiry,
        dailyUsageCount: savedUsage ? parseInt(savedUsage) : 0
      });
    }
    // Set loading to false only after checking localStorage
    setLoading(false);
  }, []);

  // Function to handle successful login
  const login = (authToken, userEmail, userRole, userPlan, planExpiry, dailyUsageCount) => {
    localStorage.setItem('pdfly_auth_token', authToken);
    localStorage.setItem('pdfly_user_email', userEmail);
    localStorage.setItem('pdfly_user_role', userRole);
    localStorage.setItem('pdfly_user_plan', userPlan || 'FREE');
    localStorage.setItem('pdfly_plan_expiry', planExpiry || '');
    localStorage.setItem('pdfly_daily_usage', dailyUsageCount || 0);
    setToken(authToken);
    setUser({
      email: userEmail,
      role: userRole,
      plan: userPlan || 'FREE',
      planExpiry: planExpiry || '',
      dailyUsageCount: dailyUsageCount || 0
    });
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('pdfly_auth_token');
    localStorage.removeItem('pdfly_user_email');
    localStorage.removeItem('pdfly_user_role');
    localStorage.removeItem('pdfly_user_plan');
    localStorage.removeItem('pdfly_plan_expiry');
    localStorage.removeItem('pdfly_daily_usage');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        login(token, data.email, data.role, data.plan, data.planExpiry, data.dailyUsageCount);
      }
    } catch (error) {
      console.error("Failed to refresh user data", error);
    }
  };

  const value = { user, token, login, logout, refreshUser, isAuthenticated: !!token, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};