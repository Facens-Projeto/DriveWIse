import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


const FuelFormScreen = () => {
  const [fuelType, setFuelType] = useState<string | null>(null);
  const [variacaoInfo, setVariacaoInfo] = useState<{
    melhorou: boolean;
    valor: string;
  } | null>(null);
  
  const [precoPorLitro, setPrecoPorLitro] = useState('');
  const [totalAbastecido, setTotalAbastecido] = useState('');
  const [litrosAbastecidos, setLitrosAbastecidos] = useState('');
  const [kmAtual, setKmAtual] = useState('');
  const [resultado, setResultado] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [resumoData, setResumoData] = useState<{
    tipo: string;
    data: string;
    litros: number;
    total: number;
    trajeto: number;
    rendimento: number;
    custoPorKm: number;
    variacaoTexto: string;
    variacaoValor: string | null;
    melhorou: boolean | null;
    preco: number;
    km: number;
  } | null>(null);
  
  const [combustiveisDisponiveis, setCombustiveisDisponiveis] = useState<string[]>([]);
  const calcularTerceiroCampo = () => {
    const preco = parseFloat(precoPorLitro.replace(',', '.'));
    const total = parseFloat(totalAbastecido.replace(',', '.'));
    const litros = parseFloat(litrosAbastecidos.replace(',', '.'));
  
    const temPreco = !isNaN(preco);
    const temTotal = !isNaN(total);
    const temLitros = !isNaN(litros);
  
    if (temPreco && temTotal && !temLitros) {
      setLitrosAbastecidos((total / preco).toFixed(2).replace('.', ','));
    } else if (temPreco && temLitros && !temTotal) {
      setTotalAbastecido((preco * litros).toFixed(2).replace('.', ','));
    } else if (temTotal && temLitros && !temPreco) {
      setPrecoPorLitro((total / litros).toFixed(2).replace('.', ','));
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      const carregarCombustiveis = async () => {
        const cadastro = await AsyncStorage.getItem('@cadastro_usuario');
        console.log('Cadastro encontrado:', cadastro);
  
        if (cadastro) {
          const { veiculo } = JSON.parse(cadastro);
          console.log('Combustíveis carregados:', veiculo.combustiveisAceitos); 
          setCombustiveisDisponiveis(veiculo.combustiveisAceitos || []);
            if (veiculo.combustiveisAceitos.length === 1) {
              setFuelType(veiculo.combustiveisAceitos[0]); 
            }
        }
      };
      carregarCombustiveis();
    }, [])
  );
  
  const camposCompletos = precoPorLitro && totalAbastecido && litrosAbastecidos && kmAtual && (fuelType || combustiveisDisponiveis.length === 1);

  const limpar = () => {
    setFuelType(null);
    setPrecoPorLitro('');
    setTotalAbastecido('');
    setLitrosAbastecidos('');
    setKmAtual('');
    setResultado('');
  };

  const salvar = async () => {
      if (!fuelType || !precoPorLitro || !totalAbastecido || !litrosAbastecidos || !kmAtual) {
        Alert.alert('Preencha todos os campos!');
        return;
      }
  
      const preco = parseFloat(precoPorLitro.replace(',', '.'));
      const total = parseFloat(totalAbastecido.replace(',', '.'));
      const litros = parseFloat(litrosAbastecidos.replace(',', '.'));
      const km = parseInt(kmAtual.replace(/\./g, ''));
      const data = new Date().toISOString();

      const novo = { tipo: fuelType, preco, total, litros, km, data };

      // Buscar abastecimentos antigos
      const armazenado = await AsyncStorage.getItem('@abastecimentos');
      const lista: any[] = armazenado ? JSON.parse(armazenado) : [];

      // Atualizar a quilometragem no cadastro
      const cadastro = await AsyncStorage.getItem('@cadastro_usuario');
      if (cadastro) {
        const dados = JSON.parse(cadastro);
        dados.veiculo.quilometragem = km;
        await AsyncStorage.setItem('@cadastro_usuario', JSON.stringify(dados));
      }

      // Cálculo retroativo do abastecimento anterior do mesmo tipo
      const anterioresMesmoTipo = lista
        .filter((item) => item.tipo === fuelType)
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

      let resumo = null;

      if (anterioresMesmoTipo.length >= 1) {
        const anterior = anterioresMesmoTipo[0];
        const trajeto = km - anterior.km;
        const rendimento = trajeto / anterior.litros;
        const custoPorKm = anterior.total / trajeto;

        let variacaoTexto = 'Não disponível';
        let variacaoValor = null;
        let melhorou = null;

        if (anterioresMesmoTipo.length >= 2) {
          const penultimo = anterioresMesmoTipo[1];
          const trajetoPenultimo = anterior.km - penultimo.km;
          const rendimentoPenultimo = trajetoPenultimo / penultimo.litros;

          const variacao = ((rendimento - rendimentoPenultimo) / rendimentoPenultimo) * 100;
          variacaoTexto = `${variacao > 0 ? '+' : ''}${variacao.toFixed(1)}%`;
          variacaoValor = Math.abs(variacao).toFixed(1);
          melhorou = variacao > 0;
        }

        resumo = {
          tipo: anterior.tipo,
          data: anterior.data,
          litros: anterior.litros,
          total: anterior.total,
          trajeto,
          rendimento,
          custoPorKm,
          variacaoTexto,
          variacaoValor,
          melhorou,
          preco: anterior.preco,
          km: anterior.km,
        };
      }

      // Salvar novo abastecimento
      lista.push(novo);
      await AsyncStorage.setItem('@abastecimentos', JSON.stringify(lista));

      setResumoData(resumo);
      setModalVisible(true);
      limpar();
    };

  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabeçalho roxo com texto e logo */}
        <View style={styles.topBanner}>
          <Text style={styles.bannerText}>⛽ Registro de abastecimento</Text>
          <Image source={require('../assets/img1.png')} style={styles.bannerLogo} resizeMode="contain" />
        </View>

        {/* Seleção do tipo de combustível */}

<View style={{ marginBottom: 16 }}>
  <Text style={styles.label}>Tipo de Combustível</Text>
  {combustiveisDisponiveis.length > 1 ? (
    <View style={styles.radioGroup}>
      {combustiveisDisponiveis.map((tipo) => (
        <TouchableOpacity
          key={tipo}
          style={[styles.radioButton, fuelType === tipo && styles.radioButtonSelected]}
          onPress={() => setFuelType(tipo)}
        >
          <Text style={styles.radioText}>{tipo}</Text>
        </TouchableOpacity>
      ))}
    </View>
  ) : (
    <Text style={[styles.radioText, { marginLeft: 12 }]}>
      {fuelType || 'Não informado'}
    </Text>
  )}
</View>


        {/* Campo: Preço por litro */}
        <Text style={styles.label}>Preço por litro</Text>
        <TextInput
            style={styles.input}
            placeholder="Ex: 6,00"
            placeholderTextColor="#aaa"
            value={precoPorLitro}
            onChangeText={(text) => setPrecoPorLitro(text.replace(/[^0-9,]/g, ''))}
            keyboardType="numeric"
            onBlur={calcularTerceiroCampo}
        />


        {/* Campo: Total abastecido */}
        <Text style={styles.label}>Total abastecido</Text>
        <TextInput
            style={styles.input}
            placeholder="Ex: 50,00"
            placeholderTextColor="#aaa"
            value={totalAbastecido}
            onChangeText={(text) => setTotalAbastecido(text.replace(/[^0-9,]/g, ''))}
            keyboardType="numeric"
            onBlur={calcularTerceiroCampo}
        />

        <Text style={styles.label}>Litros abastecidos</Text>
        <TextInput
            style={styles.input}
            placeholder="Ex: 8,33"
            placeholderTextColor="#aaa"
            value={litrosAbastecidos}
            onChangeText={(text) => setLitrosAbastecidos(text.replace(/[^0-9,]/g, ''))}
            keyboardType="numeric"
            onBlur={calcularTerceiroCampo}
        />


        {/* Campo: Quilometragem atual */}
        <Text style={styles.label}>Quilometragem atual</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 85.000"
          placeholderTextColor="#aaa"
          value={kmAtual}
          onChangeText={(text) =>
            setKmAtual(text.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
          }
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[
            styles.saveButton,
            !camposCompletos && styles.botaoDesabilitado
          ]}
          onPress={salvar}
          disabled={!camposCompletos}
        >
          <Text style={styles.textoBotao}>Salvar e Enviar</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.clearButton} onPress={limpar}>
          <Text style={styles.clearButtonText}>Limpar tudo</Text>
        </TouchableOpacity>

        {resultado ? (
          <Text style={styles.resultado}>{resultado}</Text>
        ) : null}
      </ScrollView>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {resumoData ? (
              <View>
                <Text style={styles.modalTitle}>🛢️ Abastecimento Anterior ({resumoData.tipo})</Text>
                <Text style={styles.modalLine}>📆 Data: {new Date(resumoData.data).toLocaleDateString('pt-BR')}</Text>
                <Text style={styles.modalLine}>🛣️ Trajeto: {resumoData.trajeto} km</Text>
                <Text style={styles.modalLine}>🧪 Litros: {resumoData.litros.toFixed(2).replace('.', ',')} L</Text>
                <Text style={styles.modalLine}>⚙️ Rendimento: {resumoData.rendimento.toFixed(2)} km/L</Text>
                <Text style={styles.modalLine}>💲 Custo por km: R$ {resumoData.custoPorKm.toFixed(2).replace('.', ',')}</Text>

                {resumoData.variacaoValor !== null ? (
                  <View style={{ marginTop: 12, alignItems: 'center' }}>
                    <Text
                      style={[
                        styles.variacaoTexto,
                        { color: resumoData.melhorou ? '#4CAF50' : '#FF5252' },
                      ]}
                    >
                      {resumoData.melhorou ? '📈' : '📉'} {resumoData.variacaoTexto}
                    </Text>
                    <Text style={{ color: '#aaa', fontSize: 14 }}>
                      O rendimento {resumoData.melhorou ? 'melhorou' : 'piorou'} em relação ao anterior.
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.modalLine, { marginTop: 12 }]}>
                    📊 Comparação indisponível (somente 1 abastecimento).
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.modalLine}>📄 Nenhum dado disponível para mostrar ainda.</Text>
            )}

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>



    </KeyboardAvoidingView>

  );
};

export default FuelFormScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 48,
    backgroundColor: '#121212',
  },
  botaoDesabilitado: {
  backgroundColor: '#555', 
},
textoBotao: {
  color: '#fff',
  fontWeight: 'bold',
  textAlign: 'center',
  fontSize: 16,
},

  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.7)',
  justifyContent: 'center',
  alignItems: 'center',
},
  modalContainer: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 12,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalLine: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  modalButton: {
    backgroundColor: '#7e54f6',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  variacaoTexto: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '85%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 15,
    color: '#ccc',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  variacaoDescricao: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  variacaoMelhorou: {
    color: '#4CAF50', // Verde
  },
  variacaoPiorou: {
    color: '#F44336', // Vermelho
  },
  closeButton: {
    backgroundColor: '#7e54f6',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
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
  
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
    color: '#ccc',
  },
  
  input: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  radioButton: {
    borderWidth: 1,
    borderColor: '#777',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginTop: 4,
    backgroundColor: '#222',
  },
  radioButtonSelected: {
    backgroundColor: '#7e54f6',
    borderColor: '#a27bff',
  },
  radioText: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#7e54f6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#aaa',
    fontSize: 14,
  },
  resultado: {
    marginTop: 24,
    color: '#aaa',
    fontSize: 14,
  },
});
