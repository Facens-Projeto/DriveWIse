import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { LoginLayout } from '../../components/LoginLayout';
import { useRouter } from 'expo-router';


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  return (
    <LoginLayout
      email={email}
      senha={senha}
      onChangeEmail={setEmail}
      onChangeSenha={setSenha}
      onPressLogin={() => console.log('Login')}
      onPressForgotPassword={() => router.push('../../ForgotPasswordScreen')} 
      onPressRegister={() => router.push('../../RegisterScreen')}
    />
  );
}
