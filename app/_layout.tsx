import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { AuthContext } from '../constants/context/AuthContext'; // Импорт из нового файла
import { ThemeProvider } from '../constants/context/ThemeContext';

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
    <ThemeProvider>
      {/* Используем AuthContext из нового файла */}
      <AuthContext.Provider value={{ 
        signIn: () => setIsLoggedIn(true), 
        signOut: () => setIsLoggedIn(false), 
        isLoggedIn 
      }}>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthContext.Provider>
    </ThemeProvider>
  );
}