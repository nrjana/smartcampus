import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../constants/supabase';
import { useRouter } from 'expo-router';
import { useTheme } from '../constants/context/ThemeContext';

export default function GradesScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<any[]>([]);

  useEffect(() => { fetchGrades(); }, []);

  async function fetchGrades() {
    try {
      setLoading(true);
      const { data: profile } = await supabase.from('profiles').select('id').single();
      if (profile) {
        const { data } = await supabase
          .from('student_grades')
          .select('*')
          .eq('profile_id', profile.id)
          .order('semester', { ascending: false });
        setGrades(data || []);
      }
    } catch (e) { console.log(e); } finally { setLoading(false); }
  }

  const getGradeColor = (value: number) => {
    if (value >= 5) return '#4CAF50'; // Отлично
    if (value >= 4) return '#2196F3'; // Хорошо
    return '#FF9800'; // Посредственно
  };

  if (loading) return <View style={[styles.center, {backgroundColor: theme.bg}]}><ActivityIndicator size="large" color="#4CAF50" /></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={theme.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Успеваемость</Text>
      </View>

      <FlatList
        data={grades}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={[styles.gradeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.info}>
              <Text style={[styles.subject, { color: theme.text }]}>{item.subject_name}</Text>
              <Text style={[styles.semester, { color: theme.subText }]}>{item.semester}</Text>
            </View>
            <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(item.grade_value) + '20' }]}>
              <Text style={[styles.gradeText, { color: getGradeColor(item.grade_value) }]}>
                {item.grade_letter} ({item.grade_value})
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{textAlign: 'center', color: theme.subText, marginTop: 40}}>Оценок пока нет</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  gradeCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 20, 
    borderWidth: 1, 
    marginBottom: 12 
  },
  info: { flex: 1 },
  subject: { fontSize: 16, fontWeight: 'bold' },
  semester: { fontSize: 12, marginTop: 4 },
  gradeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  gradeText: { fontWeight: 'bold', fontSize: 15 }
});