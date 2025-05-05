import { KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COMBUSTIVEIS = ['Gasolina', 'Álcool', 'Diesel'];

const MARCAS = {
  Fiat: ['Uno', 'Argo', 'Toro', 'Mobi'],
  Chevrolet: ['Onix', 'Tracker', 'S10', 'Spin'],
  Volkswagen: ['Gol', 'Polo', 'Virtus', 'T-Cross'],
  Toyota: ['Corolla', 'Hilux', 'Yaris', 'Etios'],
  Ford: ['Ka', 'EcoSport', 'Ranger', 'Fusion'],
  Renault: ['Kwid', 'Duster', 'Logan', 'Sandero'],
};

export default function CadastroScreen({ navigation }) {
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [kmAtual, setKmAtual] = useState('');
  const [modificacoes, setModificacoes] = useState('');
  const [combustiveis, setCombustiveis] = useState([]);

  const [estilo, setEstilo] = useState('');
  const [ruas, setRuas] = useState('');
  const [frequencia, setFrequencia] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');

  const toggleCombustivel = (tipo) => {
    setCombustiveis((prev) =>
      prev.includes(tipo) ? prev.filter((c) => c !== tipo) : [...prev, tipo]
    );
  };

  const formatarKM = (valor) => {
    const num = valor.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const salvarCadastro = async () => {
    if (!marca || !modelo || !ano || !kmAtual || combustiveis.length === 0 || !estilo || !ruas || !frequencia || !estado || !cidade) {
      Alert.alert('Preencha todos os campos obrigatórios');
      return;
    }

    const dadosCadastro = {
      marca,
      modelo,
      ano,
      kmAtual: parseInt(kmAtual.replace(/\./g, '')),
      modificacoes,
      combustiveisAceitos: combustiveis,
      estilo,
      ruas,
      frequencia,
      estado,
      cidade,
    };

    try {
      await AsyncStorage.setItem('@cadastro_usuario', JSON.stringify(dadosCadastro));
      Alert.alert('Cadastro salvo com sucesso!');
      navigation.navigate('Abastecimento');
    } catch (e) {
      Alert.alert('Erro ao salvar os dados.');
      console.error(e);
    }
  };

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.welcome}>👋 Bem-vindo ao DriveWise</Text>
        <Image source={require('../../assets/img1.png')} style={styles.logo} resizeMode="contain" />
      </View>

      <Text style={styles.sectionTitle}>🚗 Informações do veículo</Text>

      <Text style={styles.label}>Marca</Text>
      <View style={styles.buttonGroup}>
        {Object.keys(MARCAS).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.button, marca === m && styles.buttonSelected]}
            onPress={() => {
              setMarca(m);
              setModelo('');
            }}
          >
            <Text style={styles.buttonText}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {marca ? (
        <>
          <Text style={styles.label}>Modelo</Text>
          <View style={styles.buttonGroup}>
            {MARCAS[marca].map((mod) => (
              <TouchableOpacity
                key={mod}
                style={[styles.button, modelo === mod && styles.buttonSelected]}
                onPress={() => setModelo(mod)}
              >
                <Text style={styles.buttonText}>{mod}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Ano de fabricação"
        placeholderTextColor="#CCC"
        keyboardType="numeric"
        value={ano}
        onChangeText={setAno}
      />

      <TextInput
        style={styles.input}
        placeholder="Quilometragem atual"
        placeholderTextColor="#CCC"
        keyboardType="numeric"
        value={kmAtual}
        onChangeText={(text) => setKmAtual(formatarKM(text))}
      />

      <TextInput
        style={styles.input}
        placeholder="Modificações (opcional)"
        placeholderTextColor="#CCC"
        value={modificacoes}
        onChangeText={setModificacoes}
      />

      <Text style={styles.label}>Tipo de Combustível Aceito*</Text>
      <View style={styles.buttonGroup}>
        {COMBUSTIVEIS.map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[styles.button, combustiveis.includes(tipo) && styles.buttonSelected]}
            onPress={() => toggleCombustivel(tipo)}
          >
            <Text style={styles.buttonText}>{tipo}</Text>
          </TouchableOpacity>
        ))}
      </View>

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

      <TextInput
        style={styles.input}
        placeholder="Estado"
        placeholderTextColor="#CCC"
        value={estado}
        onChangeText={setEstado}
      />

      <TextInput
        style={styles.input}
        placeholder="Cidade"
        placeholderTextColor="#CCC"
        value={cidade}
        onChangeText={setCidade}
      />

      <TouchableOpacity style={styles.saveButton} onPress={salvarCadastro}>
        <Text style={styles.saveText}>Salvar e Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#0A0A0A',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#A35CFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  welcome: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  logo: {
    width: 60,
    height: 60,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFF',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#222',
    color: '#FFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  label: {
    color: '#FFF',
    fontWeight: '500',
    marginBottom: 6,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#333',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A35CFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  buttonSelected: {
    backgroundColor: '#A35CFF',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#A35CFF',
    padding: 14,
    borderRadius: 6,
    marginTop: 24,
  },
  saveText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
