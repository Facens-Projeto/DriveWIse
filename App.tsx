import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import FuelFormScreen from './src/screens/FuelFormScreen';
import VisaoPessoalScreen from './src/screens/VisaoPessoalScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import DebugScreen from './src/screens/DebugScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <Tab.Navigator
          id={undefined}
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#1e1e1e',
              borderTopColor: '#333',
            },
            tabBarActiveTintColor: '#7e54f6',
            tabBarInactiveTintColor: '#ccc',
            tabBarIcon: ({ color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Cadastro') {
                iconName = 'create-outline';}
              else if (route.name === 'Abastecimento') {
                iconName = 'car-sport-outline';
              } else if (route.name === 'Visão Pessoal') {
                iconName = 'person-circle-outline';
              } 
              else if (route.name === 'Debug') {
                iconName = 'bug';
              }
              else {
                iconName = 'apps-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >

        <Tab.Screen name="Cadastro" component={CadastroScreen} />
        <Tab.Screen name="Abastecimento" component={FuelFormScreen} />
        <Tab.Screen name="Visão Pessoal" component={VisaoPessoalScreen} />
        <Tab.Screen name="Debug" component={DebugScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
