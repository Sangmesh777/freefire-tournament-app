import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TournamentListScreen from '../screens/TournamentListScreen';
import TournamentDetailScreen from '../screens/TournamentDetailScreen';
import TeamScreen from '../screens/TeamScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import MatchScreen from '../screens/MatchScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#0a0a0a' },
  headerTintColor: '#FF6B00',
  headerTitleStyle: { fontWeight: 'bold', color: '#FFFFFF' },
  contentStyle: { backgroundColor: '#0a0a0a' },
};

const tabBarOptions = {
  tabBarStyle: {
    backgroundColor: '#111111',
    borderTopColor: '#333333',
    height: 60,
    paddingBottom: 8,
  },
  tabBarActiveTintColor: '#FF6B00',
  tabBarInactiveTintColor: '#666666',
  headerStyle: { backgroundColor: '#0a0a0a' },
  headerTintColor: '#FF6B00',
  headerTitleStyle: { fontWeight: 'bold', color: '#FFFFFF' },
};

const MainTabs = () => (
  <Tab.Navigator screenOptions={tabBarOptions}>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
      }}
    />
    <Tab.Screen
      name="Tournaments"
      component={TournamentListScreen}
      options={{
        tabBarLabel: 'Tournaments',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏆</Text>,
      }}
    />
    <Tab.Screen
      name="Team"
      component={TeamScreen}
      options={{
        tabBarLabel: 'Team',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👥</Text>,
      }}
    />
    <Tab.Screen
      name="Leaderboard"
      component={LeaderboardScreen}
      options={{
        tabBarLabel: 'Leaderboard',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text>,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!user ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="OTP" component={OTPScreen} options={{ title: 'Verify OTP' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} options={{ title: 'Tournament' }} />
            <Stack.Screen name="Match" component={MatchScreen} options={{ title: 'Match' }} />
            <Stack.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin Panel' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
