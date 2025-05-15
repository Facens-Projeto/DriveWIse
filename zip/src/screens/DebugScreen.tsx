import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';


type Cadastro = {
  veiculo: {
    marca: string;
    modelo: string;
    ano?: number;
    quilometragem: number;
    combustiveisAceitos: string[];
    modificacoes?: string;
  };
  condutor: {
    estilo: string;
    ruas: string;
    frequencia: string;
    estado: string;
    cidade: string;
  };
};

type Abastecimento = {
  data: string;
  total: number;
  litros: number;
  km: number;
  tipo: string;
};

type RootStackParamList = {
  Cadastro: undefined;
};

export default function DebugScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [dados, setDados] = useState<{
    cadastro: Cadastro | null;
    abastecimentos: Abastecimento[];
  }>({
    cadastro: null,
    abastecimentos: [],
  });

  const carregarDados = async () => {
    const cadastro = await AsyncStorage.getItem('@cadastro_usuario');
    const abastecimentos = await AsyncStorage.getItem('@abastecimentos');

    setDados({
      cadastro: cadastro ? JSON.parse(cadastro) : null,
      abastecimentos: abastecimentos ? JSON.parse(abastecimentos) : [],
    });
  };

  const resetar = async () => {
    await AsyncStorage.removeItem('@cadastro_usuario');
    await AsyncStorage.removeItem('@abastecimentos');
    Alert.alert('Dados resetados!');
    carregarDados();
  };

  useEffect(() => {
    carregarDados();
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
           <ScrollView
                  contentContainerStyle={styles.container}
                  keyboardShouldPersistTaps="handled"
                >
          {/* Cabeçalho roxo com texto e logo */}
          <View style={styles.topBanner}>
            <Text style={styles.bannerText}>🐞 Tela de Debug</Text>
            <Image source={require('../assets/img1.png')} style={styles.bannerLogo} resizeMode="contain" />
          </View>

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
          <Text style={styles.debugText}>
            {JSON.stringify(dados.cadastro, null, 2)}
          </Text>

          <Text style={styles.sectionTitle}>⛽ Histórico de Abastecimentos</Text>
          <Text style={styles.debugText}>
            {JSON.stringify(dados.abastecimentos, null, 2)}
          </Text>
        </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0A0A0A',
    flexGrow: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 48,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#A35CFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  bannerLogo: {
    width: 50,
    height: 50,
    marginLeft: 12,
  },
  bannerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 6,
    fontWeight: 'bold',
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
