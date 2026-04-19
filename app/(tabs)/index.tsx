import React, { useEffect, useState, useCallback } from 'react'; // Добавлен useCallback
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native'; // Добавлен RefreshControl
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../constants/supabase';
import { useRouter } from 'expo-router';
// Импортируем наш глобальный контекст темы
import { useTheme } from '../../constants/context/ThemeContext'; 

export default function Index() {
  const router = useRouter();
  
  // Достаем всё необходимое из глобальной темы
  const { theme, isDarkMode, toggleTheme } = useTheme(); 

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Состояние для Pull-to-Refresh
  
  const [student, setStudent] = useState({
    id: '',
    full_name: 'Загрузка...',
    group_name: '',
    faculty: '',
    course: ''
  });

  // Состояния для динамических данных из таблиц
  const [latestNews, setLatestNews] = useState('Загрузка новостей...');
  const [latestNotification, setLatestNotification] = useState('Загрузка уведомлений...');

  // Основные кнопки (сетка)
  const mainGridItems = [
    { title: 'Расписание', icon: 'calendar', color: '#E3F2FD', iconColor: '#2196F3', route: '/schedule' },
    { title: 'Посещаемость', icon: 'checkmark-circle', color: '#E8F5E9', iconColor: '#4CAF50', route: '/attendance' },
    { title: 'Регистрация', icon: 'person-add', color: '#FFF3E0', iconColor: '#FF9800', route: '/registration' },
    { title: 'Сдача работ', icon: 'cloud-upload', color: '#F3E5F5', iconColor: '#9C27B0', route: '/assignments' },
    { title: 'Карта кампуса', icon: 'map', color: '#E8F5E9', iconColor: '#4CAF50', route: '/campus' },
  ];

  useEffect(() => {
    loadAllData();
  }, []);

  // Вынес логику загрузки в отдельную функцию, чтобы вызывать её при обновлении
  async function loadAllData(showIndicator = true) {
    try {
      if (showIndicator) setLoading(true);
      
      // 1. Загружаем профиль студента
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();
      
      if (profileData) {
        setStudent(profileData);

        // 2. Загружаем самое свежее уведомление
        const { data: notifData } = await supabase
          .from('notifications')
          .select('title')
          .eq('profile_id', profileData.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (notifData && notifData.length > 0) {
          setLatestNotification(notifData[0].title);
        } else {
          setLatestNotification('Нет новых уведомлений');
        }
      }

      // 3. Загружаем самую свежую новость
      const { data: newsData } = await supabase
        .from('news')
        .select('title')
        .order('created_at', { ascending: false })
        .limit(1);

      if (newsData && newsData.length > 0) {
        setLatestNews(newsData[0].title);
      } else {
        setLatestNews('Свежих новостей пока нет');
      }

    } catch (error) {
      console.log('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Выключаем индикатор обновления
    }
  }

  // Функция для Pull-to-Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAllData(false); // Загружаем данные без главного ActivityIndicator
  }, []);

  // Динамические горизонтальные плашки
  const horizontalItems = [
    { 
      title: 'Уведомления', 
      icon: 'notifications', 
      color: '#FFEBEE', 
      iconColor: '#F44336', 
      description: latestNotification, 
      route: '/notifications' 
    },
    { 
      title: 'Новости', 
      icon: 'newspaper', 
      color: '#E0F7FA', 
      iconColor: '#00BCD4', 
      description: latestNews, 
      route: '/news' 
    },
  ];

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color="#0055bb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? "#fff" : "#0055bb"} // Цвет для iOS
            colors={["#0055bb"]} // Цвет для Android
          />
        }
      >
        
        {/* Шапка */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: theme.text }]}>Привет, {student.full_name}!</Text>
            <Text style={[styles.subText, { color: theme.subText }]}>{student.group_name} • {student.faculty}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={toggleTheme} 
            style={[styles.themeBtn, { backgroundColor: isDarkMode ? '#333' : '#F0F4FF' }]}
          >
            <Ionicons 
              name={isDarkMode ? "sunny" : "moon"} 
              size={24} 
              color={isDarkMode ? "#FFD700" : "#0055bb"} 
            />
          </TouchableOpacity>
        </View>

        {/* Сетка основных кнопок */}
        <View style={styles.grid}>
          {mainGridItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={28} color={item.iconColor} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Длинные плашки */}
        <View style={styles.horizontalSection}>
          {horizontalItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.wideCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.iconContainerWide, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
              </View>
              <View style={styles.wideCardText}>
                <Text style={[styles.wideCardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text 
                  style={[styles.wideCardSub, { color: theme.subText }]} 
                  numberOfLines={1}
                >
                  {item.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.subText} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 25,
    marginTop: 10 
  },
  welcomeText: { fontSize: 26, fontWeight: 'bold' },
  subText: { fontSize: 14, marginTop: 4 },
  themeBtn: { padding: 12, borderRadius: 18 },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 15, 
    justifyContent: 'space-between' 
  },
  card: { 
    width: '47%', 
    borderRadius: 22, 
    padding: 20, 
    marginBottom: 15, 
    alignItems: 'center', 
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: { 
    width: 55, 
    height: 55, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  horizontalSection: { paddingHorizontal: 15, marginTop: 5 },
  wideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 22,
    marginBottom: 15,
    borderWidth: 1,
    elevation: 2,
  },
  iconContainerWide: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center', 
    alignItems: 'center'
  },
  wideCardText: { flex: 1, marginLeft: 15 },
  wideCardTitle: { fontSize: 16, fontWeight: '700' },
  wideCardSub: { fontSize: 13, marginTop: 2 }
});