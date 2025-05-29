// App.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp
} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './src/screens/LoginScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import FuelFormScreen from './src/screens/FuelFormScreen';
import VisaoPessoalScreen from './src/screens/VisaoPessoalScreen';
import DebugScreen from './src/screens/DebugScreen';
import FinanceiroScreen from './src/screens/FinanceiroScreen';
import DadosComunitariosScreen from './src/screens/DadosComunitariosScreen';
import data from './src/communityDB/data.json';


export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabRoutes() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1e1e1e', borderTopColor: '#333' },
        tabBarActiveTintColor: '#7e54f6',
        tabBarInactiveTintColor: '#ccc',
        tabBarIcon: ({ color, size }) => {
          let name: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case 'Cadastro': name = 'create-outline'; break;
            case 'Abastecimento': name = 'car-sport-outline'; break;
            case 'Visão Pessoal': name = 'person-circle-outline'; break;
            case 'Comunidade': name = 'person'; break;
            case 'Financeiro': name = 'cash'; break;
            case 'Debug': name = 'bug'; break;
            default: name = 'apps-outline';
          }
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Cadastro" component={CadastroScreen} />
      <Tab.Screen name="Abastecimento" component={FuelFormScreen} />
      <Tab.Screen name="Visão Pessoal" component={VisaoPessoalScreen} />
        <Tab.Screen name="DadosComunitarios" component={DadosComunitariosScreen} initialParams={{ data }} />
      <Tab.Screen name="Debug" component={DebugScreen} />
      <Tab.Screen name="Financeiro" component={FinanceiroScreen} options={{ title: 'Financeiro' }}/>
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={TabRoutes} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
