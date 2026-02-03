import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Text } from 'react-native-paper';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import MemberDetailScreen from '../screens/Admin/MemberDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MemberStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ title: 'My Profile' }}
    />
    <Stack.Screen 
      name="EditProfile" 
      component={EditProfileScreen} 
      options={{ title: 'Edit Profile' }}
    />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="AdminDashboard" 
      component={AdminDashboardScreen} 
      options={{ title: 'Admin Dashboard' }}
    />
    <Stack.Screen 
      name="MemberDetail" 
      component={MemberDetailScreen} 
      options={{ title: 'Member Details' }}
    />
  </Stack.Navigator>
);

const MainTabs = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          
          if (route.name === 'MyProfile') {
            iconName = '👤';
          } else if (route.name === 'Admin') {
            iconName = '⚙️';
          }
          
          return <Text style={{ fontSize: size, color }}>{iconName}</Text>;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
      })}
    >
      <Tab.Screen 
        name="MyProfile" 
        component={MemberStack} 
        options={{ headerShown: false, title: 'My Profile' }}
      />
      {isAdmin && (
        <Tab.Screen 
          name="Admin" 
          component={AdminStack} 
          options={{ headerShown: false, title: 'Admin' }}
        />
      )}
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
