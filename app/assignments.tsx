import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  SafeAreaView, 
  ActivityIndicator, 
  TouchableOpacity,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../constants/supabase';
import { useRouter } from 'expo-router';
import { useTheme } from '../constants/context/ThemeContext';

export default function AssignmentsScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  
  // Состояния модального окна
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isFileAttached, setIsFileAttached] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    try {
      setLoading(true);
      const { data } = await supabase.from('assignments').select('*').order('deadline', { ascending: true });
      setTasks(data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenUpload = (task: any) => {
    setSelectedTask(task);
    setIsFileAttached(false);
    setIsConfirming(false);
    setIsSuccess(false);
    setUploadModalVisible(true);
  };

  const handleFinalSubmit = () => {
    // Вместо алерта переходим к финальному успеху
    setIsSuccess(true);
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'todo': return { color: '#FF9500', bg: isDarkMode ? '#332510' : '#FFF9F0', text: 'Нужно сдать' };
      case 'submitted': return { color: '#007AFF', bg: isDarkMode ? '#102533' : '#F0F7FF', text: 'На проверке' };
      case 'graded': return { color: '#34C759', bg: isDarkMode ? '#113310' : '#F2FBF4', text: 'Проверено' };
      default: return { color: '#8E8E93', bg: '#F2F2F7', text: 'В архиве' };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      
      <Modal animationType="fade" transparent={true} visible={uploadModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalView, { backgroundColor: theme.card }]}>
            
            {/* ЭТАП 3: УСПЕШНО */}
            {isSuccess ? (
              <View style={styles.centerItems}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark-sharp" size={50} color="#fff" />
                </View>
                <Text style={[styles.modalTitle, { color: theme.text, marginTop: 20 }]}>Успешно!</Text>
                <Text style={[styles.modalSub, { color: theme.subText, textAlign: 'center' }]}>
                  Ваша работа по предмету "{selectedTask?.subject}" была успешно отправлена.
                </Text>
                <TouchableOpacity 
                  style={[styles.submitBtn, { width: '100%', backgroundColor: '#34C759', marginTop: 10 }]} 
                  onPress={() => setUploadModalVisible(false)}
                >
                  <Text style={styles.submitBtnText}>Отлично</Text>
                </TouchableOpacity>
              </View>
            ) : isConfirming ? (
              /* ЭТАП 2: ПОДТВЕРЖДЕНИЕ */
              <View style={styles.centerItems}>
                <Ionicons name="help-circle-outline" size={60} color="#9C27B0" />
                <Text style={[styles.modalTitle, { color: theme.text, marginTop: 10 }]}>Вы уверены?</Text>
                <Text style={[styles.modalSub, { color: theme.subText, textAlign: 'center' }]}>
                  После отправки вы не сможете изменить файл до проверки преподавателем.
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsConfirming(false)}>
                    <Text style={{color: '#666', fontWeight: '600'}}>Назад</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#9C27B0' }]} onPress={handleFinalSubmit}>
                    <Text style={styles.submitBtnText}>Да, отправить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* ЭТАП 1: ВЫБОР ФАЙЛА */
              <>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Сдача работы</Text>
                <Text style={[styles.modalSub, { color: theme.subText }]}>{selectedTask?.title}</Text>
                
                <TouchableOpacity 
                  style={[styles.attachButton, { borderColor: isFileAttached ? '#34C759' : theme.border }]} 
                  onPress={() => setIsFileAttached(true)}
                >
                  <Ionicons name={isFileAttached ? "document-attach" : "cloud-upload-outline"} size={35} color={isFileAttached ? '#34C759' : '#9C27B0'} />
                  <Text style={[styles.attachText, { color: theme.text }]}>
                    {isFileAttached ? "Документ прикреплен" : "Загрузить из файлов"}
                  </Text>
                </TouchableOpacity>

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setUploadModalVisible(false)}>
                    <Text style={{color: '#666', fontWeight: '600'}}>Отмена</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.submitBtn, { opacity: isFileAttached ? 1 : 0.6 }]} 
                    onPress={() => isFileAttached && setIsConfirming(true)}
                  >
                    <Text style={styles.submitBtnText}>Далее</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </View>
        </View>
      </Modal>

      {/* Заголовок страницы */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Сдача работ</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#9C27B0" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const status = getStatusStyle(item.status);
            return (
              <View style={[styles.taskCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.taskHeader}>
                  <Text style={styles.subjectText}>{item.subject}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                  </View>
                </View>
                <Text style={[styles.taskTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.description, { color: theme.subText }]}>{item.description}</Text>
                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                  <Text style={styles.deadlineText}>Срок: {item.deadline}</Text>
                  {item.status === 'todo' && (
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenUpload(item)}>
                      <Text style={styles.actionButtonText}>Сдать</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  taskCard: { marginHorizontal: 20, marginBottom: 15, padding: 20, borderRadius: 24, borderWidth: 1 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  subjectText: { fontSize: 11, fontWeight: '800', color: '#9C27B0' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  taskTitle: { fontSize: 17, fontWeight: 'bold' },
  description: { fontSize: 13, marginTop: 5, lineHeight: 18 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 12, borderTopWidth: 1 },
  deadlineText: { fontSize: 12, color: '#FF3B30', fontWeight: '600' },
  actionButton: { backgroundColor: '#9C27B0', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 12 },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalView: { width: '85%', borderRadius: 32, padding: 25, elevation: 20 },
  centerItems: { alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalSub: { fontSize: 14, marginVertical: 15 },
  attachButton: { width: '100%', height: 130, borderStyle: 'dashed', borderWidth: 2, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(156, 39, 176, 0.03)', marginBottom: 20 },
  attachText: { marginTop: 10, fontSize: 14 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  submitBtn: { flex: 1, backgroundColor: '#9C27B0', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold' },
  successIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#34C759', justifyContent: 'center', alignItems: 'center' }
});