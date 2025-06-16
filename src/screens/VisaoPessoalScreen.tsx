// src/screens/VisaoPessoalScreen.tsx
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
import { useFocusEffect, useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { signOut, getUserId } from '../services/firebase';
import { buscarVeiculosDoUsuario, buscarAbastecimentosDoUsuario } from '../services/veiculosService';

const VisaoPessoalScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Main'>>();
  const [carro, setCarro] = useState<any>(null);
  const [condutor, setCondutor] = useState<any>(null);
  const [abastecimentos, setAbastecimentos] = useState<any[]>([]);
  const [resumoInfo, setResumoInfo] = useState<any>(null);
  const [comparativoCombustivel, setComparativoCombustivel] = useState<any>({ lista: [], melhor: null });

  useFocusEffect(
    useCallback(() => {
      const carregarDados = async () => {
        try {
          const uid = await getUserId();
          if (!uid) return;

          const veiculos = await buscarVeiculosDoUsuario(uid);
          const abastecs = await buscarAbastecimentosDoUsuario(uid);

          if (veiculos.length > 0 && veiculos[0].veiculo && veiculos[0].condutor) {
            setCarro(veiculos[0].veiculo);
            setCondutor(veiculos[0].condutor);
          } else {
            Alert.alert('Cadastro necessário', 'Nenhum veículo encontrado para sua conta. Complete o cadastro para continuar.', [{ text: 'Cadastrar agora', onPress: () => navigation.replace('Cadastro') }]);
          }

          setAbastecimentos(abastecs.sort((a: any, b: any) => b.km - a.km));

          if (abastecs.length > 1) {
            const totalAbastecimentos = abastecs.length;
            const primeiraData = new Date(abastecs[abastecs.length - 1].data);
            const ultimaData = new Date(abastecs[0].data);
            const kmTotalRodado = abastecs[0].km - abastecs[abastecs.length - 1].km;
            const totalGastoGeral = abastecs.reduce((acc: number, cur: any) => acc + cur.total, 0);

            const tiposContagem: any = {};
            const tiposGasto: any = {};
            abastecs.forEach((a: any) => {
              tiposContagem[a.tipo] = (tiposContagem[a.tipo] || 0) + 1;
              tiposGasto[a.tipo] = (tiposGasto[a.tipo] || 0) + a.total;
            });

            const total: number = (Object.values(tiposContagem) as number[]).reduce((a: number, b: number) => a + b, 0);
            const preferencia: any = {};
            Object.entries(tiposContagem).forEach(([tipo, qtd]: any) => {
              preferencia[tipo] = ((qtd / total) * 100).toFixed(1) + '%';
            });

            setResumoInfo({ totalAbastecimentos, primeiraData, ultimaData, kmTotalRodado, totalGastoGeral, tiposContagem, tiposGasto, preferencia, temMultiplosCombustiveis: Object.keys(tiposContagem).length > 1 });

            const agrupado: any = {};
            for (let i = 1; i < abastecs.length; i++) {
              const atual = abastecs[i - 1];
              const anterior = abastecs[i];
              const trajeto = atual.km - anterior.km;
              if (trajeto <= 0) continue;
              const rendimento = trajeto / anterior.litros;
              const custoKm = anterior.total / trajeto;
              if (!agrupado[anterior.tipo]) agrupado[anterior.tipo] = { tipo: anterior.tipo, totalMedia: 0, totalCusto: 0, count: 0 };
              agrupado[anterior.tipo].totalMedia += rendimento;
              agrupado[anterior.tipo].totalCusto += custoKm;
              agrupado[anterior.tipo].count++;
            }

            const lista = Object.values(agrupado).map((item: any) => ({
              tipo: item.tipo,
              media: item.totalMedia / item.count,
              custoKm: item.totalCusto / item.count
            }));
            const melhor = lista.sort((a, b) => a.custoKm - b.custoKm)[0];
            setComparativoCombustivel({ lista, melhor });
          }
        } catch (e) {
          console.error('Erro ao carregar dados:', e);
          Alert.alert('Erro', 'Não foi possível carregar os dados do usuário.');
        }
      };
      carregarDados();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1, paddingBottom: 100 }]} keyboardShouldPersistTaps="handled">
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

        {resumoInfo && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Resumo Geral</Text>
            <Text style={styles.cardContent}>⛽ Total de abastecimentos: {resumoInfo.totalAbastecimentos}</Text>
            <Text style={styles.cardContent}>🛣️ KM percorridos: {resumoInfo.kmTotalRodado} km</Text>
            <Text style={styles.cardContent}>📅 Período: {resumoInfo.primeiraData.toLocaleDateString('pt-BR')} → {resumoInfo.ultimaData.toLocaleDateString('pt-BR')}</Text>
            <Text style={styles.cardContent}>💰 Gasto total: R$ {resumoInfo.totalGastoGeral.toFixed(2).replace('.', ',')}</Text>
            {resumoInfo.temMultiplosCombustiveis && (
              <>
                <Text style={[styles.cardSubtitle, { marginTop: 10 }]}>⛽ Abastecimentos por combustível:</Text>
                {Object.entries(resumoInfo.tiposContagem).map(([tipo, qtd]) => (
                  <Text key={tipo + '-qtd'} style={styles.cardContent}>• {tipo}: {String(qtd)} vezes</Text>
                ))}
                <Text style={[styles.cardSubtitle, { marginTop: 10 }]}>📈 Preferência de uso:</Text>
                {Object.entries(resumoInfo.preferencia).map(([tipo, perc]) => (
                  <Text key={tipo + '-pref'} style={styles.cardContent}>• {tipo}: {String(perc)}</Text>
                ))}
                <Text style={[styles.cardSubtitle, { marginTop: 10 }]}>💸 Gasto por combustível:</Text>
                {Object.entries(resumoInfo.tiposGasto).map(([tipo, val]) => (
                  <Text key={tipo + '-gasto'} style={styles.cardContent}>• {tipo}: R$ {(val as number).toFixed(2).replace('.', ',')}</Text>
                ))}
              </>
            )}
          </View>
        )}

        {comparativoCombustivel.lista.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔍 Comparativo de Combustíveis</Text>
            {comparativoCombustivel.lista.map((item: any) => (
              <Text key={item.tipo + '-cmp'} style={styles.cardContent}>
                {item.tipo} – Consumo médio: {item.media.toFixed(2)} km/L – Custo por km: R$ {item.custoKm.toFixed(2).replace('.', ',')}
              </Text>
            ))}
            <Text style={[styles.cardContent, { color: '#6ef58f', marginTop: 8 }]}>✅ Melhor custo-benefício: {comparativoCombustivel.melhor?.tipo}</Text>
          </View>
        )}

        {abastecimentos.length > 1 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Histórico de Abastecimentos</Text>
            {abastecimentos.slice(1).map((item, index) => {
              const anterior = abastecimentos[index];
              const trajeto = anterior.km - item.km;
              const rendimento = trajeto / item.litros;
              const custoPorKm = item.total / trajeto;

              return (
                <View key={index} style={styles.histItem}>
                  <Text style={styles.histText}>⛽ {item.tipo} ({new Date(item.data).toLocaleDateString('pt-BR')})</Text>
                  <Text style={styles.histText}>🛣️ Trajeto: {trajeto} km</Text>
                  <Text style={styles.histText}>⚙️ Rendimento: {rendimento.toFixed(2)} km/L</Text>
                  <Text style={styles.histText}>💲 Custo por km: R$ {custoPorKm.toFixed(2).replace('.', ',')}</Text>
                  <Text style={styles.histText}>💰 Total abastecido: R$ {item.total.toFixed(2).replace('.', ',')}</Text>
                  <Text style={styles.histText}>🧪 Litros: {item.litros.toFixed(2).replace('.', ',')} L</Text>
                  <Text style={styles.histText}>📍 Quilometragem: {item.km.toLocaleString('pt-BR')} km</Text>
                </View>
              );
            })}
            <View style={styles.histItem}>
              <Text style={styles.histText}>⏳ Último abastecimento registrado ainda em uso.</Text>
              <Text style={styles.histText}>📍 Quilometragem: {abastecimentos[0].km.toLocaleString('pt-BR')} km</Text>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ações</Text>
 
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              await signOut();
              navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
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
  container: { backgroundColor: '#121212', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#7e54f6', borderRadius: 12, padding: 16, marginBottom: 16 },
  headerText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  logo: { width: 32, height: 32, resizeMode: 'contain' },
  card: { backgroundColor: '#1e1e1e', borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  cardContent: { color: '#ccc', fontSize: 14, marginBottom: 4 },
  cardSubtitle: { color: '#aaa', fontSize: 15, fontWeight: 'bold' },
  histItem: { marginTop: 8 },
  histText: { color: '#ccc', fontSize: 13, marginBottom: 2 },
  logoutButton: { backgroundColor: '#1e1e1e', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
  logoutText: { color: '#E53935', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});

export default VisaoPessoalScreen;
