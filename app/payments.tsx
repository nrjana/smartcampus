import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../constants/supabase';
import { useRouter } from 'expo-router';
import { useTheme } from '../constants/context/ThemeContext';

export default function PaymentsScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => { fetchPayment(); }, []);

  async function fetchPayment() {
    try {
      setLoading(true);
      const { data: profile } = await supabase.from('profiles').select('id').single();
      if (profile) {
        const { data } = await supabase
          .from('student_payments')
          .select('*')
          .eq('profile_id', profile.id)
          .single();
        setPaymentInfo(data);
      }
    } catch (e) { console.log(e); } finally { setLoading(false); }
  }

  const debt = paymentInfo ? paymentInfo.total_contract - paymentInfo.paid_amount : 0;

  if (loading) return <View style={[styles.center, {backgroundColor: theme.bg}]}><ActivityIndicator size="large" color="#FF9800" /></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={theme.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Оплата обучения</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Карточка баланса */}
        <View style={[styles.balanceCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#FFF9F0', borderColor: '#FF9800' }]}>
          <Text style={styles.balanceLabel}>Остаток к оплате</Text>
          <Text style={styles.balanceValue}>{debt.toLocaleString()} ₽</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={{color: theme.subText}}>Срок до:</Text>
            <Text style={{color: theme.text, fontWeight: 'bold'}}>{paymentInfo?.deadline}</Text>
          </View>
        </View>

        {/* Детализация */}
        <View style={[styles.detailBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <DetailRow label="Общая сумма (год)" value={`${paymentInfo?.total_contract.toLocaleString()} ₽`} theme={theme} />
          <DetailRow label="Оплачено" value={`${paymentInfo?.paid_amount.toLocaleString()} ₽`} theme={theme} color="#4CAF50" />
          <DetailRow label="Период" value={paymentInfo?.semester_info} theme={theme} />
        </View>

        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payButtonText}>Оплатить онлайн</Text>
        </TouchableOpacity>

        <Text style={[styles.hint, { color: theme.subText }]}>
          Квитанция об оплате будет автоматически направлена в бухгалтерию университета в течение 3-х рабочих дней.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, theme, color }: any) {
  return (
    <View style={styles.detailRow}>
      <Text style={{ color: theme.subText }}>{label}</Text>
      <Text style={{ color: color || theme.text, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  balanceCard: { padding: 25, borderRadius: 24, borderWidth: 1, marginBottom: 20 },
  balanceLabel: { fontSize: 14, color: '#FF9800', fontWeight: '600', textTransform: 'uppercase' },
  balanceValue: { fontSize: 36, fontWeight: 'bold', marginVertical: 10, color: '#333' }, // На светлом фоне текст темный
  divider: { height: 1, backgroundColor: 'rgba(255, 152, 0, 0.2)', marginVertical: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  detailBox: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 15 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  payButton: { backgroundColor: '#FF9800', padding: 18, borderRadius: 18, alignItems: 'center', marginTop: 30 },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  hint: { textAlign: 'center', marginTop: 20, fontSize: 12, lineHeight: 18, paddingHorizontal: 20 }
});