import React from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../constants/context/ThemeContext';

// Данные корпусов (можно менять на любые адреса)
const CAMPUS_DATA = [
  {
    id: '1',
    name: 'Главный учебный корпус',
    address: 'ул. Университетская, д. 10',
    description: 'Здесь находятся деканат, главная библиотека и коворкинг для студентов.',
    coords: { lat: 59.9449, lon: 30.2954 },
    icon: 'business',
    color: '#E3F2FD'
  },
  {
    id: '2',
    name: 'Институт ИТ и Программирования',
    address: 'пр. Технологий, д. 42',
    description: 'Центр высоких технологий, современные компьютерные классы и VR-лаборатории.',
    coords: { lat: 59.9575, lon: 30.3082 },
    icon: 'code-working',
    color: '#F3E5F5'
  },
  {
    id: '3',
    name: 'Спортивный комплекс «Олимп»',
    address: 'ул. Спортивная, д. 5',
    description: 'Бассейн олимпийского стандарта, тренажерный зал и секция единоборств.',
    coords: { lat: 59.9215, lon: 30.3541 },
    icon: 'fitness',
    color: '#E8F5E9'
  },
  {
    id: '4',
    name: 'Студенческий Медиа-центр',
    address: 'наб. Креативная, д. 12',
    description: 'Студия звукозаписи, фотозона и зал для проведения мероприятий.',
    coords: { lat: 59.9320, lon: 30.3450 },
    icon: 'megaphone',
    color: '#FFF3E0'
  }
];

export default function CampusScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();

  const openMap = (lat: number, lon: number, label: string) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lon}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Карта кампуса</Text>
      </View>

      <FlatList
        data={CAMPUS_DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => openMap(item.coords.lat, item.coords.lon, item.name)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={28} color="#0055bb" />
            </View>
            
            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.address, { color: theme.subText }]}>
                <Ionicons name="location-outline" size={12} /> {item.address}
              </Text>
              <Text style={[styles.desc, { color: theme.subText }]} numberOfLines={2}>
                {item.description}
              </Text>
            </View>

            <View style={styles.mapAction}>
              <Ionicons name="navigate-circle" size={32} color="#0055bb" />
              <Text style={styles.mapActionText}>Путь</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { padding: 5 },
  title: { fontSize: 24, fontWeight: 'bold', marginLeft: 10 },
  card: { 
    flexDirection: 'row', 
    padding: 16, 
    borderRadius: 24, 
    marginBottom: 16, 
    borderWidth: 1, 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3 
  },
  iconBox: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15, paddingRight: 5 },
  name: { fontSize: 16, fontWeight: '700' },
  address: { fontSize: 13, marginTop: 3, fontWeight: '500' },
  desc: { fontSize: 12, marginTop: 6, lineHeight: 16 },
  mapAction: { alignItems: 'center', justifyContent: 'center' },
  mapActionText: { fontSize: 10, color: '#0055bb', fontWeight: 'bold', marginTop: 2 }
});