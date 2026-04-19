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
import { useTheme } from '../constants/context/ThemeContext';

export default function AttendanceScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    fetchAttendance();
  }, []);

  async function fetchAttendance() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      
      setAttendance(data || []);
      
      // Считаем процент посещаемости
      if (data && data.length > 0) {
        const presentCount = data.filter(item => item.is_present).length;
        const totalPercent = Math.round((presentCount / data.length) * 100);
        setPercent(totalPercent);
      }
    } catch (e) {
      console.log('Ошибка:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={theme.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Посещаемость</Text>
      </View>

      {/* БОЛЬШАЯ ПЛАШКА С ПРОЦЕНТОМ */}
      <View style={[styles.statsCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#f8f9fa', borderColor: theme.border }]}>
        <View style={styles.statsInfo}>
          <Text style={[styles.statsLabel, { color: theme.subText }]}>Общий рейтинг</Text>
          <Text style={[styles.statsValue, { color: theme.text }]}>{percent}%</Text>
          <Text style={[styles.statsSub, { color: '#4CAF50' }]}>Хороший результат!</Text>
        </View>
        <View style={styles.progressContainer}>
           {/* Простейшая имитация прогресс-бара */}
           <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: '#4CAF50' }]} />
           </View>
        </View>
      </View>

      <Text style={[styles.listTitle, { color: theme.text }]}>История посещений</Text>

      <FlatList
        data={attendance}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.statusIndicator, { backgroundColor: item.is_present ? '#4CAF50' : '#F44336' }]} />
            <View style={styles.infoBox}>
              <Text style={[styles.subject, { color: theme.text }]}>{item.subject_name}</Text>
              <Text style={[styles.dateText, { color: theme.subText }]}>{item.date}</Text>
            </View>
            <Text style={[styles.typeBadge, { color: theme.subText }]}>{item.type || 'Лекция'}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  
  // Стили большой плашки
  statsCard: { margin: 20, padding: 25, borderRadius: 30, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statsInfo: { flex: 1 },
  statsLabel: { fontSize: 14, fontWeight: '600' },
  statsValue: { fontSize: 42, fontWeight: 'bold', marginVertical: 5 },
  statsSub: { fontSize: 13, fontWeight: '600' },
  progressContainer: { width: 8, height: 80, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  progressBar: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  progressFill: { width: '100%', borderRadius: 4 },

  listTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 25, marginBottom: 10 },
  
  card: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    marginBottom: 12, 
    padding: 16, 
    borderRadius: 20, 
    borderWidth: 1, 
    alignItems: 'center' 
  },
  statusIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 15 },
  infoBox: { flex: 1 },
  subject: { fontSize: 16, fontWeight: 'bold' },
  dateText: { fontSize: 12, marginTop: 2 },
  typeBadge: { fontSize: 12, fontWeight: '500' }
});