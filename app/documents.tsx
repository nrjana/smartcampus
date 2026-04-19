import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../constants/supabase';
import { useRouter } from 'expo-router';
import { useTheme } from '../constants/context/ThemeContext';

export default function DocumentsScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  // Список типов справок
  const docTypes = [
    { id: '1', title: 'Справка с места учебы', icon: 'school-outline' },
    { id: '2', title: 'Справка в военкомат', icon: 'shield-outline' },
    { id: '3', title: 'Для получения визы', icon: 'airplane-outline' },
    { id: '4', title: 'Архивная справка', icon: 'archive-outline' },
  ];

  useEffect(() => { fetchHistory(); }, []);

  async function fetchHistory() {
    try {
      setLoading(true);
      const { data: profile } = await supabase.from('profiles').select('id').single();
      if (profile) {
        const { data } = await supabase
          .from('student_documents')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false });
        setHistory(data || []);
      }
    } catch (e) { console.log(e); } finally { setLoading(false); }
  }

  const handleOrder = async (type: string) => {
    Alert.alert("Подтверждение", `Заказать "${type}"?`, [
      { text: "Отмена", style: "cancel" },
      { text: "Заказать", onPress: () => submitRequest(type) }
    ]);
  };

  async function submitRequest(type: string) {
    const { data: profile } = await supabase.from('profiles').select('id').single();
    if (profile) {
      const { error } = await supabase.from('student_documents').insert([
        { profile_id: profile.id, document_type: type, status: 'pending' }
      ]);
      if (!error) {
        Alert.alert("Успешно", "Заявка принята! Срок изготовления 2-3 дня.");
        fetchHistory(); // Обновляем список
      }
    }
  }

  if (loading) return <View style={[styles.center, {backgroundColor: theme.bg}]}><ActivityIndicator size="large" color="#9C27B0" /></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={theme.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Заказ справок</Text>
      </View>

      <FlatList
        ListHeaderComponent={
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Доступные справки</Text>
            <View style={styles.grid}>
              {docTypes.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.docCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => handleOrder(item.title)}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name={item.icon as any} size={24} color="#9C27B0" />
                  </View>
                  <Text style={[styles.docLabel, { color: theme.text }]}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 25 }]}>История заявок</Text>
          </View>
        }
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={[styles.historyItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={{flex: 1}}>
              <Text style={[styles.historyTitle, { color: theme.text }]}>{item.document_type}</Text>
              <Text style={{ color: theme.subText, fontSize: 12 }}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'ready' ? '#E8F5E9' : '#FFF3E0' }]}>
              <Text style={{ color: item.status === 'ready' ? '#4CAF50' : '#FF9800', fontSize: 11, fontWeight: 'bold' }}>
                {item.status === 'ready' ? 'ГОТОВА' : 'В РАБОТЕ'}
              </Text>
            </View>
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  docCard: { width: '48%', padding: 15, borderRadius: 20, borderWidth: 1, marginBottom: 15, alignItems: 'center' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(156, 39, 176, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  docLabel: { textAlign: 'center', fontSize: 13, fontWeight: '500' },
  historyItem: { flexDirection: 'row', padding: 16, borderRadius: 15, borderWidth: 1, marginBottom: 10, alignItems: 'center' },
  historyTitle: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }
});