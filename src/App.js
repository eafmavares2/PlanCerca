
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      <StatusBar style="light" />

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Home">
            {(props) => (
              <HomeScreen
                {...props}
                onLogout={() => setIsAuthenticated(false)}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  onLogin={() => setIsAuthenticated(true)}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Register">
              {(props) => (
                <RegisterScreen
                  {...props}
                  onLogin={() => setIsAuthenticated(true)}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
