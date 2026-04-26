import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAuth } from '../contexts/AuthContext';

// Auth screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// App screens
import HomeScreen from '../screens/HomeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';
import GroupsScreen from '../screens/GroupsScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import FinancialScreen from '../screens/FinancialScreen';
import VenuesScreen from '../screens/VenuesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AssessmentScreen from '../screens/AssessmentScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: colors.white, elevation: 0 },
  headerTitleStyle: { fontSize: 16, fontWeight: '600' as const, color: colors.black },
  headerTintColor: colors.primary,
};

// ─── Auth Stack ───────────────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ─── Feature Stacks ───────────────────────────────────────────────────────────
function MatchesStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="MatchesList" component={MatchesScreen} options={{ title: 'Partidas' }} />
      <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: 'Detalhe da Partida' }} />
    </Stack.Navigator>
  );
}

function GroupsStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="GroupsList" component={GroupsScreen} options={{ title: 'Grupos' }} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: 'Grupo' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen name="Assessment" component={AssessmentScreen} options={{ title: 'Autoavaliação' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificações' }} />
      <Stack.Screen name="Venues" component={VenuesScreen} options={{ title: 'Quadras' }} />
    </Stack.Navigator>
  );
}

// ─── Tab icons config ─────────────────────────────────────────────────────────
type IconName = keyof typeof Ionicons.glyphMap;
const TAB_CONFIG: { name: string; label: string; icon: [IconName, IconName] }[] = [
  { name: 'Home',      label: 'Home',       icon: ['home',     'home-outline']     },
  { name: 'Matches',   label: 'Partidas',   icon: ['football', 'football-outline'] },
  { name: 'Groups',    label: 'Grupos',     icon: ['people',   'people-outline']   },
  { name: 'Financial', label: 'Financeiro', icon: ['card',     'card-outline']     },
  { name: 'Profile',   label: 'Perfil',     icon: ['person',   'person-outline']   },
];

// ─── Main Tabs ────────────────────────────────────────────────────────────────
function AppTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const cfg = TAB_CONFIG.find((t) => t.name === route.name)!;
        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.gray200,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom + 4,
            paddingTop: 6,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray600,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' as const },
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? cfg.icon[0] : cfg.icon[1]} size={22} color={color} />
          ),
        };
      }}
    >
      <Tab.Screen name="Home"      component={HomeScreen}   options={{ title: 'Home' }} />
      <Tab.Screen name="Matches"   component={MatchesStack} options={{ title: 'Partidas' }} />
      <Tab.Screen name="Groups"    component={GroupsStack}  options={{ title: 'Grupos' }} />
      <Tab.Screen name="Financial" component={FinancialScreen} options={{ title: 'Financeiro', headerShown: true, ...headerOptions }} />
      <Tab.Screen name="Profile"   component={ProfileStack} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
