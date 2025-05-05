import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCalculoAbastecimento } from '../hooks/useCalculoAbastecimento';

export default function AbastecimentoForm() {
  const [preco, setPreco] = useState('');
  const [total, setTotal] = useState('');
  const [litros, setLitros] = useState('');
  const [kmAtual, setKmAtual] = useState('');
  const [tipoCombustivel, setTipoCombustivel] = useState('');
  const [combustiveisPermitidos, setCombustiveisPermitidos] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [resumo, setResumo] = useState('');
  const [variacaoVisual, setVariacaoVisual] = useState({});

  const {
    extrairNumero,
    formatarCampoMonetario,
    formatarCampoLitros,
    calcularAutomaticamente,
    setUltimoCampoEditado,
  } = useCalculoAbastecimento();

  useEffect(() => {
    const carregarCadastro = async () => {
      const dados = await AsyncStorage.getItem('@cadastro_usuario');
      if (dados) {
        const json = JSON.parse(dados);
        setCombustiveisPermitidos(json.combustiveisAceitos || []);
        if (json.combustiveisAceitos.length === 1) {
          setTipoCombustivel(json.combustiveisAceitos[0]);
        }
      }
    };
    carregarCadastro();
  }, []);

  function formatarKm(valor) {
    const num = valor.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  async function salvarAbastecimento() {
    const precoNum = extrairNumero(preco);
    const totalNum = extrairNumero(total);
    const litrosNum = extrairNumero(litros);
    const kmNum = parseInt(kmAtual.replace(/\./g, ''));
  
    if (!precoNum || !totalNum || !litrosNum || !kmNum || !tipoCombustivel) {
      alert('Preencha todos os campos corretamente.');
      return;
    }
  
    const novoRegistro = {
      tipoCombustivel,
      preco: precoNum,
      total: totalNum,
      litros: litrosNum,
      km: kmNum,
      data: new Date().toISOString(),
    };
  
    const historico = await AsyncStorage.getItem('@abastecimentos');
    const historicoArray = historico ? JSON.parse(historico) : [];
  
    // buscar últimos abastecimentos do mesmo tipo
    const ultimos = [...historicoArray]
      .filter((a) => a.tipoCombustivel === tipoCombustivel)
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  
    let rendimentoAtual = null;
    let variacao = null;
  
    if (ultimos.length > 0) {
      const anterior = ultimos[0];
      const kmRodado = kmNum - anterior.km;
      rendimentoAtual = kmRodado / litrosNum;
  
      if (ultimos.length > 1) {
        const anterior2 = ultimos[1];
        const kmRodadoAnterior = anterior.km - anterior2.km;
        const rendimentoAnterior = kmRodadoAnterior / anterior.litros;
  
        variacao = ((rendimentoAtual - rendimentoAnterior) / rendimentoAnterior) * 100;
  
        setVariacaoVisual({
          texto: `${variacao > 0 ? '+' : ''}${variacao.toFixed(2)}%`,
          cor: variacao > 0 ? '#00FF90' : '#FF4040',
          msg: variacao > 0 ? 'O rendimento melhorou!' : 'O rendimento piorou!',
        });
      }
    }
  
    // Só depois adiciona o novo registro
    historicoArray.push(novoRegistro);
    await AsyncStorage.setItem('@abastecimentos', JSON.stringify(historicoArray));
  
    const resumoTexto = `
  🔋 Combustível: ${tipoCombustivel}
  💵 Preço por litro: ${formatarCampoMonetario(precoNum)}
  ⛽ Total: ${formatarCampoMonetario(totalNum)}
  🧪 Litros: ${formatarCampoLitros(litrosNum)}
  🚗 KM Atual: ${kmNum.toLocaleString('pt-BR')}
  📊 Rendimento: ${rendimentoAtual?.toFixed(2) || '—'} km/L
  ${ultimos.length === 0 ? '📈 Primeiro registro deste combustível.' : ''}
  `.trim();
  
    setResumo(resumoTexto);
    setModalVisible(true);
  }
  
  function handleBlur(campo) {
    const precoNum = extrairNumero(preco);
    const totalNum = extrairNumero(total);
    const litrosNum = extrairNumero(litros);

    const resultado = calcularAutomaticamente({
      preco: precoNum,
      total: totalNum,
      litros: litrosNum,
    });

    if (resultado.preco) setPreco(resultado.preco);
    if (resultado.total) setTotal(resultado.total);
    if (resultado.litros) setLitros(resultado.litros);
  }

  function limparCampos() {
    setPreco('');
    setTotal('');
    setLitros('');
    setKmAtual('');
    if (combustiveisPermitidos.length > 1) {
      setTipoCombustivel('');
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcome}>📋 Registro de Abastecimento</Text>
          <Image source={require('../../assets/img1.png')} style={styles.logo} resizeMode="contain" />
        </View>

        {combustiveisPermitidos.length > 1 && (
          <>
            <Text style={styles.label}>Tipo de Combustível</Text>
            <View style={styles.fuelGroup}>
              {combustiveisPermitidos.map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.fuelButton,
                    tipoCombustivel === tipo && styles.fuelButtonSelected,
                  ]}
                  onPress={() => setTipoCombustivel(tipo)}
                >
                  <Text style={styles.fuelText}>{tipo}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Preço por litro"
          placeholderTextColor="#CCC"
          keyboardType="decimal-pad"
          value={preco}
          onFocus={() => setUltimoCampoEditado('preco')}
          onBlur={() => handleBlur('preco')}
          onChangeText={setPreco}
        />

        <TextInput
          style={styles.input}
          placeholder="Total abastecido"
          placeholderTextColor="#CCC"
          keyboardType="decimal-pad"
          value={total}
          onFocus={() => setUltimoCampoEditado('total')}
          onBlur={() => handleBlur('total')}
          onChangeText={setTotal}
        />

        <TextInput
          style={styles.input}
          placeholder="Litros abastecidos"
          placeholderTextColor="#CCC"
          keyboardType="decimal-pad"
          value={litros}
          onFocus={() => setUltimoCampoEditado('litros')}
          onBlur={() => handleBlur('litros')}
          onChangeText={setLitros}
        />

        <TextInput
          style={styles.input}
          placeholder="KM atual"
          placeholderTextColor="#CCC"
          keyboardType="numeric"
          value={kmAtual}
          onChangeText={(text) => setKmAtual(formatarKm(text))}
        />

        <TouchableOpacity style={styles.saveButton} onPress={salvarAbastecimento}>
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={limparCampos}>
          <Text style={styles.clearText}>Limpar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{resumo}</Text>

            {variacaoVisual.texto && (
              <>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: 'bold',
                    marginTop: 16,
                    textAlign: 'center',
                    color: variacaoVisual.cor,
                  }}
                >
                  {variacaoVisual.texto}
                </Text>
                <Text
                  style={{
                    textAlign: 'center',
                    color: variacaoVisual.cor,
                    marginBottom: 12,
                  }}
                >
                  {variacaoVisual.msg}
                </Text>
              </>
            )}

            <TouchableOpacity
              style={[styles.saveButton, { marginTop: 8 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.saveText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#0A0A0A', flexGrow: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#A35CFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  welcome: { color: '#FFF', fontSize: 18, fontWeight: 'bold', flex: 1 },
  logo: { width: 60, height: 60 },
  label: { color: '#FFF', marginBottom: 8, fontSize: 16, fontWeight: '500' },
  input: {
    backgroundColor: '#222',
    color: '#FFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  fuelGroup: { flexDirection: 'row', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  fuelButton: {
    backgroundColor: '#333',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A35CFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  fuelButtonSelected: { backgroundColor: '#A35CFF' },
  fuelText: { color: '#FFF' },
  saveButton: {
    backgroundColor: '#A35CFF',
    padding: 14,
    borderRadius: 6,
    marginBottom: 8,
  },
  saveText: { color: '#FFF', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  clearButton: {
    backgroundColor: '#444',
    padding: 14,
    borderRadius: 6,
    marginBottom: 12,
  },
  clearText: { color: '#FFF', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 24,
  },
  modalText: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 24,
    whiteSpace: 'pre-line',
  },
});

