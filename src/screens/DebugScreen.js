import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DebugScreen({ navigation }) {
  const [dados, setDados] = useState({});

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const cadastro = await AsyncStorage.getItem('@cadastro_usuario');
    const abastecimentos = await AsyncStorage.getItem('@abastecimentos');

    setDados({
      cadastro: cadastro ? JSON.parse(cadastro) : {},
      abastecimentos: abastecimentos ? JSON.parse(abastecimentos) : [],
    });
  };

  const resetar = async () => {
    await AsyncStorage.removeItem('@cadastro_usuario');
    await AsyncStorage.removeItem('@abastecimentos');
    Alert.alert('Dados resetados!');
    carregarDados();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🧪 Tela de Debug</Text>

      <TouchableOpacity style={styles.button} onPress={resetar}>
        <Text style={styles.buttonText}>🧹 Resetar dados</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={carregarDados}>
        <Text style={styles.buttonText}>🔄 Recarregar dados</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#A35CFF' }]}
        onPress={() => navigation.navigate('Cadastro')}
      >
        <Text style={styles.buttonText}>🔁 Ir para Cadastro</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>📁 Dados de Cadastro</Text>
      <Text style={styles.debugText}>{JSON.stringify(dados.cadastro, null, 2)}</Text>

      <Text style={styles.sectionTitle}>⛽ Histórico de Abastecimentos</Text>
      <Text style={styles.debugText}>{JSON.stringify(dados.abastecimentos, null, 2)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0A0A0A',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#A35CFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  debugText: {
    color: '#CCC',
    fontSize: 12,
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 6,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
  },
});
