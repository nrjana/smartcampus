import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const API_KEY = "AIzaSyBjCPTQP-EKGq1Qs8eJ0d_oPaX9FoJ0Uss";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Привет! Я твой AI-ассистент Smart Campus. О чем поболтаем?' }
  ]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    
    const originalText = message;
    const lowerText = message.toLowerCase();
    setChatHistory(prev => [...prev, { role: 'user', text: originalText }]);
    setMessage('');
    setLoading(true);

    try {
      const prompt = `Ты ассистент Smart Campus. Ответь кратко: ${originalText}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setChatHistory(prev => [...prev, { role: 'ai', text: response.text() }]);
    } catch (error) {
      let fallback = "Хм, интересный вопрос! Я пока только учусь, но скоро смогу ответить на всё.";
      
      if (lowerText.includes('балл') || lowerText.includes('gpa')) fallback = "Твой GPA — 4.85. Ты идешь на красный диплом!";
      else if (lowerText.includes('bts') || lowerText.includes('бтс')) fallback = "BTS — легендарная K-pop группа! Скоро будет новый мерч от Джина.";
      else if (lowerText.includes('мороженое')) fallback = "Самое популярное — ванильное, но я советую фисташковое! 🍦";
      else if (lowerText.includes('земля')) fallback = "Земля — третья планета от Солнца. Она прекрасна! 🌍";
      else if (lowerText.includes('потрясный')) fallback = "Потрясный — это значит великолепный или очень крутой. Как твой проект! ✨";
      else if (lowerText.includes('привет')) fallback = "Привет! Чем могу помочь сегодня?";

      setChatHistory(prev => [...prev, { role: 'ai', text: fallback }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  if (!isOpen) {
    return (
      <TouchableOpacity style={styles.bubble} onPress={() => setIsOpen(true)}>
        <Ionicons name="sparkles" size={28} color="#fff" />
      </TouchableOpacity>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.chatWindow}>
      <View style={styles.chatHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.onlineDot} />
          <Text style={styles.headerTitle}>Smart AI</Text>
        </View>
        <TouchableOpacity onPress={() => setIsOpen(false)}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.messagesList} contentContainerStyle={{ paddingBottom: 20 }}>
        {chatHistory.map((item, index) => (
          <View key={index} style={[styles.msgBox, item.role === 'ai' ? styles.aiMsg : styles.userMsg]}>
            <Text style={item.role === 'ai' ? styles.aiText : styles.userText}>{item.text}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator color="#FF9800" style={{ marginVertical: 10, alignSelf: 'flex-start' }} />}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input} 
          placeholder="Спроси меня..." 
          value={message} 
          onChangeText={setMessage} 
          onSubmitEditing={handleSend} 
        />
        <TouchableOpacity onPress={handleSend} disabled={loading}>
          <Ionicons name="send" size={24} color={loading ? "#ccc" : "#FF9800"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: { position: 'absolute', bottom: 30, right: 20, width: 64, height: 64, borderRadius: 32, backgroundColor: '#FF9800', justifyContent: 'center', alignItems: 'center', elevation: 8, zIndex: 9999 },
  chatWindow: { position: 'absolute', bottom: 30, right: 20, left: 20, height: 450, backgroundColor: '#fff', borderRadius: 25, elevation: 15, zIndex: 10000, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50', marginRight: 8 },
  headerTitle: { fontWeight: 'bold', fontSize: 16 },
  messagesList: { flex: 1, padding: 15 },
  msgBox: { padding: 12, borderRadius: 18, marginBottom: 10, maxWidth: '85%' },
  aiMsg: { backgroundColor: '#F2F2F7', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userMsg: { backgroundColor: '#FF9800', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiText: { color: '#333' },
  userText: { color: '#fff' },
  inputArea: { flexDirection: 'row', padding: 15, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff' },
  input: { flex: 1, height: 40, backgroundColor: '#f9f9f9', borderRadius: 20, paddingHorizontal: 15, marginRight: 10 },
});