import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import styles from '../assets/styles/RegisterScreen.styles';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registered, setRegistered] = useState(false);

  /* SIMULA UM CADASTRO BEM SUCEDIDO*/
  const handleRegister = () => {
    console.log({
      fullName,
      birthDate,
      email,
      password,
    });
    setRegistered(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {!registered ? (
        <>
          <Text style={styles.title}>Criar conta</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Data de nascimento (DD/MM/AAAA)"
            placeholderTextColor="#999"
            value={birthDate}
            onChangeText={setBirthDate}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={styles.linkText}>Voltar para login</Text>
          </TouchableOpacity>

        </>
      ) : (
        <>
          <Text style={[styles.title, { marginBottom: 20 }]}>Cadastro concluído!</Text>
          <TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={styles.linkText}>Voltar para login</Text>
          </TouchableOpacity>

        </>
      )}
    </SafeAreaView>
  );
}
