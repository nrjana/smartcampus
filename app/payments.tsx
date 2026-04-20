import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../constants/context/ThemeContext';
import { supabase } from '../constants/supabase';

export default function PaymentsScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => { 
    loadPaymentData(); 
  }, []);

  async function loadPaymentData() {
    try {
      setLoading(true);
      const { data: profile } = await supabase.from('profiles').select('id').single();
      
      if (profile) {
        // 1. Получаем общую инфу по контракту
        const { data: info } = await supabase
          .from('student_payments')
          .select('*')
          .eq('profile_id', profile.id)
          .single();
        setPaymentInfo(info);

        // 2. Получаем историю платежей
        const { data: hist } = await supabase
          .from('payment_history')
          .select('*')
          .eq('profile_id', profile.id)
          .order('date', { ascending: false });
        setHistory(hist || []);
      }
    } catch (e) { 
      console.log(e); 
    } finally { 
      setLoading(false); 
    }
  }

  const debt = paymentInfo ? paymentInfo.total_contract - paymentInfo.paid_amount : 0;

  if (loading) return (
    <View style={[styles.center, {backgroundColor: theme.bg}]}>
      <ActivityIndicator size="large" color="#FF9800" />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Финансы</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 20 }}>
            {/* ГЛАВНАЯ КАРТОЧКА ДОЛГА */}
            <View style={[styles.balanceCard, { backgroundColor: '#FF9800' }]}>
              <Text style={styles.balanceLabel}>К оплате до {paymentInfo?.deadline}</Text>
              <Text style={styles.balanceValue}>{debt.toLocaleString()} ₽</Text>
              <TouchableOpacity style={styles.payButtonInline}>
                <Text style={styles.payButtonText}>Оплатить сейчас</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.text }]}>История транзакций</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="card-outline" size={20} color="#FF9800" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={[styles.purpose, { color: theme.text }]}>{item.purpose}</Text>
              <Text style={[styles.date, { color: theme.subText }]}>{item.date}</Text>
            </View>
            <Text style={[styles.amount, { color: theme.text }]}>
              +{item.amount.toLocaleString()} ₽
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: theme.subText, marginTop: 20 }}>История пуста</Text>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  
  balanceCard: { 
    padding: 25, 
    borderRadius: 30, 
    marginBottom: 30, 
    elevation: 5,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  balanceValue: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 10 },
  payButtonInline: { 
    backgroundColor: '#fff', 
    paddingVertical: 12, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 10 
  },
  payButtonText: { color: '#FF9800', fontWeight: 'bold', fontSize: 15 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  
  historyCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    marginHorizontal: 20, 
    borderRadius: 20, 
    borderWidth: 1, 
    marginBottom: 12 
  },
  iconCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: 'rgba(255, 152, 0, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  purpose: { fontSize: 15, fontWeight: '600' },
  date: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: 'bold' }
});