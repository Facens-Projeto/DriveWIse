import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function VisaoPessoalScreen() {
  const [dados, setDados] = useState([]);
  const [carro, setCarro] = useState({});
  const [atualizado, setAtualizado] = useState(false);

  const carregarDados = async () => {
    const historico = await AsyncStorage.getItem('@abastecimentos');
    if (historico) {
      const dadosOrdenados = JSON.parse(historico).sort(
        (a, b) => new Date(b.data) - new Date(a.data)
      );
      setDados(dadosOrdenados);
    }

    const cadastro = await AsyncStorage.getItem('@cadastro_usuario');
    if (cadastro) {
      setCarro(JSON.parse(cadastro));
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [atualizado])
  );

  const totalGasto = dados.reduce((acc, item) => acc + item.total, 0);
  const totalLitros = dados.reduce((acc, item) => acc + item.litros, 0);
  const kmInicial = dados.length > 1 ? dados[dados.length - 1].km : null;
  const kmFinal = dados.length > 0 ? dados[0].km : null;
  const kmRodados = kmInicial !== null ? kmFinal - kmInicial : null;
  const consumoMedio = kmRodados && totalLitros > 0 ? kmRodados / totalLitros : null;
  const custoPorKm = kmRodados ? totalGasto / kmRodados : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>📊 Visão Pessoal</Text>
        <Image
          source={require('../../assets/img1.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {carro.marca && (
        <Text style={styles.carroNome}>
          {carro.marca} {carro.modelo} {carro.ano && `(${carro.ano})`}
        </Text>
      )}

      <View style={styles.resumoBox}>
        <ResumoItem label="Consumo médio" value={consumoMedio ? `${consumoMedio.toFixed(2)} km/L` : '—'} />
        <ResumoItem label="Custo por km" value={custoPorKm ? `R$ ${custoPorKm.toFixed(2)}` : '—'} />
        <ResumoItem label="Total gasto" value={`R$ ${totalGasto.toFixed(2)}`} />
        <ResumoItem label="Total litros" value={`${totalLitros.toFixed(2)} L`} />
      </View>

      <TouchableOpacity
        style={styles.botaoRecarregar}
        onPress={() => setAtualizado(!atualizado)}
      >
        <Text style={styles.botaoRecarregarTexto}>🔄 Recarregar</Text>
      </TouchableOpacity>

      <Text style={styles.historicoTitulo}>Histórico de Abastecimentos</Text>

      {dados.length === 0 ? (
        <Text style={styles.vazio}>Nenhum dado registrado.</Text>
      ) : (
        dados.map((item, index) => {
          const data = new Date(item.data).toLocaleDateString('pt-BR');
          return (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTexto}>🗓 {data}</Text>
              <Text style={styles.cardTexto}>⛽ Combustível: {item.tipoCombustivel}</Text>
              <Text style={styles.cardTexto}>💵 Preço: R$ {item.preco.toFixed(2)}</Text>
              <Text style={styles.cardTexto}>🧪 Litros: {item.litros.toFixed(2)} L</Text>
              <Text style={styles.cardTexto}>🚗 KM: {item.km.toLocaleString('pt-BR')}</Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

function ResumoItem({ label, value }) {
  return (
    <View style={styles.resumoItem}>
      <Text style={styles.resumoLabel}>{label}</Text>
      <Text style={styles.resumoValor}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0A0A0A',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#A35CFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  logo: {
    width: 50,
    height: 50,
  },
  carroNome: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  resumoBox: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  resumoItem: {
    marginBottom: 12,
  },
  resumoLabel: {
    color: '#AAA',
    fontSize: 13,
  },
  resumoValor: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historicoTitulo: {
    color: '#A35CFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardTexto: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 2,
  },
  vazio: {
    color: '#AAA',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  botaoRecarregar: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 20,
  },
  botaoRecarregarTexto: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
