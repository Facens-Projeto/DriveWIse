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
          modificacoes,
        },
        condutor: {
          estilo,
          ruas,
          frequencia,
          estado,
          cidade,
        },
        count: 0,
        avgEfficiency: {
              gasolina: 0,
    alcool: 0,
    diesel: 0
        },
      };

      await cadastrarVeiculoMongo(cadastro);

      Alert.alert('Sucesso', 'Cadastro salvo online com sucesso!');
      limpar();
      navigation.replace('Main');
    } catch (e) {
      console.error('Erro ao salvar cadastro online:', e);
      Alert.alert('Erro', 'Não foi possível salvar o cadastro online.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container}>
        <View style={styles.topBanner}>
          <Text style={styles.bannerText}>👋 Bem-vindo ao DriveWise</Text>
          <Image source={require('../assets/img1.png')} style={styles.bannerLogo} />
        </View>

        <Text style={styles.sectionTitle}>🚗 Informações do veículo</Text>
        <Text style={styles.label}>Marca</Text>
        <View style={styles.buttonGroup}>
          {Object.keys(MARCAS).map(m => (
            <TouchableOpacity key={m} style={[styles.optionButton, marca === m && styles.selected]} onPress={() => { setMarca(m); setModelo(''); }}>
              <Text style={styles.optionText}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Modelo</Text>
        <View style={styles.buttonGroup}>
          {MARCAS[marca]?.map(mod => (
            <TouchableOpacity key={mod} style={[styles.optionButton, modelo === mod && styles.selected]} onPress={() => setModelo(mod)}>
              <Text style={styles.optionText}>{mod}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Ano</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={ano} onChangeText={setAno} placeholder="Ex: 2020" placeholderTextColor="#888" />

        <Text style={styles.label}>Quilometragem Atual</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={kmAtual} onChangeText={(t) => setKmAtual(formatarKM(t))} placeholder="Ex: 35.000" placeholderTextColor="#888" />

        <Text style={styles.label}>Combustíveis Aceitos</Text>
        <View style={styles.buttonGroup}>
          {COMBUSTIVEIS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.optionButton, combustiveis.includes(c) && styles.selected]}
              onPress={() => toggleCombustivel(c)}
            >
              <Text style={styles.optionText}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Modificações (opcional)</Text>
        <TextInput style={styles.input} value={modificacoes} onChangeText={setModificacoes} placeholder="Suspensão, rodas, etc." placeholderTextColor="#888" />

        <Text style={styles.sectionTitle}>Perfil do Condutor</Text>

        <Text style={styles.label}>Estilo de Condução</Text>
        {[
          { label: 'Dona Neusa', desc: 'Anda abaixo da média e não acelera quase nunca.' },
          { label: 'Figurante', desc: 'Nada além da média, medíocre, indiferente.' },
          { label: 'Protagonista', desc: 'Se acha o Braia, dirige como se tivesse vida extra.' },
        ].map(op => (
          <TouchableOpacity key={op.label} style={[styles.button, estilo === op.label && styles.buttonSelected]} onPress={() => setEstilo(op.label)}>
            <Text style={styles.buttonText}>{`${op.label} — ${op.desc}`}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.label}>Tipo de Ruas</Text>
        {['Bem asfaltadas', 'Irregulares', 'Cheias de Buracos'].map(r => (
          <TouchableOpacity key={r} style={[styles.button, ruas === r && styles.buttonSelected]} onPress={() => setRuas(r)}>
            <Text style={styles.buttonText}>{r}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.label}>Frequência de Viagens</Text>
        {['Nunca', 'Baixa (1-2x/mês)', 'Média (2-5x/mês)', 'Alta (+10x/mês)'].map(f => (
          <TouchableOpacity key={f} style={[styles.button, frequencia === f && styles.buttonSelected]} onPress={() => setFrequencia(f)}>
            <Text style={styles.buttonText}>{f}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.label}>Estado</Text>
        <TextInput style={styles.input} value={estado} onChangeText={setEstado} placeholder="SP, RJ, MG..." placeholderTextColor="#888" />

        <Text style={styles.label}>Cidade</Text>
        <TextInput style={styles.input} value={cidade} onChangeText={setCidade} placeholder="São Paulo, Belo Horizonte..." placeholderTextColor="#888" />

        <TouchableOpacity style={styles.saveButton} onPress={salvarCadastro}>
          <Text style={styles.saveButtonText}>Salvar Cadastro</Text>
        </TouchableOpacity>
      </ScrollView>
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
  button: { borderWidth: 1, borderColor: '#777', borderRadius: 10, padding: 10, backgroundColor: '#1e1e1e', marginTop: 6 },
  buttonText: { color: '#fff', fontSize: 14 },
  buttonSelected: { backgroundColor: '#7e54f6', borderColor: '#a27bff' },
  saveButton: { backgroundColor: '#7e54f6', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
