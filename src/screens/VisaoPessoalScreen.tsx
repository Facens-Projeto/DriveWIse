import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { signOut, getUserId } from '../services/firebase';
import { buscarVeiculosDoUsuario } from '../services/veiculosService';

const VisaoPessoalScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Main'>>();
  const [carro, setCarro] = useState<any>(null);
  const [condutor, setCondutor] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const carregarDados = async () => {
        const uid = await getUserId();
        if (!uid) {
          Alert.alert('Erro', 'Usuário não autenticado.');
          return;
        }

        const veiculos = await buscarVeiculosDoUsuario(uid);
        if (veiculos.length > 0) {
          const { veiculo, condutor } = veiculos[0];
          setCarro({
            marca: veiculo.marca,
            modelo: veiculo.modelo,
            ano: veiculo.ano,
            quilometragem: veiculo.quilometragem,
          });
          setCondutor(condutor);
        }
      };

      carregarDados();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <ScrollView
        contentContainerStyle={[styles.container, { flexGrow: 1, paddingBottom: 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar barStyle="light-content" backgroundColor="#7e54f6" />
        <View style={styles.header}>
          <Text style={styles.headerText}>Visão Pessoal</Text>
          <Image source={require('../assets/img1.png')} style={styles.logo} />
        </View>

        {carro && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Veículo</Text>
            <Text style={styles.cardContent}>🚗 {carro.marca} {carro.modelo} ({carro.ano})</Text>
            <Text style={styles.cardContent}>📍 Quilometragem: {carro.quilometragem.toLocaleString('pt-BR')} km</Text>
          </View>
        )}

        {condutor && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Condutor</Text>
            <Text style={styles.cardContent}>👤 Estilo: {condutor.estilo}</Text>
            <Text style={styles.cardContent}>🏙️ Ruas: {condutor.ruas}</Text>
            <Text style={styles.cardContent}>🚗 Frequência: {condutor.frequencia}</Text>
            <Text style={styles.cardContent}>📍 Cidade: {condutor.cidade} - {condutor.estado}</Text>
          </View>
        )}

        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: '#444', marginBottom: 12 }]}
            onPress={() => Alert.alert('Aviso', 'Com MongoDB, os dados locais não precisam mais ser apagados.')}
          >
            <Text style={[styles.logoutText, { color: '#fff' }]}>Apagar Dados Locais</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              await signOut();
              navigation.replace('Login');
            }}
          >
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#7e54f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardContent: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  logoutButton: {
    backgroundColor: '#1e1e1e',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VisaoPessoalScreen;
