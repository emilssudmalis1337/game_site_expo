// app/src/components/HamburgerMenu.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_WIDTH = Math.min(260, SCREEN_WIDTH * 0.8); // max 260 dp or 80 % of screen

export const HamburgerMenu = () => {
  const router = useRouter();               // <-- expo‑router navigation helper
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;

  // --------------------------------------------------------------
  // Open / close the drawer
  // --------------------------------------------------------------
  const toggle = () => {
    if (open) {
      // slide out → hide
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setOpen(false));
    } else {
      // make it visible first, then slide in
      setOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  // --------------------------------------------------------------
  // Navigate to a route and then close the drawer
  // --------------------------------------------------------------
  const go = (dest: string) => {
    router.push(dest);   // dest = '/', '/login', '/signup', …
    toggle();            // close drawer after navigation
  };

  return (
    <>
      {/* ---------- Hamburger icon (always visible) ---------- */}
      <TouchableOpacity onPress={toggle} style={styles.hamburgerBtn}>
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
      </TouchableOpacity>

      {/* ---------- Dimmed backdrop (only when open) ---------- */}
      {open && <Pressable style={styles.backdrop} onPress={toggle} />}

      {/* ---------- Sliding drawer panel ---------- */}
      <Animated.View
        style={[
          styles.menuPanel,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <Text style={styles.menuHeader}>Menu</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => go('/')}>
          <Text style={styles.menuItemText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => go('/login')}>
          <Text style={styles.menuItemText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => go('/signup')}>
          <Text style={styles.menuItemText}>Sign Up</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

/* --------------------------------------------------------------- */
/* -------------------------- STYLES ----------------------------- */
const styles = StyleSheet.create({
  // ----- Hamburger icon (top‑left) -----
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
  hamburgerLine: {
    width: 24,
    height: 2,
    backgroundColor: '#1',
    marginVertical: 3,          // ← this line is now inside the object correctly
  },

  // ----- Dimmed backdrop (covers the rest of the screen) -----
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

  // ----- Drawer panel that slides in/out -----
  menuPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: '#0066cc',
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 15,
    elevation: 5, // Android shadow
  },

  menuHeader: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 30,
  },

  menuItem: {
    paddingVertical: 12,
    borderBottomColor: '#fff4',
    borderBottomWidth: 1,
  },

  menuItemText: {
    color: '#fff',
    fontSize: 18,
  },
});
export default HamburgerMenu;