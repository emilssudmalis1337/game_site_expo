// app/components/LoginScreen.tsx
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

// -----------------------------------------------------------------
//  Base URL of your Django API – keep it in sync with other files
// -----------------------------------------------------------------
const API_BASE = 'http://192.168.42.41:8000';

type Props = {
  /** Called with the username when login succeeds */
  onLoginSuccess: (username: string) => void;
};

export default function LoginScreen({ onLoginSuccess }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    if (!username || !password) {
      Alert.alert('Missing fields', 'Enter both username and password.');
      return;
    }

    setBusy(true);
    try {
      const body = new URLSearchParams();
      body.append('username', username);
      body.append('password', password);

      const response = await fetch(`${API_BASE}/accounts/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        credentials: 'include',               // keep the session cookie
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();   // expects {detail, username}
      Alert.alert('Success', data.detail);
      onLoginSuccess(data.username);        // <-- tells Layout we are logged in
    } catch (e: any) {
      Alert.alert('Login failed', e.message ?? 'unknown error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#6c757d"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoComplete="username"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6c757d"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
      />

      <TouchableOpacity style={styles.btn} onPress={handle} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnTxt}>Log In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

/* --------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
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