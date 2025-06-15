import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { buscarTodosVeiculos } from '../services/veiculosService';

interface RawEntry {
  veiculo: {
    marca: string;
    modelo: string;
    ano: number;
    quilometragem: number;
    combustiveisAceitos: string[];
    modificacoes?: string;
  };
  condutor: any;
  avgEfficiency: { gasolina: number; alcool: number; diesel: number };
}

interface VehicleFilter {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  kmMin: number;
  kmMax: number;
  combustiveisAceitos: string[];
}

interface StatsResult {
  total_make_model: number;
  total_year: number;
  total_km_range: number;
  avg: { gasolina: number; alcool: number; diesel: number };
  custoPorKm: number;
}

const COMB_OPTIONS = ['Gasolina', 'Álcool', 'Diesel'];
const KM_RANGES = [
  { label: '0-15000', min: 0, max: 15000 },
  { label: '15001-30000', min: 15001, max: 30000 },
  { label: '30001-50000', min: 30001, max: 50000 },
];

export default function ComparativoScreen() {
  const [filters, setFilters] = useState<VehicleFilter[]>([]);
  const [stats, setStats] = useState<Record<string, StatsResult>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState<RawEntry[]>([]);

  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [kmRange, setKmRange] = useState(KM_RANGES[0].label);
  const [combSelecionados, setCombSelecionados] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const veiculosOnline = await buscarTodosVeiculos();
        setData(veiculosOnline);
      } catch (e) {
        console.error('Erro ao buscar dados do MongoDB:', e);
        Alert.alert('Erro ao buscar dados', 'Não foi possível carregar os veículos comunitários.');
      }
    })();
  }, []);

  useEffect(() => {
    const results: Record<string, StatsResult> = {};
    filters.forEach(f => {
      results[f.id] = computeStatsForFilter(f);
    });
    setStats(results);
  }, [filters, data]);

  function computeStatsForFilter(f: VehicleFilter): StatsResult {
    const lvl0 = data.filter(e =>
      e.veiculo.marca === f.marca && e.veiculo.modelo === f.modelo
    );
    const lvl1 = lvl0.filter(e => e.veiculo.ano === f.ano);
    const lvl2 = lvl1.filter(
      e => e.veiculo.quilometragem >= f.kmMin && e.veiculo.quilometragem <= f.kmMax
    );

    const base = lvl2.length ? lvl2 : lvl1.length ? lvl1 : lvl0;

    const sum = base.reduce(
      (acc, e) => {
        acc.gasolina += e.avgEfficiency.gasolina;
        acc.alcool += e.avgEfficiency.alcool;
        acc.diesel += e.avgEfficiency.diesel;
        return acc;
      },
      { gasolina: 0, alcool: 0, diesel: 0 }
    );
    const cnt = base.length || 1;
    const avg = {
      gasolina: sum.gasolina / cnt,
      alcool: sum.alcool / cnt,
      diesel: sum.diesel / cnt,
    };

    const custo = ((avg.gasolina ? 5 / avg.gasolina : 0) + (avg.alcool ? 4 / avg.alcool : 0) + (avg.diesel ? 4.5 / avg.diesel : 0)) / 3;

    return {
      total_make_model: lvl0.length,
      total_year: lvl1.length,
      total_km_range: lvl2.length,
      avg,
      custoPorKm: custo,
    };
  }

  async function addFilter() {
    if (!marca || !modelo || !ano) {
      Alert.alert('Erro', 'Marca, modelo e ano são obrigatórios.');
      return;
    }
    const range = KM_RANGES.find(r => r.label === kmRange);
    if (!range) return;
    const id = `${marca}_${modelo}_${ano}_${range.label}`;
    const f: VehicleFilter = {
      id,
      marca,
      modelo,
      ano: parseInt(ano, 10),
      kmMin: range.min,
      kmMax: range.max,
      combustiveisAceitos: combSelecionados,
    };
    setFilters(prev => [...prev, f]);
    setModalVisible(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.btnAdd} onPress={() => setModalVisible(true)}>
        <Text style={styles.btnText}>➕ Adicionar Veículo</Text>
      </TouchableOpacity>

      <ScrollView style={styles.table}>
        <View style={styles.rowHeader}>
          <Text style={[styles.cell, styles.header]}>Veículo</Text>
          <Text style={[styles.cell, styles.header]}>Gasolina</Text>
          <Text style={[styles.cell, styles.header]}>Álcool</Text>
          <Text style={[styles.cell, styles.header]}>Diesel</Text>
          <Text style={[styles.cell, styles.header]}>Custo/km</Text>
        </View>
        {filters.map(f => {
          const s = stats[f.id];
          const allGas = Object.values(stats).map(r => r.avg.gasolina);
          const bestGas = Math.max(...allGas);
          const worstGas = Math.min(...allGas);
          const allAlc = Object.values(stats).map(r => r.avg.alcool);
          const bestAlc = Math.max(...allAlc);
          const worstAlc = Math.min(...allAlc);
          const allDiesel = Object.values(stats).map(r => r.avg.diesel);
          const bestDiesel = Math.max(...allDiesel);
          const worstDiesel = Math.min(...allDiesel);
          const allCusto = Object.values(stats).map(r => r.custoPorKm);
          const bestC = Math.min(...allCusto);
          const worstC = Math.max(...allCusto);

          return (
            <View key={f.id} style={styles.row}>
              <Text style={styles.cell}>{`${f.marca} ${f.modelo} ${f.ano}`}</Text>
              <Text style={[styles.cell, s.avg.gasolina === bestGas ? styles.best : s.avg.gasolina === worstGas ? styles.worst : {}]}>{s.avg.gasolina.toFixed(1)}</Text>
              <Text style={[styles.cell, s.avg.alcool === bestAlc ? styles.best : s.avg.alcool === worstAlc ? styles.worst : {}]}>{s.avg.alcool.toFixed(1)}</Text>
              <Text style={[styles.cell, s.avg.diesel === bestDiesel ? styles.best : s.avg.diesel === worstDiesel ? styles.worst : {}]}>{s.avg.diesel.toFixed(1)}</Text>
              <Text style={[styles.cell, s.custoPorKm === bestC ? styles.best : s.custoPorKm === worstC ? styles.worst : {}]}>R$ {s.custoPorKm.toFixed(2)}</Text>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Novo Veículo</Text>
            <TextInput style={styles.input} placeholder="Marca" placeholderTextColor="#999" value={marca} onChangeText={setMarca} />
            <TextInput style={styles.input} placeholder="Modelo" placeholderTextColor="#999" value={modelo} onChangeText={setModelo} />
            <TextInput style={styles.input} placeholder="Ano" keyboardType="numeric" placeholderTextColor="#999" value={ano} onChangeText={setAno} />
            <Text style={styles.label}>Faixa de quilometragem</Text>
            <View style={styles.pickerGroup}>
              {KM_RANGES.map(r => (
                <TouchableOpacity
                  key={r.label}
                  style={[styles.pickerOption, kmRange === r.label && styles.pickerSelected]}
                  onPress={() => setKmRange(r.label)}
                >
                  <Text style={styles.pickerText}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Combustíveis aceitos</Text>
            <View style={styles.pickerGroup}>
              {COMB_OPTIONS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.pickerOption, combSelecionados.includes(c) && styles.pickerSelected]}
                  onPress={() => {
                    setCombSelecionados(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
                  }}
                >
                  <Text style={styles.pickerText}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.btnSave} onPress={addFilter}>
              <Text style={styles.btnText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  btnAdd: { backgroundColor: '#7e54f6', padding: 12, borderRadius: 8, marginBottom: 10 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  table: { flex: 1 },
  rowHeader: { flexDirection: 'row', marginBottom: 8 },
  row: { flexDirection: 'row', marginBottom: 6 },
  cell: { flex: 1, color: '#fff', textAlign: 'center' },
  header: { color: '#7e54f6', fontWeight: 'bold' },
  best: { backgroundColor: '#2e7d32' },
  worst: { backgroundColor: '#c62828' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center' },
  modal: { backgroundColor: '#1e1e1e', margin: 20, padding: 20, borderRadius: 12 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: { backgroundColor: '#333', color: '#fff', padding: 10, borderRadius: 6, marginBottom: 10 },
  label: { color: '#ccc', marginTop: 12, marginBottom: 6 },
  pickerGroup: { flexDirection: 'row', flexWrap: 'wrap' },
  pickerOption: { backgroundColor: '#333', padding: 8, borderRadius: 6, margin: 4 },
  pickerSelected: { backgroundColor: '#7e54f6' },
  pickerText: { color: '#fff' },
  btnSave: { backgroundColor: '#7e54f6', padding: 12, borderRadius: 8, marginTop: 12 },
  btnCancel: { backgroundColor: '#555', padding: 12, borderRadius: 8, marginTop: 6 },
});
