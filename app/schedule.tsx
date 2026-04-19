import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  SafeAreaView, 
  ActivityIndicator,
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../constants/supabase';
import { useRouter } from 'expo-router';
// Импортируем тему
import { useTheme } from '../constants/context/ThemeContext';

export default function ScheduleScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<any[]>([]);
  // Подключаем тему
  const { theme, isDarkMode } = useTheme();

  useEffect(() => {
    fetchSchedule();
  }, []);

  async function fetchSchedule() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schedule')
        .select('*')
        .order('time_start', { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (e) {
      console.log('Ошибка загрузки расписания:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color="#0055bb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Шапка с динамическими цветами */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Расписание</Text>
      </View>

      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          /* Карточка с динамическим фоном и рамкой */
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.timeBox, { borderRightColor: theme.border }]}>
              <Text style={[styles.timeText, { color: isDarkMode ? '#4dabf7' : '#0055bb' }]}>
                {item.time_start ? item.time_start.slice(0, 5) : '--:--'}
              </Text>
              <Text style={[styles.dayText, { color: theme.subText }]}>{item.day_of_week}</Text>
            </View>
            
            <View style={styles.infoBox}>
              <Text style={[styles.subject, { color: theme.text }]}>{item.subject_name}</Text>
              <Text style={[styles.teacher, { color: theme.subText }]}>{item.teacher}</Text>
              <View style={styles.roomRow}>
                <Ionicons name="location-outline" size={14} color={theme.subText} />
                <Text style={[styles.room, { color: theme.subText }]}>{item.room}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.subText }]}>На сегодня занятий нет</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: { marginRight: 15 },
  title: { fontSize: 22, fontWeight: 'bold' },
  card: { 
    flexDirection: 'row', 
    borderRadius: 16, 
    padding: 16, 
    marginHorizontal: 20,
    marginTop: 15,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  timeBox: { 
    width: 70, 
    borderRightWidth: 1, 
    justifyContent: 'center',
    paddingRight: 10
  },
  timeText: { fontSize: 18, fontWeight: 'bold' },
  dayText: { fontSize: 11, marginTop: 4, textTransform: 'uppercase' },
  infoBox: { flex: 1, paddingLeft: 15 },
  subject: { fontSize: 16, fontWeight: 'bold' },
  teacher: { fontSize: 14, marginVertical: 4 },
  roomRow: { flexDirection: 'row', alignItems: 'center' },
  room: { fontSize: 13, marginLeft: 4 },
  emptyText: { textAlign: 'center', marginTop: 50 }
});