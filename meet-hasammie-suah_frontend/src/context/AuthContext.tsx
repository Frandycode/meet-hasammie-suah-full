/**
 * Meet HaSammie Suah — Frontend
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import React, { createContext, useContext, useState } from 'react';
import { apolloClient } from '../lib/apolloClient';
import { LOGIN } from '../lib/queries';

interface AuthContextType {
  isAdmin: boolean;
  login:   (password: string) => Promise<boolean>;
  logout:  () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(
    () => !!sessionStorage.getItem('sammie_token')
  );

  const login = async (password: string): Promise<boolean> => {
    try {
      const result = await apolloClient.mutate({
        mutation:  LOGIN,
        variables: { password },
      });
      const token = (result.data as any)?.login?.token;
      if (token) {
        sessionStorage.setItem('sammie_token', token);
        sessionStorage.setItem('sammie_admin', 'true');
        setIsAdmin(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('sammie_token');
    sessionStorage.removeItem('sammie_admin');
    apolloClient.clearStore();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
};
