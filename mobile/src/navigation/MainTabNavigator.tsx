import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeIcon, FolderIcon, PlusIcon, UserIcon } from 'react-native-heroicons/outline';
import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import AddLinkScreen from '../screens/AddLinkScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../components/ui/theme';

// Main tab parameter list
export type MainTabParamList = {
  Home: undefined;
  Library: undefined;
  AddLink: undefined;
  Profile: undefined;
};

// Create the bottom tab navigator
const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Add icons based on route name
          switch (route.name) {
            case 'Home':
              return <HomeIcon size={size} color={color} />;
            case 'Library':
              return <FolderIcon size={size} color={color} />;
            case 'AddLink':
              return <PlusIcon size={size} color={color} />;
            case 'Profile':
              return <UserIcon size={size} color={color} />;
            default:
              return null;
          }
        },
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.gray[400],
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.gray[200],
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: "Home",
        }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryScreen}
        options={{
          title: "Library",
        }}
      />
      <Tab.Screen 
        name="AddLink" 
        component={AddLinkScreen}
        options={{
          title: "Add",
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
          },
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}