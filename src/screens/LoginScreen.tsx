// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { signIn, signUp, getUserId } from '../services/firebase';
import { buscarVeiculosDoUsuario } from '../services/veiculosService';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Login'>>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }

      const uid = await getUserId();
      if (!uid) {
        Alert.alert('Erro', 'Não foi possível obter o ID do usuário.');
        return;
      }

      let veiculos = [];

      try {
        veiculos = await buscarVeiculosDoUsuario(uid);
      } catch (apiError) {
        console.warn('Erro ao buscar veículos, direcionando para cadastro:', apiError);
      }

      if (!veiculos || veiculos.length === 0) {
        navigation.replace('Cadastro');
      } else {
        navigation.replace('Main');
      }

    } catch (err: any) {
      Alert.alert('Falha', err.message || 'Erro inesperado ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          style={styles.inner}
          behavior={Platform.select({ ios: 'padding', android: undefined })}
        >
          <View style={styles.header}>
            <Image
              source={require('../assets/img1.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Bem Vindo</Text>
          </View>
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#666"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={[styles.button, (loading || !email || !password) && { opacity: 0.6 }]}
              onPress={handleAuth}
              disabled={loading || !email || !password}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? mode === 'login'
                    ? 'Entrando...'
                    : 'Cadastrando...'
                  : mode === 'login'
                    ? 'Entrar'
                    : 'Criar Conta'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
              style={styles.switchMode}
            >
              <Text style={styles.switchText}>
                {mode === 'login'
                  ? 'Ainda não tem conta? Cadastre-se'
                  : 'Já tem conta? Faça o login'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    width: '100%',
    backgroundColor: '#7e54f6',
    paddingVertical: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 30,
  },
  inner: { flex: 1, alignItems: 'center' },
  logo: { width: 120, height: 120, marginBottom: 10 },
  title: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  form: { width: '80%', alignItems: 'center' },
  input: {
    width: '100%',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    width: '100%',
    backgroundColor: '#7e54f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switchMode: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#aaa', fontSize: 14 },
});
