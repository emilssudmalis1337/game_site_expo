// app/_layout.tsx
// ──────────────────────────────────────────────────────────────
//  Layout – drawer navigation + role‑aware menu
// ──────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';

// Screens that live inside the drawer
import HomeScreen from '../src/components/HomeScreen';
import LoginScreen from '../src/components/LoginScreen';
import SignupScreen from '../src/components/SignupScreen';
import EditListingsScreen from '../src/components/EditListingsScreen';

// -----------------------------------------------------------------
//  Constants for the drawer animation
// -----------------------------------------------------------------
const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_WIDTH = Math.min(260, SCREEN_WIDTH * 0.8);

// -----------------------------------------------------------------
//  Types for the drawer props
// -----------------------------------------------------------------
type MenuProps = {
  /** Logged‑in username or null */
  user: string | null;
  /** Role of the logged‑in user: "dev", "gamer", or null */
  role: 'dev' | 'gamer' | null;
  /** Called when the user logs out */
  onLogout: () => void;
  /** Switch the main screen (home / login / signup) */
  setScreen: (s: 'home' | 'login' | 'signup') => void;
};

// -----------------------------------------------------------------
//  Hamburger menu – now receives the role and shows the extra item
// -----------------------------------------------------------------
const renderScreen = () => {
  switch (screen) {
    case 'login':
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    case 'signup':
      return <SignupScreen />;
    case 'edit':               // <-- new case
      return <EditListingsScreen />;
    default:
      return <HomeScreen user={user} />;
  }
};

const HamburgerMenu = ({
  user,
  role,
  onLogout,
  setScreen,
}: MenuProps) => {
  const [open, setOpen] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-MENU_WIDTH)).current;

  const toggle = () => {
    if (open) {
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setOpen(false));
    } else {
      setOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  // -----------------------------------------------------------------
  //  Navigation helpers – they just tell Layout which screen to render
  // -----------------------------------------------------------------
type ScreenName = 'home' | 'login' | 'signup' | 'edit';

const go = (dest: ScreenName) => {
  setScreen(dest);
  toggle();               // close drawer after navigation
};

  // -----------------------------------------------------------------
  //  Logout – hits the Django endpoint, clears local state
  // -----------------------------------------------------------------
const handleLogout = async () => {
  try {
    const r = await fetch(`${SERVER_ROOT}/accounts/logout/`, {
    method: 'POST',
      credentials: 'include',
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);

    // ① Clear auth state in the parent Layout
    onLogout();     // ← this sets user & role to null

    // ② **Redirect to Home**
    setScreen('home');        // <-- add this line

    // ③ Close the drawer
    toggle();
  } catch (e: any) {
    Alert.alert('Logout failed', e.message ?? 'unknown error');
  }
};

  return (
    <>
      {/* ---------- Hamburger icon ---------- */}
      <TouchableOpacity onPress={toggle} style={styles.hamburgerBtn}>
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
      </TouchableOpacity>

      {/* ---------- Dimmed backdrop ---------- */}
      {open && <Pressable style={styles.backdrop} onPress={toggle} />}

      {/* ---------- Sliding drawer panel ---------- */}
      <Animated.View
        style={[styles.menuPanel, { transform: [{ translateX: slideAnim }] }]}
      >
        {/* Greeting or generic header */}
        {user ? (
          <Text style={styles.greeting}>Hi, {user}!</Text>
        ) : (
          <Text style={styles.menuHeader}>Menu</Text>
        )}

        {/* ---- Always‑available items ---- */}
        <TouchableOpacity style={styles.menuItem} onPress={() => go('home')}>
          <Text style={styles.menuItemText}>Home</Text>
        </TouchableOpacity>

        {/* ---- Extra item for developers only ---- */}
        {user && role === 'dev' && (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={() => go('edit')}
  >
    <Text style={styles.menuItemText}>Edit listings</Text>
  </TouchableOpacity>
)}

        {/* ---- Auth‑dependent actions ---- */}
        {user ? (
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.menuItemText}>Log Out</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => go('login')}
            >
              <Text style={styles.menuItemText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => go('signup')}
            >
              <Text style={styles.menuItemText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </>
  );
};

// -----------------------------------------------------------------
//  Layout – the single source of truth for user, role and current screen
// -----------------------------------------------------------------
export default function Layout() {
  // -----------------------------------------------------------------
  //  1️⃣  Authentication state
  // -----------------------------------------------------------------
  // 1️⃣  Authentication state
const [user, setUser] = useState<string | null>(null);
const [role, setRole] = useState<'dev' | 'gamer' | null>(null);

// 2️⃣  Which main screen is currently displayed
const [screen, setScreen] = useState<'home' | 'login' | 'signup' | 'edit'>('home');


  // -----------------------------------------------------------------
  //  3️⃣  Called by LoginScreen when the backend reports success
  // -----------------------------------------------------------------
  const handleLoginSuccess = async (username: string) => {
    // We now also need the user’s role. The simplest way is to ask the
    // Django backend for it right after login.
    try {
      const r = await fetch(`${SERVER_ROOT}/accounts/me/`, {
        credentials: 'include',
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data: { username: string; user_type: 'dev' | 'gamer' } = await r.json();

      setUser(data.username);
      setRole(data.user_type);
      setScreen('home');
    } catch (e) {
      // If the extra endpoint fails we still fall back to a logged‑in user
      // without a known role (treat as “gamer” for safety).
      console.warn('Could not fetch role:', e);
      setUser(username);
      setRole('gamer');
      setScreen('home');
    }
  };

  // -----------------------------------------------------------------
  //  4️⃣  Render the appropriate screen
  // -----------------------------------------------------------------
const renderScreen = () => {
  switch (screen) {
    case 'login':
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    case 'signup':
      return <SignupScreen />;
    case 'edit':                     // <-- new branch
      return <EditListingsScreen />;
    default:
      return <HomeScreen user={user} />;
  }
};

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Hamburger menu gets user, role and logout handler */}
      <HamburgerMenu
        user={user}
        role={role}
        onLogout={() => {
          setUser(null);
          setRole(null);
        }}
        setScreen={setScreen}
      />

      {/* Main content area – only ONE screen is rendered at a time */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Optional Stack – kept from your original file */}
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}

// -----------------------------------------------------------------
//  Constants & Styles (unchanged from your original file)
// -----------------------------------------------------------------
const SERVER_ROOT = 'http://192.168.42.41:8000';

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#f8f9fa' },

  content: { flex: 1, padding: 12, marginTop: 48 },

  hamburgerBtn: {
    position: 'absolute',
    top:
      Platform.OS === 'ios'
        ? (StatusBar.currentHeight ?? 20) + 12
        : 12,
    left: 12,
    padding: 8,
    zIndex: 20,
  },
  hamburgerLine: { width: 24, height: 2, backgroundColor: '#333', marginVertical: 3 },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    opacity: 0.35,
    zIndex: 10,
  },

  menuPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: '#444',
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 15,
    elevation: 5,
  },

  menuHeader: { color: '#fff', fontSize: 22, fontWeight: '600', marginBottom: 30 },
  greeting: { color: '#fff', fontSize: 20, fontWeight: '500', marginBottom: 20 },

  menuItem: { paddingVertical: 12, borderBottomColor: '#fff4', borderBottomWidth: 1 },
  menuItemText: { color: '#fff', fontSize: 18 },
});