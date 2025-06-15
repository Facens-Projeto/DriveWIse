// src/routes/index.js
import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CadastroScreen from '../screens/CadastroScreen';
import AbastecimentoForm from '../components/AbastecimentoForm';
import VisaoPessoalScreen from '../screens/VisaoPessoalScreen';
import DebugScreen from '../screens/DebugScreen';

const Tab = createBottomTabNavigator();

export default function AppRoutes() {
  useEffect(() => {
    const limparDadosLocais = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        if (keys.length > 0) {
          await AsyncStorage.multiRemove(keys);
          console.log('🧹 Dados locais removidos com sucesso');
        }
      } catch (e) {
        console.error('Erro ao limpar dados locais:', e);
      }
    };

    limparDadosLocais();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: '#0A0A0A', borderTopColor: '#222' },
          tabBarActiveTintColor: '#A35CFF',
          tabBarInactiveTintColor: '#777',
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Cadastro') iconName = focused ? 'person' : 'person-outline';
            else if (route.name === 'Abastecimento') iconName = focused ? 'car' : 'car-outline';
            else if (route.name === 'Visão Pessoal') iconName = focused ? 'analytics' : 'analytics-outline';

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Cadastro" component={CadastroScreen} />
        <Tab.Screen name="Abastecimento" component={AbastecimentoForm} />
        <Tab.Screen name="Visão Pessoal" component={VisaoPessoalScreen} />
        <Tab.Screen name="Debug" component={DebugScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
