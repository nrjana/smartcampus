import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../constants/supabase';
import { useRouter } from 'expo-router';
import { useTheme } from '../constants/context/ThemeContext'; // Импорт темы

export default function RegistrationScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme(); // Подключаем тему
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => { fetchCourses(); }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      const { data } = await supabase.from('available_courses').select('*');
      setCourses(data || []);
    } catch (e) { console.log(e); } finally { setLoading(false); }
  }

  if (loading) return <View style={[styles.center, {backgroundColor: theme.bg}]}><ActivityIndicator size="large" color="#FF9800" /></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      
      {/* МОДАЛКА 1: ПОДТВЕРЖДЕНИЕ */}
      <Modal animationType="fade" transparent={true} visible={confirmVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalView, { backgroundColor: theme.card }]}>
            <Ionicons name="help-circle-outline" size={50} color="#FF9800" />
            <Text style={[styles.modalTitle, { color: theme.text }]}>Подтверждение</Text>
            <Text style={[styles.modalText, { color: theme.subText }]}>Записаться на "{selectedCourse}"?</Text>
            <View style={{flexDirection: 'row', gap: 10}}>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: theme.border}]} onPress={() => setConfirmVisible(false)}>
                <Text style={{color: theme.text}}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => { setConfirmVisible(false); setTimeout(() => setSuccessVisible(true), 300); }}>
                <Text style={styles.modalButtonText}>Да</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* МОДАЛКА 2: УСПЕХ */}
      <Modal animationType="fade" transparent={true} visible={successVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalView, { backgroundColor: theme.card }]}>
            <View style={styles.successCircle}><Ionicons name="checkmark" size={35} color="#fff" /></View>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Успешно!</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setSuccessVisible(false)}>
              <Text style={styles.modalButtonText}>ОК</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={theme.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Выбор элективов</Text>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.courseCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.courseTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.instructor, { color: '#0055bb' }]}>{item.instructor}</Text>
            </View>
            <TouchableOpacity style={styles.enrollButton} onPress={() => { setSelectedCourse(item.title); setConfirmVisible(true); }}>
              <Text style={styles.enrollButtonText}>Записаться</Text>
            </TouchableOpacity>
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
  courseCard: { marginHorizontal: 20, marginBottom: 15, padding: 16, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  courseTitle: { fontSize: 16, fontWeight: 'bold' },
  instructor: { fontSize: 13, marginTop: 4 },
  enrollButton: { backgroundColor: '#FF9800', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  enrollButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalView: { width: 280, borderRadius: 25, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  modalText: { textAlign: 'center', marginBottom: 20 },
  modalButton: { backgroundColor: '#1a1a1a', paddingHorizontal: 25, paddingVertical: 10, borderRadius: 12 },
  modalButtonText: { color: '#fff', fontWeight: 'bold' },
  successCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' }
});