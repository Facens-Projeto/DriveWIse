import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { loginStyles as styles } from '../assets/styles/login.styles';

interface LoginLayoutProps {
  email: string;
  senha: string;
  onChangeEmail: (text: string) => void;
  onChangeSenha: (text: string) => void;
  onPressLogin: () => void;
  onPressForgotPassword: () => void;
  onPressRegister: () => void;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({
  email,
  senha,
  onChangeEmail,
  onChangeSenha,
  onPressLogin,
  onPressForgotPassword,
  onPressRegister,
}) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/drivewise-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={onChangeEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Digite sua senha"
        placeholderTextColor="#aaa"
        value={senha}
        onChangeText={onChangeSenha}
        secureTextEntry
      />

      <TouchableOpacity onPress={onPressForgotPassword}>
        <Text style={styles.link}>Esqueci minha senha</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onPressLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onPressRegister}>
        <Text style={styles.link}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
};
