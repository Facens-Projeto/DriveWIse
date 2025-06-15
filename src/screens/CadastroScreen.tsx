// src/screens/CadastroScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { getUserId } from '../services/firebase';
import { cadastrarVeiculoMongo } from '../services/veiculosService';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

const COMBUSTIVEIS = ['Gasolina', 'Álcool', 'Diesel'];
const MARCAS: Record<string, string[]> = {
  Fiat: ['Uno', 'Argo', 'Toro', 'Mobi'],
  Chevrolet: ['Onix', 'Tracker', 'S10', 'Spin'],
  Volkswagen: ['Gol', 'Polo', 'Virtus', 'T-Cross'],
  Toyota: ['Corolla', 'Hilux', 'Yaris', 'Etios'],
  Ford: ['Ka', 'EcoSport', 'Ranger', 'Fusion'],
  Renault: ['Kwid', 'Duster', 'Logan', 'Sandero'],
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cadastro'>;

export default function CadastroScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [kmAtual, setKmAtual] = useState('');
  const [modificacoes, setModificacoes] = useState('');
  const [combustiveis, setCombustiveis] = useState<string[]>([]);
  const [estilo, setEstilo] = useState('');
  const [ruas, setRuas] = useState('');
  const [frequencia, setFrequencia] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');

  const toggleCombustivel = (tipo: string) => {
    setCombustiveis(prev =>
      prev.includes(tipo) ? prev.filter(c => c !== tipo) : [...prev, tipo]
    );
  };

  const formatarKM = (valor: string) =>
    valor.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const limpar = () => {
    setMarca('');
    setModelo('');
    setAno('');
    setKmAtual('');
    setModificacoes('');
    setCombustiveis([]);
    setEstilo('');
    setRuas('');
    setFrequencia('');
    setEstado('');
    setCidade('');
  };

  const salvarCadastro = async () => {
    try {
      if (!marca || !modelo || !ano || !kmAtual || !combustiveis.length || !estilo || !ruas || !frequencia || !estado || !cidade) {
        Alert.alert('Preencha todos os campos obrigatórios!');
        return;
      }

      const uid = await getUserId();
      if (!uid) {
        Alert.alert('Usuário não autenticado');
        return;
      }

      const cadastro = {
        uid,
        veiculo: {
          marca,
          modelo,
          ano: parseInt(ano, 10),
          quilometragem: parseInt(kmAtual.replace(/\./g, ''), 10),
          combustiveisAceitos: combustiveis,
          modificacoes
        },
        condutor: {
          estilo,
          ruas,
          frequencia,
          estado,
          cidade
        },
        count: 0,
        avgEfficiency: {}
      };

      await cadastrarVeiculoMongo(cadastro);

      navigation.replace('Main');
      Alert.alert('Sucesso', 'Cadastro salvo no MongoDB!');
      limpar();
    } catch (e) {
      console.error('Erro ao salvar no MongoDB:', e);
      Alert.alert('Erro ao salvar no MongoDB. Verifique os dados.');
    }
  };

  return (
    // ... (restante do JSX permanece igual)
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* JSX não alterado */}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 48,
    backgroundColor: '#121212',
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
  bannerText: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 },
  bannerLogo: { width: 50, height: 50, marginLeft: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10, color: '#fff' },
  label: { fontSize: 16, fontWeight: '500', marginTop: 12, marginBottom: 4, color: '#ccc' },
  input: { borderWidth: 1, borderColor: '#555', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#1e1e1e', color: '#fff' },
  buttonGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  optionButton: { borderWidth: 1, borderColor: '#777', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, marginTop: 4, backgroundColor: '#222' },
  optionText: { color: '#fff' },
  selected: { backgroundColor: '#7e54f6', borderColor: '#a27bff' },
  saveButton: { backgroundColor: '#7e54f6', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  button: { backgroundColor: '#1e1e1e', padding: 12, borderRadius: 8, marginVertical: 4, borderWidth: 1, borderColor: '#555' },
  buttonSelected: { backgroundColor: '#7e54f6', borderColor: '#a27bff' },
  buttonText: { color: '#fff', fontSize: 14 },
});
