import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../constants/supabase';
import { useRouter } from 'expo-router';
import { useTheme } from '../constants/context/ThemeContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifs();
  }, []);

  async function fetchNotifs() {
    try {
      setLoading(true);
      const { data: profile } = await supabase.from('profiles').select('id').limit(1).single();
      if (profile) {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false });
        setNotifs(data || []);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <View style={[styles.center, { backgroundColor: theme.bg }]}><ActivityIndicator size="large" color="#F44336" /></View>;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Уведомления</Text>
      </View>

      <FlatList
        data={notifs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.cardDesc, { color: theme.subText }]}>{item.message}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.subText }]}>У вас пока нет уведомлений</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  card: { 
    marginHorizontal: 20, 
    marginVertical: 10, 
    padding: 20, 
    borderRadius: 20, 
    borderWidth: 1,
    elevation: 2
  },
  cardTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 6 },
  cardDesc: { fontSize: 14, lineHeight: 20 },
  emptyText: { textAlign: 'center', marginTop: 50 }
});