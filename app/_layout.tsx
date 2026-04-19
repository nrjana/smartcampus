import { Stack, useRouter, useSegments, Slot } from 'expo-router';
import { useState, createContext, useContext, useEffect } from 'react';
import { ThemeProvider } from '../constants/context/ThemeContext'; // Проверь путь!

// 1. Твой существующий контекст авторизации
const AuthContext = createContext({
  signIn: () => {},
  signOut: () => {},
  isLoggedIn: false,
});

export const useAuth = () => useContext(AuthContext);

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    setIsNavigationReady(true);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, segments, isNavigationReady]);

  return (
    // ОБЕРТКА ТЕМЫ — теперь она главная
    <ThemeProvider>
      <AuthContext.Provider value={{ 
        signIn: () => setIsLoggedIn(true), 
        signOut: () => setIsLoggedIn(false), 
        isLoggedIn 
      }}>
        {/* Slot или Stack — здесь будет отображаться контент приложения */}
        <Stack screenOptions={{ headerShown: false }} />
      </AuthContext.Provider>
    </ThemeProvider>
  );
}