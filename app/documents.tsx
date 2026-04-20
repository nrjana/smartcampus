import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../constants/context/ThemeContext';
import { supabase } from '../constants/supabase';

export default function DocumentsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const { data: profile } = await supabase.from('profiles').select('id').single();
      if (profile) {
        const { data } = await supabase
          .from('document_requests')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false });
        setRequests(data || []);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  // Функция для отрисовки красивого статуса
  const renderStatus = (status: string) => {
    const statusMap: any = {
      pending: { label: 'В обработке', color: '#FF9800', icon: 'time-outline' },
      processing: { label: 'Печатается', color: '#2196F3', icon: 'print-outline' },
      ready: { label: 'Готова', color: '#4CAF50', icon: 'checkmark-circle-outline' },
      rejected: { label: 'Отклонена', color: '#F44336', icon: 'close-circle-outline' },
    };
    const current = statusMap[status] || statusMap.pending;

    return (
      <View style={[styles.statusBadge, { backgroundColor: current.color + '20' }]}>
        <Ionicons name={current.icon} size={14} color={current.color} />
        <Text style={[styles.statusText, { color: current.color }]}>{current.label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Справки и документы</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Секция выбора */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Заказать новую</Text>
          <View style={styles.quickActions}>
            {['Об обучении', 'В банк', 'Военкомат', 'Доходы'].map((item) => (
              <TouchableOpacity 
                key={item} 
                style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Ionicons name="document-text-outline" size={24} color="#FF9800" />
                <Text style={[styles.actionLabel, { color: theme.text }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Секция истории заявок */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Мои заявки</Text>
          {loading ? (
            <ActivityIndicator color="#FF9800" />
          ) : (
            requests.map((item) => (
              <View key={item.id} style={[styles.requestCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.docType, { color: theme.text }]}>{item.document_type}</Text>
                  <Text style={[styles.docDate, { color: theme.subText }]}>
                    От {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                {renderStatus(item.status)}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionButton: { 
    width: '48%', 
    padding: 15, 
    borderRadius: 20, 
    borderWidth: 1, 
    alignItems: 'center', 
    marginBottom: 15 
  },
  actionLabel: { marginTop: 8, fontSize: 14, fontWeight: '500' },
  requestCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 20, 
    borderWidth: 1, 
    marginBottom: 12 
  },
  docType: { fontSize: 16, fontWeight: '600' },
  docDate: { fontSize: 13, marginTop: 2 },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 10 
  },
  statusText: { fontSize: 12, fontWeight: 'bold', marginLeft: 5 },
});