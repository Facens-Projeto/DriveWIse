import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Veiculo } from '../models/Veiculo';
import { Condutor } from '../models/Condutor';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

const COMBUSTIVEIS = ['Gasolina', 'Álcool', 'Diesel'];

const MARCAS: Record<string, string[]> = {
  Fiat: ['Uno', 'Argo', 'Toro', 'Mobi'],
  Chevrolet: ['Onix', 'Tracker', 'S10', 'Spin'],
  Volkswagen: ['Gol', 'Polo', 'Virtus', 'T-Cross'],
  Toyota: ['Corolla', 'Hilux', 'Yaris', 'Etios'],
  Ford: ['Ka', 'EcoSport', 'Ranger', 'Fusion'],
  Renault: ['Kwid', 'Duster', 'Logan', 'Sandero'],
};

type RootStackParamList = {
  Abastecimento: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Abastecimento'>;

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
    setCombustiveis((prev) =>
      prev.includes(tipo) ? prev.filter((c) => c !== tipo) : [...prev, tipo]
    );
  };

  const formatarKM = (valor: string) => {
    const num = valor.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const salvarCadastro = async () => {
    try {
      console.log('Tentando salvar cadastro...', {
        marca, modelo, ano, kmAtual, combustiveis, estilo, ruas, frequencia, estado, cidade
      });
  
      // Validação de campos obrigatórios
      if (
        !marca.trim() ||
        !modelo.trim() ||
        !ano.trim() ||
        !kmAtual.trim() ||
        combustiveis.length === 0 ||
        !estilo.trim() ||
        !ruas.trim() ||
        !frequencia.trim() ||
        !estado.trim() ||
        !cidade.trim()
      ) {
        Alert.alert('Preencha todos os campos obrigatórios!');
        return;
      }
  
      const veiculo = new Veiculo(
        marca,
        modelo,
        parseInt(ano),
        parseInt(kmAtual.replace(/\./g, '')),
        combustiveis,
        modificacoes
      );
  
      const condutor = new Condutor(estilo, ruas, frequencia, estado, cidade);

      await AsyncStorage.setItem(
        '@cadastro_usuario',
        JSON.stringify({
          veiculo: veiculo.toJSON(),
          condutor: condutor.toJSON(),
        })
      );
  
      Alert.alert('Cadastro salvo com sucesso!');
      limpar();
    } catch (e) {
      console.error('Erro ao salvar cadastro:', e);
      Alert.alert('Erro ao salvar o cadastro. Verifique os dados.');
    }
  };
  
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
  

  
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
  <View style={{ flex: 1, backgroundColor: '#121212' }}>
  <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
  <View style={styles.topBanner}>
  <Text style={styles.bannerText}>👋 Bem-vindo ao DriveWise</Text>
  <Image source={require('../assets/img1.png')} style={styles.bannerLogo} resizeMode="contain" />
</View>


    {/* Seção: Informações do veículo */}
    <Text style={styles.sectionTitle}>🚗 Informações do veículo</Text>

    <Text style={styles.label}>Marca</Text>
    <View style={styles.buttonGroup}>
      {Object.keys(MARCAS).map((m) => (
        <TouchableOpacity
          key={m}
          style={[styles.optionButton, marca === m && styles.selected]}
          onPress={() => {
            setMarca(m);
            setModelo('');
          }}
        >
          <Text style={styles.optionText}>{m}</Text>
        </TouchableOpacity>
      ))}
    </View>

    <Text style={styles.label}>Modelo</Text>
    <View style={styles.buttonGroup}>
      {MARCAS[marca]?.map((mod) => (
        <TouchableOpacity
          key={mod}
          style={[styles.optionButton, modelo === mod && styles.selected]}
          onPress={() => setModelo(mod)}
        >
         <Text style={styles.optionText}>{mod}</Text>

        </TouchableOpacity>
      ))}
    </View>

    <Text style={styles.label}>Ano de fabricação</Text>
    <TextInput
      style={styles.input}
      value={ano}
      onChangeText={setAno}
      keyboardType="numeric"
      placeholder="Ex: 2020"
      placeholderTextColor="#aaa"
    />

    <Text style={styles.label}>Quilometragem atual</Text>
    <TextInput
      style={styles.input}
      value={kmAtual}
      onChangeText={(text) => setKmAtual(formatarKM(text))}
      keyboardType="numeric"
      placeholder="Ex: 25.000"
      placeholderTextColor="#aaa"
    />

    <Text style={styles.label}>Modificações no veículo (opcional)</Text>
    <TextInput
      style={styles.input}
      value={modificacoes}
      onChangeText={setModificacoes}
      placeholder="Ex: Chip de potência, escape esportivo..."
      placeholderTextColor="#aaa"
    />

    <Text style={styles.label}>Combustíveis aceitos</Text>
    <View style={styles.buttonGroup}>
      {COMBUSTIVEIS.map((tipo) => (
        <TouchableOpacity
          key={tipo}
          style={[styles.optionButton, combustiveis.includes(tipo) && styles.selected]}
          onPress={() => toggleCombustivel(tipo)}
        >
          <Text style={styles.optionText}>{tipo}</Text>

        </TouchableOpacity>
      ))}
    </View>

    {/* Seção: Informações do condutor */}
    <Text style={styles.sectionTitle}>🧍 Informações do condutor</Text>

    <Text style={styles.label}>Estilo de condução</Text>
    {[
    { label: 'Dona Neusa', desc: 'Anda abaixo da média e não acelera quase nunca.' },
    { label: 'Figurante', desc: 'Nada além da média, medíocre, indiferente.' },
    { label: 'Protagonista', desc: 'Se acha o Braia, dirige como se tivesse vida extra.' },
    ].map((op) => (
    <TouchableOpacity
        key={op.label}
        style={[styles.button, estilo === op.label && styles.buttonSelected]}
        onPress={() => setEstilo(op.label)}
    >
        <Text style={styles.buttonText}>{`${op.label} — ${op.desc}`}</Text>
    </TouchableOpacity>
    ))}

    <Text style={styles.label}>Como são as ruas?</Text>
    {['Bem asfaltadas', 'Irregulares', 'Cheias de Buracos'].map((r) => (
    <TouchableOpacity
        key={r}
        style={[styles.button, ruas === r && styles.buttonSelected]}
        onPress={() => setRuas(r)}
    >
        <Text style={styles.buttonText}>{r}</Text>
    </TouchableOpacity>
    ))}

    <Text style={styles.label}>Frequência de viagens</Text>
    {['Nunca', 'Baixa (1-2x/mês)', 'Média (2-5x/mês)', 'Alta (+10x/mês)'].map((f) => (
    <TouchableOpacity
        key={f}
        style={[styles.button, frequencia === f && styles.buttonSelected]}
        onPress={() => setFrequencia(f)}
    >
        <Text style={styles.buttonText}>{f}</Text>
    </TouchableOpacity>
    ))}


    <Text style={styles.label}>Estado</Text>
    <TextInput
      style={styles.input}
      value={estado}
      onChangeText={setEstado}
      placeholder="Ex: SP"
      placeholderTextColor="#aaa"
    />

    <Text style={styles.label}>Cidade</Text>
    <TextInput
      style={styles.input}
      value={cidade}
      onChangeText={setCidade}
      placeholder="Ex: Sorocaba"
      placeholderTextColor="#aaa"
    />

    {/* Botão de envio */}
    <TouchableOpacity style={styles.saveButton} onPress={salvarCadastro}>
      <Text style={styles.saveButtonText}>Salvar Cadastro</Text>
    </TouchableOpacity>
  </ScrollView>
  </View>
</KeyboardAvoidingView>

  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 48,
    backgroundColor: '#121212',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
    color: '#ccc',
  },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginTop: 4,
    backgroundColor: '#222',
  },
  optionText: {
    color: '#fff',
  },

  selected: {
    backgroundColor: '#7e54f6',
    borderColor: '#a27bff',
  },
  saveButton: {
    backgroundColor: '#7e54f6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#555',
  },
  buttonSelected: {
    backgroundColor: '#7e54f6',
    borderColor: '#a27bff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
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

});

  
