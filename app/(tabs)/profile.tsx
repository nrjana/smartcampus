import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../constants/supabase'; // Импорт supabase
import { useRouter } from 'expo-router';
import { useTheme } from '../../constants/context/ThemeContext'; 
import { useAuth } from '../_layout';
const { signOut } = useAuth();

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);

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
              // 1. Выходим из базы данных
              await supabase.auth.signOut();
              
              // 2. Вызываем signOut из твоего _layout (он сам сделает переход)
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