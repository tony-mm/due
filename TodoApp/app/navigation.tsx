import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './screens/HomeScreen';
import { AllTasksScreen } from './screens/AllTasksScreen';
import { RootStackParamList, MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabIcon: React.FC<{ focused: boolean; label: string }> = ({
  focused,
  label,
}) => (
  <View style={styles.tabIconContainer}>
    <View style={[styles.tabIconLine, focused && styles.tabIconLineActive]} />
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  </View>
);

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} label="Today" />
          ),
        }}
      />
      <Tab.Screen
        name="AllTasks"
        component={AllTasksScreen}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabIcon focused={focused} label="All" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    height: 80,
    paddingTop: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
  },
  tabIconLine: {
    width: 24,
    height: 3,
    backgroundColor: '#EEEEEE',
    borderRadius: 1.5,
    marginBottom: 4,
  },
  tabIconLineActive: {
    backgroundColor: '#2D2D2D',
  },
  tabLabel: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#2D2D2D',
  },
});