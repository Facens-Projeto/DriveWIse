import React from 'react';
import { StatusBar, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './src/screens/LoginScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import FuelFormScreen from './src/screens/FuelFormScreen';
import VisaoPessoalScreen from './src/screens/VisaoPessoalScreen';
import FinanceiroScreen from './src/screens/FinanceiroScreen';
import DadosComunitariosScreen from './src/screens/DadosComunitariosScreen';
import DebugScreen from './src/screens/DebugScreen';
import ComparativoScreen from './src/screens/ComparativoScreen';

// Definições de rotas
export type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Main: undefined;
  Debug: undefined;
};
export type TabParamList = {
  Abastecimento: undefined;
  'Visão Pessoal': undefined;
  Financeiro: undefined;
  'Dados Comunitários': undefined;
  Comparativo: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1e1e1e', borderTopColor: '#333' },
        tabBarActiveTintColor: '#7e54f6',
        tabBarInactiveTintColor: '#ccc',
        tabBarIcon: ({ color, size }) => {
          let name: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case 'Abastecimento': name = 'car-sport-outline'; break;
            case 'Visão Pessoal': name = 'person-circle-outline'; break;
            case 'Financeiro': name = 'cash-outline'; break;
            case 'Dados Comunitários': name = 'people-outline'; break;
            case 'Comparativo': name = 'stats-chart-outline'; break;
            default: name = 'apps-outline';
          }
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Abastecimento" component={FuelFormScreen} />
      <Tab.Screen name="Visão Pessoal" component={VisaoPessoalScreen} />
      <Tab.Screen name="Financeiro" component={FinanceiroScreen} />
      <Tab.Screen name="Dados Comunitários" component={DadosComunitariosScreen} />
      <Tab.Screen
        name="Comparativo"
        component={ComparativoScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: () => (
            <TouchableOpacity
              onLongPress={() => navigation.getParent<
                import('@react-navigation/native-stack').NativeStackNavigationProp<RootStackParamList>
              >()?.navigate('Debug')}
              style={{ padding: 10 }}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                Comparativo
              </Text>
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: '#121212' },
        })}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Debug" component={DebugScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
