// src/screens/FuelFormScreen.js

import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';

export default function FuelFormScreen() {
  const [fuelType, setFuelType] = useState(null);
  const [precoPorLitro, setPrecoPorLitro] = useState('');
  const [totalAbastecido, setTotalAbastecido] = useState('');
  const [litrosAbastecidos, setLitrosAbastecidos] = useState('');
  const [kmAtual, setKmAtual] = useState('');
  const [resultado, setResultado] = useState('');

  const limpar = () => {
    setFuelType(null);
    setPrecoPorLitro('');
    setTotalAbastecido('');
    setLitrosAbastecidos('');
    setKmAtual('');
    setResultado('');
  };

  const salvar = () => {
    const res = `Combustível: ${fuelType || 'Não selecionado'}\nPreço por litro: ${precoPorLitro}\nTotal abastecido: ${totalAbastecido}\nLitros: ${litrosAbastecidos}\nKM atual: ${kmAtual}`;
    setResultado(res);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/img1.png')} style={styles.logo} resizeMode="contain" />

      {/* Botões de combustível */}
      <View style={styles.radioGroup}>
        {['Gasolina', 'Álcool', 'Diesel'].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            onPress={() => setFuelType(tipo)}
            style={[
              styles.radioButton,
              fuelType === tipo && styles.radioButtonSelected,
            ]}
          >
            <Text style={styles.radioText}>{tipo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Qual é o preço do litro?"
        placeholderTextColor="#CCC"
        value={precoPorLitro}
        onChangeText={setPrecoPorLitro}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Qual foi o valor total abastecido?"
        placeholderTextColor="#CCC"
        value={totalAbastecido}
        onChangeText={setTotalAbastecido}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Quantos litros você abasteceu?"
        placeholderTextColor="#CCC"
        value={litrosAbastecidos}
        onChangeText={setLitrosAbastecidos}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Qual a quilometragem total do seu veículo?"
        placeholderTextColor="#CCC"
        value={kmAtual}
        onChangeText={setKmAtual}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.saveButton} onPress={salvar}>
        <Text style={styles.saveButtonText}>Salvar e Enviar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearButton} onPress={limpar}>
        <Text style={styles.clearButtonText}>Limpar tudo</Text>
      </TouchableOpacity>

      {resultado ? (
        <Text style={styles.result}>{resultado}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#0A0A0A',
    flexGrow: 1,
  },
  logo: {
    width: 200,
    height: 80,
    alignSelf: 'center',
    marginBottom: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  radioButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#A35CFF',
  },
  radioButtonSelected: {
    backgroundColor: '#A35CFF',
  },
  radioText: {
    color: '#FFF',
  },
  input: {
    backgroundColor: '#222',
    color: '#FFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#A35CFF',
    padding: 14,
    borderRadius: 6,
    marginBottom: 4,
  },
  saveButtonText: {
    color: '#FFF',
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#444',
    padding: 14,
    borderRadius: 6,
    marginBottom: 12,
  },
  clearButtonText: {
    color: '#FFF',
    textAlign: 'center',
  },
  result: {
    color: '#FFF',
    fontSize: 14,
    marginTop: 6,
  },
});
