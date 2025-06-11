// src/screens/DadosComunitariosScreen.ts
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import community from '../communityDB/data.json';

interface CommunityStat {
  modelId: string;
  year: number;
  city?: string;
  count: number;
  avgEfficiency: {
    gasoline: number;
    alcohol: number;
  };
}

export default function DadosComunitariosScreen() {
  const VEHICLE_KEY = '@drivewise:vehicle';       
  const FUEL_KEY    = '@drivewise:expensesFuel';  

  const [loading, setLoading] = useState(true);
  const [localStat, setLocalStat] = useState<CommunityStat | null>(null);
  const [globalStat, setGlobalStat] = useState<CommunityStat | null>(null);
  const [userEff, setUserEff] = useState<{ gasoline: number; alcohol: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const rawVeh = await AsyncStorage.getItem(VEHICLE_KEY);
        if (!rawVeh) throw new Error('Veículo não encontrado');
        const vehicle = JSON.parse(rawVeh) as { modelId: string; year: number; city?: string };

        const rawFuel = await AsyncStorage.getItem(FUEL_KEY);
        let effGas = 0, effAlc = 0;
        if (rawFuel) {
          const arr = JSON.parse(rawFuel) as Array<{
            efficiency?: number;
            type: string;
            date: string;
          }>;
          const last = arr
            .filter(f => f.efficiency != null)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          effGas = last?.efficiency || 0;
          effAlc = last?.efficiency || 0; // se você armazenar efficiencies separadas, adapte aqui
        }
        setUserEff({ gasoline: effGas, alcohol: effAlc });

        const allStats: CommunityStat[] = (community as any[]).map(item => ({
          modelId: item.veiculo.modelo,
          year: item.veiculo.ano,
          city: item.condutor.cidade,
          count: item.count,
          avgEfficiency: item.avgEfficiency,
        })).filter(
          s => s.modelId === vehicle.modelId && s.year === vehicle.year
        );
        const micro = allStats.find(s => s.city === vehicle.city);
        setLocalStat(micro || null);

        const macro = allStats.find(s => !s.city);
        setGlobalStat(macro || null);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <ActivityIndicator size="large" color="#7e54f6" />
      </SafeAreaView>
    );
  }

  const renderCard = (
    stat: CommunityStat | null,
    title: string
  ) => {
    if (!stat) {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.noData}>Sem dados disponíveis</Text>
        </View>
      );
    }
    const diffGas = userEff
      ? ((userEff.gasoline - stat.avgEfficiency.gasoline) / stat.avgEfficiency.gasoline) * 100
      : 0;
    const diffAlc = userEff
      ? ((userEff.alcohol - stat.avgEfficiency.alcohol) / stat.avgEfficiency.alcohol) * 100
      : 0;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>Usuários: {stat.count}</Text>
        <Text style={styles.cardText}>
          Média Gasolina: {stat.avgEfficiency.gasoline.toFixed(1)} km/L{' '}
          {userEff && (
            <Text style={diffGas >= 0 ? styles.up : styles.down}>
              ({diffGas.toFixed(0)}%)
            </Text>
          )}
        </Text>
        <Text style={styles.cardText}>
          Média Álcool: {stat.avgEfficiency.alcohol.toFixed(1)} km/L{' '}
          {userEff && (
            <Text style={diffAlc >= 0 ? styles.up : styles.down}>
              ({diffAlc.toFixed(0)}%)
            </Text>
          )}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Dados Comunitários</Text>
        {renderCard(localStat, 'Comparativo Local')}
        {renderCard(globalStat, 'Comparativo Global')}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  containerCentered: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 20 },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#7e54f6',
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  noData: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
  up: { color: '#4caf50' },   
  down: { color: '#f44336' }, 
});
