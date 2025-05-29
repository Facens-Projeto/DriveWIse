// src/screens/FinanceiroScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid'; 
import { Expense } from '../models/Expense';
import { SafeAreaView } from 'react-native-safe-area-context';


const EXPENSES_KEY = '@drivewise:expenses';


export default function FinanceiroScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do modal de lançamento manual
  const [modalVisible, setModalVisible] = useState(false);
  const [manTitle, setManTitle] = useState('');
  const [manValue, setManValue] = useState('');
  const [manDate, setManDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Carrega despesas do AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(EXPENSES_KEY);
        const saved: Expense[] = json ? JSON.parse(json) : [];
        setExpenses(saved);
      } catch (e) {
        console.error('Erro lendo despesas:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);


useEffect(() => {
  if (!loading) {
    (async () => {
      try {
        // serializa com toJSON() para garantir consistência
        const raw = expenses.map(e => e.toJSON());
        await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(raw));
      } catch (e) {
        console.error('Erro salvando despesas:', e);
      }
    })();
  }
}, [expenses, loading]);

// Funções para cálculo de totais
const sumSince = (since: Date): number =>
  expenses
    .filter(e => new Date(e.date) >= since)
    .reduce((acc, e) => acc + e.value, 0);

const now = new Date();
const total     = sumSince(new Date(0));
const lastWeek  = sumSince(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
const lastMonth = sumSince(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
const sinceYear = sumSince(new Date(now.getFullYear(), 0, 1));

// Formata em R$
const fmt = (v: number): string =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Handling modal
const openModal = () => {
  setManTitle('');
  setManValue('');
  setManDate(new Date());
  setModalVisible(true);
};

const saveManual = () => {
  if (!manTitle.trim() || !manValue.trim() || isNaN(Number(manValue))) {
    Alert.alert('Erro', 'Preencha título e valor válidos.');
    return;
  }

  // cria instância de Expense
  const novo = new Expense(
    uuidv4(),
    manDate.toISOString(),
    manTitle.trim(),
    parseFloat(manValue),
    'manual'
  );

  setExpenses(prev => [novo, ...prev]);
  setModalVisible(false);
};

// Render item histórico
const renderItem = ({ item }: { item: Expense }) => {
  const dateStr = new Date(item.date).toLocaleDateString('pt-BR');
  const title   = item.type === 'manual' ? item.title : 'Abastecimento';

  return (
    <View style={styles.item}>
      <Text style={styles.itemDate}>{dateStr}</Text>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemValue}>{fmt(item.value)}</Text>
    </View>
  );
};

  if (loading) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
        <SafeAreaView style={styles.container}>

        
      {/* Cards de totais */}
        <View style={styles.topBanner}>
        <Text style={styles.bannerText}>💲 Painel Financeiro</Text>
        <Image source={require('../assets/img1.png')} style={styles.bannerLogo} resizeMode="contain" />
        </View>
      
      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Últ. Semana</Text>
          <Text style={styles.cardValue}>{fmt(lastWeek)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Últ. Mês</Text>
          <Text style={styles.cardValue}>{fmt(lastMonth)}</Text>
        </View>
      </View>
      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Desde Início do Ano</Text>
          <Text style={styles.cardValue}>{fmt(sinceYear)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total</Text>
          <Text style={styles.cardValue}>{fmt(total)}</Text>
        </View>
      </View>
      

      {/* Botão de adicionar manual */}
      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Text style={styles.addButtonText}>+ Lançamento Manual</Text>
      </TouchableOpacity>

      {/* Histórico */}
      <Text style={styles.historyTitle}>Histórico de Despesas</Text>
      <FlatList
        data={expenses.sort((a, b) => (a.date < b.date ? 1 : -1))}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      </SafeAreaView>

      {/* Modal de lançamento manual */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Gasto Manual</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Título"
              placeholderTextColor="#888"
              value={manTitle}
              onChangeText={setManTitle}
            />

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerButton}
            >
              <Text style={styles.datePickerText}>
                {manDate.toLocaleDateString('pt-BR')}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={manDate}
                mode="date"
                display="spinner"
                onChange={(_, d) => {
                  if (d) setManDate(d);
                  setShowDatePicker(false);
                }}
              />
            )}

            <TextInput
              style={styles.modalInput}
              placeholder="Valor (R$)"
              placeholderTextColor="#888"
              keyboardType="decimal-pad"
              value={manValue}
              onChangeText={setManValue}
            />
            

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveManual}>
                <Text style={styles.modalSave}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16, paddingTop: -10 },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  cardLabel: { color: '#FFFFFF', fontSize: 14 },
  cardValue: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  addButton: {
    backgroundColor: '#7e54f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  historyTitle: { color: '#FFFFFF', fontSize: 18, marginBottom: 8 },
  list: { paddingBottom: 80 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemDate: { color: '#CCCCCC', flex: 1 },
  itemTitle: { color: '#FFFFFF', flex: 2, textAlign: 'center' },
  itemValue: { color: '#FFFFFF', flex: 1, textAlign: 'right' },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000088',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: { color: '#FFFFFF', fontSize: 20, marginBottom: 12 },
  modalInput: {
    backgroundColor: '#121212',
    color: '#FFFFFF',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  datePickerButton: {
    backgroundColor: '#121212',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
    topBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#7e54f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  bannerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  bannerLogo: {
    width: 50,
    height: 50,
    marginLeft: 12,
  },
  datePickerText: { color: '#FFFFFF' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalCancel: { color: '#DD5555', fontSize: 16 },
  modalSave: { color: '#55DD55', fontSize: 16 },
});
