// app/components/SignupScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';

const API_BASE = 'http://192.168.42.41:8000';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [role, setRole] = useState<'gamer' | 'dev'>('dev');
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    if (!username || !pw1 || !pw2) {
      Alert.alert('Missing fields', 'Fill in all inputs.');
      return;
    }
    if (pw1 !== pw2) {
      Alert.alert('Passwords differ', 'Both password fields must match.');
      return;
    }

    setBusy(true);
    try {
      const body = new URLSearchParams();
      body.append('username', username);
      body.append('password1', pw1);
      body.append('password2', pw2);
      body.append('user_type', role);

      const r = await fetch(`${API_BASE}/accounts/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        credentials: 'include',
      });

      if (!r.ok) throw new Error(`HTTP ${r.status}`);

      Alert.alert('Success', 'Account created – you can now log in.');
    } catch (e: any) {
      Alert.alert('Sign‑up failed', e.message ?? 'unknown error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {/* Role selector */}
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleBtn, role === 'dev' && styles.roleBtnSel]}
          onPress={() => setRole('dev')}
        >
          <Text style={[styles.roleTxt, role === 'dev' && styles.roleTxtSel]}>
            Developer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleBtn, role === 'gamer' && styles.roleBtnSel]}
          onPress={() => setRole('gamer')}
        >
          <Text style={[styles.roleTxt, role === 'gamer' && styles.roleTxtSel]}>
            Gamer
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form fields */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#6c757d"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6c757d"
        value={pw1}
        onChangeText={setPw1}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Repeat password"
        placeholderTextColor="#6c757d"
        value={pw2}
        onChangeText={setPw2}
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={handle} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnTxt}>Sign Up</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

/* --------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 20, textAlign: 'center' },

  roleRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  roleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#0066cc',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  roleBtnSel: { backgroundColor: '#0066cc' },
  roleTxt: { color: '#0066cc' },
  roleTxtSel: { color: '#fff' },

  input: {
    height: 44,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    color: '#212529',
  },

  btn: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  btnTxt: { color: '#fff', fontWeight: '600', fontSize: 16 },
});