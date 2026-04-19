import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../constants/supabase';
import { useRouter } from 'expo-router';
import { useTheme } from '../constants/context/ThemeContext';

export default function TranscriptScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<any[]>([]);

  useEffect(() => { fetchTranscript(); }, []);

  async function fetchTranscript() {
    try {
      setLoading(true);
      const { data: profile } = await supabase.from('profiles').select('id').single();
      if (profile) {
        const { data } = await supabase
          .from('student_grades')
          .select('*')
          .order('semester', { ascending: true });
        setGrades(data || []);
      }
    } catch (e) { console.log(e); } finally { setLoading(false); }
  }

  // Расчет статистики
  const totalCredits = grades.reduce((acc, item) => acc + (item.credits || 0), 0);
  const avgGrade = grades.length > 0 
    ? (grades.reduce((acc, item) => acc + item.grade_value, 0) / grades.length).toFixed(2) 
    : "0.00";

  if (loading) return <View style={[styles.center, {backgroundColor: theme.bg}]}><ActivityIndicator size="large" color="#2196F3" /></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={theme.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Академический транскрипт</Text>
      </View>

      <View style={styles.content}>
        {/* Итоговая панель */}
        <View style={[styles.summaryCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#F0F7FF', borderColor: '#2196F3' }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.subText }]}>Всего кредитов</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{totalCredits}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.subText }]}>Средний балл (GPA)</Text>
            <Text style={[styles.summaryValue, { color: '#2196F3' }]}>{avgGrade}</Text>
          </View>
        </View>

        {/* Заголовки таблицы */}
        <View style={[styles.tableHeader, { borderBottomColor: theme.border }]}>
          <Text style={[styles.tableHeadText, { flex: 2, color: theme.subText }]}>Дисциплина</Text>
          <Text style={[styles.tableHeadText, { flex: 0.5, textAlign: 'center', color: theme.subText }]}>КР</Text>
          <Text style={[styles.tableHeadText, { flex: 0.8, textAlign: 'right', color: theme.subText }]}>Оценка</Text>
        </View>

        <FlatList
          data={grades}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.tableRow, { borderBottomColor: theme.border }]}>
              <View style={{ flex: 2 }}>
                <Text style={[styles.subjectName, { color: theme.text }]}>{item.subject_name}</Text>
                <Text style={{ fontSize: 10, color: theme.subText }}>{item.semester}</Text>
              </View>
              <Text style={[styles.creditText, { flex: 0.5, color: theme.text }]}>{item.credits || 3}</Text>
              <View style={{ flex: 0.8, alignItems: 'flex-end' }}>
                <Text style={[styles.gradeText, { color: item.grade_value >= 4 ? '#4CAF50' : '#FF9800' }]}>
                  {item.grade_letter}
                </Text>
              </View>
            </View>
          )}
        />
      </View>
      
      <TouchableOpacity style={styles.downloadBtn} onPress={() => alert('Запрос на формирование PDF отправлен')}>
        <Ionicons name="download-outline" size={20} color="#fff" />
        <Text style={styles.downloadBtnText}>Скачать PDF версию</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 15 },
  content: { flex: 1, paddingHorizontal: 20 },
  
  summaryCard: { 
    flexDirection: 'row', 
    padding: 20, 
    borderRadius: 20, 
    borderWidth: 1, 
    marginBottom: 20,
    alignItems: 'center'
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  summaryValue: { fontSize: 22, fontWeight: 'bold', marginTop: 5 },
  divider: { width: 1, height: 40 },

  tableHeader: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, marginBottom: 5 },
  tableHeadText: { fontSize: 12, fontWeight: 'bold' },
  
  tableRow: { flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, alignItems: 'center' },
  subjectName: { fontSize: 14, fontWeight: '500' },
  creditText: { textAlign: 'center', fontSize: 14 },
  gradeText: { fontSize: 16, fontWeight: 'bold' },

  downloadBtn: { 
    flexDirection: 'row', 
    backgroundColor: '#1a1a1a', 
    margin: 20, 
    padding: 16, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 10
  },
  downloadBtnText: { color: '#fff', fontWeight: 'bold' }
});