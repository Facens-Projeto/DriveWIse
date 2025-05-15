import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';



const VisaoPessoalScreen = () => {
  const [carro, setCarro] = useState<any>(null);
  const [condutor, setCondutor] = useState<any>(null);
  const [abastecimentos, setAbastecimentos] = useState<any[]>([]);
  const [estatisticas, setEstatisticas] = useState({
    mediaConsumo: 0,
    custoPorKm: 0,
    totalGasto: 0,
    kmRodado: 0,
  });
  const [comparativoCombustivel, setComparativoCombustivel] = useState<{
    lista: { tipo: string; media: number; custoKm: number }[];
    melhor: { tipo: string; media: number; custoKm: number } | null;
  }>({ lista: [], melhor: null });
  const [resumoInfo, setResumoInfo] = useState<{
    totalAbastecimentos: number;
    tiposContagem: Record<string, number>;
    tiposGasto: Record<string, number>;
    totalGastoGeral: number;
    primeiraData: Date;
    ultimaData: Date;
    kmTotalRodado: number;
    preferencia: Record<string, string>;
    temMultiplosCombustiveis: boolean;
  } | null>(null);

  
  useFocusEffect(
    useCallback(() => {
      const carregarDados = async () => {
        const cadastro = await AsyncStorage.getItem('@cadastro_usuario');
        const lista = await AsyncStorage.getItem('@abastecimentos');
       
        

        if (cadastro) {
          const { veiculo, condutor } = JSON.parse(cadastro);
          setCarro(veiculo);
          setCondutor(condutor);
        }

        if (lista) {
          const dados = JSON.parse(lista).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
          setAbastecimentos(dados);

          if (dados.length > 0) {
            let totalLitros = 0;
            let totalGasto = 0;
            let kmRodado = 0;

            for (let i = 0; i < dados.length - 1; i++) {
              const atual = dados[i];        
              const anterior = dados[i + 1]; 

              const trajeto = atual.km - anterior.km;
              if (trajeto > 0) {
                totalLitros += anterior.litros;
                totalGasto += anterior.total;
                kmRodado += trajeto;
              }
            }

            const mediaConsumo = kmRodado / totalLitros;
            const custoPorKm = totalGasto / kmRodado;

            setEstatisticas({ mediaConsumo, custoPorKm, totalGasto, kmRodado });

            const estatisticasPorTipo: Record<string, { km: number; litros: number; gasto: number }> = {};

            for (let i = 0; i < dados.length - 1; i++) {
              const atual = dados[i];
              const anterior = dados[i + 1];

              const tipo = anterior.tipo;
              const trajeto = atual.km - anterior.km;

              if (trajeto > 0) {
                if (!estatisticasPorTipo[tipo]) {
                  estatisticasPorTipo[tipo] = { km: 0, litros: 0, gasto: 0 };
                }

                estatisticasPorTipo[tipo].km += trajeto;
                estatisticasPorTipo[tipo].litros += anterior.litros;
                estatisticasPorTipo[tipo].gasto += anterior.total;
              }
            }

            const comparativo: {
              tipo: string;
              media: number;
              custoKm: number;
            }[] = [];

            for (const tipo in estatisticasPorTipo) {
              const e = estatisticasPorTipo[tipo];
              comparativo.push({
                tipo,
                media: e.km / e.litros,
                custoKm: e.gasto / e.km,
              });
            }

            if (comparativo.length > 0) {
              const melhor = comparativo.reduce((prev, atual) =>
                atual.custoKm < prev.custoKm ? atual : prev,
                comparativo[0]
              );

              setComparativoCombustivel({ lista: comparativo, melhor });
            }

            const totalAbastecimentos = dados.length;

            const tiposContagem: Record<string, number> = {};
            const tiposGasto: Record<string, number> = {};
            let totalGastoGeral = 0;
            let primeiraData = new Date(dados[dados.length - 1].data);
            let ultimaData = new Date(dados[0].data);
            let kmTotalRodado = dados[0].km - dados[dados.length - 1].km;

            dados.forEach((item) => {
              tiposContagem[item.tipo] = (tiposContagem[item.tipo] || 0) + 1;
              tiposGasto[item.tipo] = (tiposGasto[item.tipo] || 0) + item.total;
              totalGastoGeral += item.total;
            });

            const tiposUnicos = Object.keys(tiposContagem);
            const temMultiplosCombustiveis = tiposUnicos.length > 1;

            const preferencia: Record<string, string> = {};
            if (temMultiplosCombustiveis) {
              tiposUnicos.forEach((tipo) => {
                const percentual = (tiposContagem[tipo] / totalAbastecimentos) * 100;
                preferencia[tipo] = `${percentual.toFixed(1)}%`;
              });
            }

            setResumoInfo({
              totalAbastecimentos,
              tiposContagem,
              tiposGasto,
              totalGastoGeral,
              primeiraData,
              ultimaData,
              kmTotalRodado,
              preferencia,
              temMultiplosCombustiveis,
            });
          }
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
                <Text key={tipo} style={styles.cardContent}>• {tipo}: {qtd} vezes</Text>
              ))}

              <Text style={[styles.cardSubtitle, { marginTop: 10 }]}>📈 Preferência de uso:</Text>
              {Object.entries(resumoInfo.preferencia).map(([tipo, perc]) => (
                <Text key={tipo} style={styles.cardContent}>• {tipo}: {perc}</Text>
              ))}

              <Text style={[styles.cardSubtitle, { marginTop: 10 }]}>💸 Gasto por combustível:</Text>
              {Object.entries(resumoInfo.tiposGasto).map(([tipo, val]) => (
                <Text key={tipo} style={styles.cardContent}>• {tipo}: R$ {val.toFixed(2).replace('.', ',')}</Text>
              ))}
            </>
          )}
        </View>
      )}


      {comparativoCombustivel.lista.length > 0 && (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔍 Comparativo de Combustíveis</Text>
        {comparativoCombustivel.lista.map((item) => (
          <Text key={item.tipo} style={styles.cardContent}>
            {item.tipo} – Consumo médio: {item.media.toFixed(2)} km/L – Custo por km: R$ {item.custoKm.toFixed(2).replace('.', ',')}
          </Text>
        ))}
        <Text style={[styles.cardContent, { color: '#6ef58f', marginTop: 8 }]}>
          ✅ Melhor custo-benefício: {comparativoCombustivel.melhor?.tipo}
        </Text>
      </View>
    )}


      <View style={styles.card}>
        <Text style={styles.cardTitle}>Histórico de Abastecimentos</Text>
        {abastecimentos.slice(0, -1).map((item, index) => {
          const anterior = abastecimentos[index + 1];
          const trajeto = item.km - anterior.km;
          const rendimento = trajeto / anterior.litros;
          const custoPorKm = anterior.total / trajeto;

          return (
            <View key={index} style={styles.histItem}>
              <Text style={styles.histText}>⛽ {anterior.tipo} ({new Date(anterior.data).toLocaleDateString('pt-BR')})</Text>
              <Text style={styles.histText}>🛣️ Trajeto: {trajeto} km</Text>
              <Text style={styles.histText}>⚙️ Rendimento: {rendimento.toFixed(2)} km/L</Text>
              <Text style={styles.histText}>💲 Custo por km: R$ {custoPorKm.toFixed(2).replace('.', ',')}</Text>
              <Text style={styles.histText}>💰 Total abastecido: R$ {anterior.total.toFixed(2).replace('.', ',')}</Text>
              <Text style={styles.histText}>🧪 Litros: {anterior.litros.toFixed(2).replace('.', ',')} L</Text>
              <Text style={styles.histText}>📍 Quilometragem: {anterior.km.toLocaleString('pt-BR')} km</Text>
            </View>
          );
        })}
        {abastecimentos.length > 0 && (
          <View style={styles.histItem}>
            <Text style={styles.histText}>⏳ Último abastecimento registrado ainda em uso.</Text>
            <Text style={styles.histText}>📍 Quilometragem: {abastecimentos[0].km.toLocaleString('pt-BR')} km</Text>
          </View>
        )}
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
    cardSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 4,
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
  histItem: {
    marginBottom: 12,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  histText: {
    color: '#aaa',
    fontSize: 13,
  },
});

export default VisaoPessoalScreen;
