import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { loginStyles as styles } from '../assets/styles/login.styles';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSendCode = () => {
    if (!email.includes('@')) {
      Alert.alert('Erro', 'Digite um e-mail válido.');
      return;
    }

    Alert.alert(
      'Código enviado',
      `Enviamos um código de recuperação para ${email}.`
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'DriveWise' }} /> 

      <View style={styles.container}>
        <Text style={styles.title}>Recuperar Senha</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity style={styles.button} onPress={handleSendCode}>
          <Text style={styles.buttonText}>Enviar código de recuperação</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Voltar para login</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
