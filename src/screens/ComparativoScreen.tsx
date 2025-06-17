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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { buscarTodosVeiculos } from '../services/veiculosService';
import { obterRecomendacoesAPI } from '../services/recomendacoesService';

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
  tecnologia?: string;
  uso?: string;
  recomendacoes?: string[];
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
  const [tecnologia, setTecnologia] = useState('Combustao');
  const [uso, setUso] = useState('Urbano');

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
    const nivel0 = data.filter(e => e.veiculo.marca === f.marca && e.veiculo.modelo === f.modelo);
    const nivel1 = nivel0.filter(e => e.veiculo.ano === f.ano);
    const nivel2 = nivel1.filter(e => e.veiculo.quilometragem >= f.kmMin && e.veiculo.quilometragem <= f.kmMax);

    const base = nivel2.length > 0 ? nivel2 : nivel1.length > 0 ? nivel1 : nivel0.length > 0 ? nivel0 : [];

    if (base.length === 0) {
      return {
        total_make_model: 0,
        total_year: 0,
        total_km_range: 0,
        avg: { gasolina: 0, alcool: 0, diesel: 0 },
        custoPorKm: 0,
      };
    }

    const sum = base.reduce((acc, e) => {
      acc.gasolina += e.avgEfficiency.gasolina;
      acc.alcool += e.avgEfficiency.alcool;
      acc.diesel += e.avgEfficiency.diesel;
      return acc;
    }, { gasolina: 0, alcool: 0, diesel: 0 });

    const cnt = base.length;
    const avg = {
      gasolina: sum.gasolina / cnt,
      alcool: sum.alcool / cnt,
      diesel: sum.diesel / cnt,
    };

    const custo = ((avg.gasolina ? 5 / avg.gasolina : 0) + (avg.alcool ? 4 / avg.alcool : 0) + (avg.diesel ? 4.5 / avg.diesel : 0)) / 3;

    return {
      total_make_model: nivel0.length,
      total_year: nivel1.length,
      total_km_range: nivel2.length,
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
    try {
      const { recomendacoes } = await obterRecomendacoesAPI({ quilometragem: range.max, tecnologia, uso });
      const f: VehicleFilter = {
        id,
        marca,
        modelo,
        ano: parseInt(ano, 10),
        kmMin: range.min,
        kmMax: range.max,
        combustiveisAceitos: combSelecionados,
        tecnologia,
        uso,
        recomendacoes,
      };
      setFilters(prev => [...prev, f]);
      setMarca('');
      setModelo('');
      setAno('');
      setCombSelecionados([]);
      setTecnologia('Combustao');
      setUso('Urbano');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao obter recomendações');
    }
  }

  function removerFiltro(id: string) {
    setFilters(prev => prev.filter(f => f.id !== id));
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.btnAdd} onPress={() => setModalVisible(true)}>
        <Text style={styles.btnText}>+ Adicionar Veículo</Text>
      </TouchableOpacity>

      <ScrollView>
        {filters.map(f => {
          const s = stats[f.id];
          if (!s) return null;

          const custoValues = Object.values(stats).map(v => v.custoPorKm);
          const melhorCusto = Math.min(...custoValues);
          const piorCusto = Math.max(...custoValues);

          const destaqueStyle = s.custoPorKm === melhorCusto
            ? { borderColor: '#4caf50', borderWidth: 2 }
            : s.custoPorKm === piorCusto
            ? { borderColor: '#f44336', borderWidth: 2 }
            : {};

          return (
            <View key={f.id} style={[styles.card, destaqueStyle]}>
              <Text style={styles.vehicleName}>{`${f.marca} ${f.modelo} ${f.ano}`}</Text>
              <Text style={styles.cell}>Gasolina: {isNaN(s.avg.gasolina) ? '-' : s.avg.gasolina.toFixed(1)}</Text>
              <Text style={styles.cell}>Álcool: {isNaN(s.avg.alcool) ? '-' : s.avg.alcool.toFixed(1)}</Text>
              <Text style={styles.cell}>Diesel: {isNaN(s.avg.diesel) ? '-' : s.avg.diesel.toFixed(1)}</Text>
              <Text style={styles.cell}>
                Custo/km: R$ {s.custoPorKm.toFixed(2)}{' '}
                {s.custoPorKm === melhorCusto ? '⭐' : ''}
              </Text>
              {Array.isArray(f.recomendacoes) && f.recomendacoes.length > 0 && (
                <View style={styles.recomendacoesBox}>
                  <Text style={styles.recomendacoesTitulo}>Recomendações técnicas:</Text>
                  {f.recomendacoes.map((r, i) => (
                    <Text key={i} style={styles.recomendacaoItem}>🔧 {r}</Text>
                  ))}
                </View>
              )}
              <TouchableOpacity onPress={() => removerFiltro(f.id)} style={styles.removeButton}>
                <Ionicons name="trash-outline" size={16} color="#f66" />
                <Text style={styles.removeText}>Remover</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.modal}>
            <Text style={styles.modalTitle}>Novo Veículo</Text>
            <TextInput placeholder="Marca" placeholderTextColor="#999" style={styles.input} value={marca} onChangeText={setMarca} />
            <TextInput placeholder="Modelo" placeholderTextColor="#999" style={styles.input} value={modelo} onChangeText={setModelo} />
            <TextInput placeholder="Ano" placeholderTextColor="#999" keyboardType="numeric" style={styles.input} value={ano} onChangeText={setAno} />

            <Text style={styles.label}>Faixa de quilometragem</Text>
            <View style={styles.pickerGroup}>
              {KM_RANGES.map(r => (
                <TouchableOpacity key={r.label} style={[styles.pickerOption, kmRange === r.label && styles.pickerSelected]} onPress={() => setKmRange(r.label)}>
                  <Text style={styles.pickerText}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Combustíveis aceitos</Text>
            <View style={styles.pickerGroup}>
              {COMB_OPTIONS.map(c => (
                <TouchableOpacity key={c} style={[styles.pickerOption, combSelecionados.includes(c) && styles.pickerSelected]} onPress={() => {
                  setCombSelecionados(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
                }}>
                  <Text style={styles.pickerText}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Tecnologia</Text>
            <View style={styles.pickerGroup}>
              {['Combustao', 'Hibrido'].map(t => (
                <TouchableOpacity key={t} style={[styles.pickerOption, tecnologia === t && styles.pickerSelected]} onPress={() => setTecnologia(t)}>
                  <Text style={styles.pickerText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Perfil de uso</Text>
            <View style={styles.pickerGroup}>
              {['Urbano', 'Rodoviario'].map(u => (
                <TouchableOpacity key={u} style={[styles.pickerOption, uso === u && styles.pickerSelected]} onPress={() => setUso(u)}>
                  <Text style={styles.pickerText}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.btnSave} onPress={addFilter}>
              <Text style={styles.btnText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  btnAdd: { backgroundColor: '#7e54f6', padding: 12, borderRadius: 8, marginBottom: 10 },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  card: { backgroundColor: '#222', borderRadius: 10, padding: 16, marginBottom: 12 },
  vehicleName: { fontWeight: 'bold', fontSize: 16, color: '#fff', marginBottom: 4 },
  cell: { color: '#fff', fontSize: 14 },
  recomendacoesBox: { marginTop: 10 },
  recomendacoesTitulo: { color: '#ccc', fontSize: 12, fontWeight: 'bold' },
  recomendacaoItem: { color: '#7e54f6', fontSize: 12, marginLeft: 10 },
  removeButton: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  removeText: { color: '#f66', marginLeft: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center' },
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