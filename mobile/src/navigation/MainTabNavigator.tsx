import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import AddLinkScreen from '../screens/AddLinkScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { HomeIcon, FolderIcon, PlusCircleIcon, UserIcon } from 'react-native-heroicons/outline';
import { BlurView } from 'expo-blur';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { colors } from '../components/ui/theme';

export type MainTabParamList = {
  Home: undefined;
  Library: undefined;
  AddLink: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom tab bar button for the add link button
function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.addButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.addButtonInner}>
        <PlusCircleIcon color={colors.white} size={28} />
      </View>
    </TouchableOpacity>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12 },
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="light" />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.white }]} />
          )
        ),
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <HomeIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <FolderIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="AddLink" 
        component={AddLinkScreen} 
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({ color, size }) => (
            <PlusCircleIcon color={color} size={size} />
          ),
          tabBarButton: (props) => (
            <AddButton onPress={props.onPress} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserIcon color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  addButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});