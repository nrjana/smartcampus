import { createContext, useContext } from 'react';

export const AuthContext = createContext({
  signIn: () => {},
  signOut: () => {},
  isLoggedIn: false,
});

export const useAuth = () => useContext(AuthContext);