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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import community from '../communityDB/data.json';

interface CommunityStat {
  brand: string;
  modelId: string;
  city?: string;
  count: number;
  avgEfficiency: {
    gasoline: number;
    alcohol: number;
  };
}

export default function DadosComunitariosScreen() {
  const VEHICLE_KEY = '@drivewise:vehicle';
  const FUEL_KEY = '@drivewise:expensesFuel';

  const [loading, setLoading] = useState(true);
  const [localStat, setLocalStat] = useState<CommunityStat | null>(null);
  const [globalStat, setGlobalStat] = useState<CommunityStat | null>(null);
  const [userEff, setUserEff] = useState<{ gasoline: number; alcohol: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          const rawVeh = await AsyncStorage.getItem(VEHICLE_KEY);
          if (!rawVeh) {
            setLoading(false);
            return;
          }
          const vehicle = JSON.parse(rawVeh);

          const rawFuel = await AsyncStorage.getItem(FUEL_KEY);
          let effGas = 0, effAlc = 0;
          if (rawFuel) {
            const arr = JSON.parse(rawFuel) as Array<{ efficiency?: number; type: string; date: string }>;
            const last = arr.filter(f => f.efficiency != null).sort((a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0];
            effGas = last?.efficiency || 0;
            effAlc = last?.efficiency || 0;
          }
          setUserEff({ gasoline: effGas, alcohol: effAlc });

          const allStats = (community as any[]).map(item => ({
            brand: item.veiculo.marca,
            modelId: item.veiculo.modelo,
            city: item.condutor.cidade,
            avgEfficiency: {
              gasoline: item.avgEfficiency.gasolina,
              alcohol: item.avgEfficiency.alcool,
            },
          })).filter(
            s => s.brand.toLowerCase() === vehicle.brand.toLowerCase()
              && s.modelId.toLowerCase() === vehicle.modelId.toLowerCase()
          );

          const localMatches = allStats.filter(s =>
            s.city?.toLowerCase() === vehicle.city?.toLowerCase()
          );

          if (localMatches.length > 0) {
            const totalGas = localMatches.reduce((sum, stat) => sum + stat.avgEfficiency.gasoline, 0);
            const totalAlc = localMatches.reduce((sum, stat) => sum + stat.avgEfficiency.alcohol, 0);
            setLocalStat({
              brand: vehicle.brand,
              modelId: vehicle.modelId,
              city: vehicle.city,
              count: localMatches.length,
              avgEfficiency: {
                gasoline: totalGas / localMatches.length,
                alcohol: totalAlc / localMatches.length,
              },
            });
          } else {
            setLocalStat(null);
          }

          if (allStats.length > 0) {
            const totalGas = allStats.reduce((sum, stat) => sum + stat.avgEfficiency.gasoline, 0);
            const totalAlc = allStats.reduce((sum, stat) => sum + stat.avgEfficiency.alcohol, 0);
            setGlobalStat({
              brand: vehicle.brand,
              modelId: vehicle.modelId,
              count: allStats.length,
              avgEfficiency: {
                gasoline: totalGas / allStats.length,
                alcohol: totalAlc / allStats.length,
              },
            });
          } else {
            setGlobalStat(null);
          }
        } catch (e) {
          console.error('❌ Erro ao carregar dados:', e);
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

    const diffGas = userEff ? ((userEff.gasoline - stat.avgEfficiency.gasoline) / stat.avgEfficiency.gasoline) * 100 : 0;
    const diffAlc = userEff ? ((userEff.alcohol - stat.avgEfficiency.alcohol) / stat.avgEfficiency.alcohol) * 100 : 0;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>Usuários: {stat.count}</Text>
        <Text style={styles.cardText}>
          Média Gasolina: {stat.avgEfficiency.gasoline.toFixed(1)} km/L{' '}
          {userEff && <Text style={diffGas >= 0 ? styles.up : styles.down}>({diffGas.toFixed(0)}%)</Text>}
        </Text>
        <Text style={styles.cardText}>
          Média Álcool: {stat.avgEfficiency.alcohol.toFixed(1)} km/L{' '}
          {userEff && <Text style={diffAlc >= 0 ? styles.up : styles.down}>({diffAlc.toFixed(0)}%)</Text>}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <ActivityIndicator size="large" color="#7e54f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBanner}>
          <Text style={styles.bannerText}>📊 Dados Comunitários</Text>
          <Image source={require('../assets/img1.png')} style={styles.bannerLogo} resizeMode="contain" />
        </View>

        {globalStat && (
          <Text style={styles.subtitle}>
            Comparando com: {globalStat.brand} {globalStat.modelId}
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
  containerCentered: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 48,
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
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
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
