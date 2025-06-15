import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { buscarTodosVeiculos } from '../services/veiculosService'; // Importa a função para buscar todos os veículos
import { useFocusEffect } from '@react-navigation/native';
import { getUserId } from '../services/firebase';
import { buscarVeiculosDoUsuario } from '../services/veiculosService';

interface CommunityStat {
  marca: string;
  modelo: string;
  cidade?: string;
  count: number;
  avgEfficiency: {
    gasolina: number;
    alcool: number;
  };
}

export default function DadosComunitariosScreen() {
  const [loading, setLoading] = useState(true);
  const [localStat, setLocalStat] = useState<CommunityStat | null>(null);
  const [globalStat, setGlobalStat] = useState<CommunityStat | null>(null);
  const [userEff, setUserEff] = useState({ gasolina: 0, alcool: 0 });

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          const uid = await getUserId();
          if (!uid) throw new Error('Usuário não autenticado');

          const dados = await buscarVeiculosDoUsuario(uid);
          const veiculo = dados[0]?.veiculo;
          const condutor = dados[0]?.condutor;
          const abastecimentos = dados[0]?.abastecimentos || [];

          if (!veiculo || !condutor) {
            Alert.alert('Perfil não encontrado', 'Por favor, cadastre seu veículo primeiro.');
            setLoading(false);
            return;
          }

          const { marca, modelo } = veiculo;
          const { cidade } = condutor;

          let eff = 0;
          const abastecimentosComEff = abastecimentos
            .filter((f: any) => f.efficiency != null)
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

          if (abastecimentosComEff.length > 0) {
            eff = abastecimentosComEff[0].efficiency;
          }
          setUserEff({ gasolina: eff, alcool: eff });

          // Obtem todos os dados da API
          const todos = await buscarTodosVeiculos();
          const allStats = todos
            .map((item: any) => ({
              marca: item.veiculo.marca,
              modelo: item.veiculo.modelo,
              cidade: item.condutor.cidade,
              avgEfficiency: {
                gasolina: item.avgEfficiency?.gasolina || 0,
                alcool: item.avgEfficiency?.alcool || 0,
              },
            }))
            .filter((s: any) =>
              s.marca.toLowerCase() === marca.toLowerCase() &&
              s.modelo.toLowerCase() === modelo.toLowerCase()
            );

          const local = allStats.filter((s: any) => s.cidade?.toLowerCase() === cidade.toLowerCase());

          if (local.length > 0) {
            const sumGas = local.reduce((sum: number, s: any) => sum + s.avgEfficiency.gasolina, 0);
            const sumAlc = local.reduce((sum: number, s: any) => sum + s.avgEfficiency.alcool, 0);
            setLocalStat({
              marca,
              modelo,
              cidade,
              count: local.length,
              avgEfficiency: {
                gasolina: sumGas / local.length,
                alcool:  sumAlc / local.length,
              },
            });
          } else {
            setLocalStat(null);
          }

          if (allStats.length > 0) {
            const sumGas = allStats.reduce((sum: number, s: any) => sum + s.avgEfficiency.gasolina, 0);
            const sumAlc = allStats.reduce((sum: number, s: any) => sum + s.avgEfficiency.alcool, 0);
            setGlobalStat({
              marca,
              modelo,
              count: allStats.length,
              avgEfficiency: {
                gasolina: sumGas / allStats.length,
                alcool:  sumAlc / allStats.length,
              },
            });
          } else {
            setGlobalStat(null);
          }
        } catch (e) {
          console.error('❌ Erro ao carregar dados comunitários:', e);
          Alert.alert('Erro', 'Não foi possível carregar os dados comunitários.');
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, [])
  );

  const renderCard = (stat: CommunityStat | null, title: string) => {
    if (!stat) {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.noData}>Sem dados disponíveis</Text>
        </View>
      );
    }
    const diffGas = userEff.gasolina
      ? ((userEff.gasolina - stat.avgEfficiency.gasolina) / stat.avgEfficiency.gasolina) * 100
      : 0;
    const diffAlc = userEff.alcool
      ? ((userEff.alcool - stat.avgEfficiency.alcool) / stat.avgEfficiency.alcool) * 100
      : 0;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>Usuários: {stat.count}</Text>
        <Text style={styles.cardText}>
          Média Gasolina: {stat.avgEfficiency.gasolina.toFixed(1)} km/L{' '}
          <Text style={diffGas >= 0 ? styles.up : styles.down}>({diffGas.toFixed(0)}%)</Text>
        </Text>
        <Text style={styles.cardText}>
          Média Álcool: {stat.avgEfficiency.alcool.toFixed(1)} km/L{' '}
          <Text style={diffAlc >= 0 ? styles.up : styles.down}>({diffAlc.toFixed(0)}%)</Text>
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#7e54f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>📊 Dados Comunitários</Text>
          <Image source={require('../assets/img1.png')} style={styles.bannerLogo} resizeMode="contain" />
        </View>
        {globalStat && (
          <Text style={styles.subtitle}>
            Comparando com: {globalStat.marca} {globalStat.modelo}
          </Text>
        )}
        {renderCard(localStat, 'Comparativo Local')}
        {renderCard(globalStat, 'Comparativo Global')}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  content: { padding: 16, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 48 },
  banner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#7e54f6', borderRadius: 12, padding: 16, marginBottom: 24 },
  bannerText: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 },
  bannerLogo: { width: 50, height: 50, marginLeft: 12 },
  subtitle: { color: '#ccc', fontSize: 16, textAlign: 'center', marginBottom: 16 },
  card: { backgroundColor: '#1e1e1e', borderRadius: 8, padding: 16, marginBottom: 16 },
  cardTitle: { color: '#7e54f6', fontSize: 18, marginBottom: 8, fontWeight: 'bold' },
  cardText: { color: '#fff', fontSize: 16, marginBottom: 4 },
  noData: { color: '#888', fontSize: 14, fontStyle: 'italic' },
  up: { color: '#4caf50' },
  down: { color: '#f44336' },
});
