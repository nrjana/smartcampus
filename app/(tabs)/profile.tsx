import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../constants/context/AuthContext';
import { useTheme } from '../../constants/context/ThemeContext';
import { supabase } from '../../constants/supabase'; // Импорт supabase

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const { signOut } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*').single();
      if (data) setStudent(data);
    } catch (e) {
      console.log('Ошибка загрузки профиля:', e);
    } finally {
      setLoading(false);
    }
  }

  // 3. Обновленная функция выхода
  const handleLogout = async () => {
    Alert.alert(
      "Выход", 
      "Выйти из системы?", 
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Да, выйти", 
          style: "destructive", 
          onPress: async () => {
            try {
              // Удаляем сессию из базы
              await supabase.auth.signOut();
              
              // Переключаем глобальный рубильник! 
              // _layout увидит это и сам перебросит тебя на экран логина
              signOut(); 
              
            } catch (error) {
              console.log("Ошибка выхода:", error);
            }
          } 
        }
      ]
    );
  };

  const menuItems = [
    { id: 'grades', title: 'Успеваемость и оценки', icon: 'ribbon-outline', color: '#4CAF50', route: '/grades' },
    { id: 'transcript', title: 'Транскрипт', icon: 'document-text-outline', color: '#2196F3', route: '/transcript' },
    { id: 'payments', title: 'Оплата за учебу', icon: 'wallet-outline', color: '#FF9800', route: '/payments' },
    { id: 'documents', title: 'Заявки на справки', icon: 'file-tray-full-outline', color: '#9C27B0', route: '/documents' },
  ];

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color="#0055bb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Шапка профиля */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.card }]}>
            <Text style={[styles.avatarText, { color: theme.text }]}>
              {student?.full_name?.charAt(0) || 'О'}
            </Text>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>{student?.full_name}</Text>
          <Text style={[styles.userSub, { color: theme.subText }]}>{student?.group_name} • {student?.faculty}</Text>
        </View>

        {/* Быстрая статистика */}
        <View style={[styles.statsRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>4.85</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>GPA</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text }]}>{student?.course || '2'} курс</Text>
            <Text style={[styles.statLabel, { color: theme.subText }]}>Обучение</Text>
          </View>
        </View>

        {/* Список меню */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={[styles.menuText, { color: theme.text }]}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.subText} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Кнопка ВЫХОДА */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#F44336" />
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Версия 1.0.5 • Smart Campus</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: { alignItems: 'center', paddingVertical: 30 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 4 },
  avatarText: { fontSize: 32, fontWeight: 'bold' },
  userName: { fontSize: 22, fontWeight: 'bold' },
  userSub: { fontSize: 14, marginTop: 5 },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, borderRadius: 20, padding: 20, borderWidth: 1, justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 4 },
  statDivider: { width: 1, height: 30 },
  menuContainer: { marginTop: 25, paddingHorizontal: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 10, padding: 15 },
  logoutText: { color: '#F44336', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  versionText: { textAlign: 'center', color: '#999', fontSize: 11, marginBottom: 30 }
});