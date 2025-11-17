// app/components/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';

/* -------------------------------------------------------------
   1️⃣  URL constants – keep the games endpoint under /api,
        but call the whitelist view at the root level.
   ------------------------------------------------------------- */
const SERVER_ROOT = 'http://192.168.42.41:8000';
const GAMES_ENDPOINT = `${SERVER_ROOT}/api/games/`;

type Game = {
  id: number;
  game_name: string;
  // keep the PK fields (they’re still sent, but we won’t display them)
  genre: number;
  platform: number;
  store: number;

  // NEW – readable names coming from the serializer
  genre_name: string;
  platform_name: string;
  store_name: string;

  // NEW – whitelist flag
  is_whitelisted: boolean;
};

/* -------------------------------------------------------------
   2️⃣  Props – we now receive the logged‑in user (null = anon)
   ------------------------------------------------------------- */
type Props = {
  /** null → not logged in, string → username */
  user: string | null;
};

export default function HomeScreen({ user }: Props) {
  const [games, setGames] = useState<Game[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  /* -------------------------------------------------------------
     3️⃣  Load games list – use the /api/games/ endpoint
     ------------------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(GAMES_ENDPOINT, {
          headers: { Accept: 'application/json' },
        });
        const data: Game[] = await r.json();
        setGames(data);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* -------------------------------------------------------------
     4️⃣  Client‑side filtering
     ------------------------------------------------------------- */
  const filtered = React.useMemo(() => {
    if (!games) return [];
    const term = search.trim().toLowerCase();
    if (!term) return games;
    return games.filter(g =>
      g.game_name.toLowerCase().includes(term),
    );
  }, [games, search]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  /* -------------------------------------------------------------
     5️⃣  Toggle whitelist – hit the root‑level view
     ------------------------------------------------------------- */
  const toggleWhitelist = async (gameId: number, currentValue: boolean) => {
    try {
      const resp = await fetch(
        `${SERVER_ROOT}/whitelist/${gameId}/`,
        {
          method: 'POST',
          credentials: 'include', // send session cookie
        },
      );

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      // Optimistically flip the flag locally
      setGames(prev =>
        prev?.map(g =>
          g.id === gameId ? { ...g, is_whitelisted: !currentValue } : g,
        ),
      );
    } catch (e) {
      console.warn('Whitelist toggle failed', e);
      Alert.alert('Error', 'Could not update whitelist.');
    }
  };

  return (
    <View style={styles.screen}>
      {/* SEARCH BAR */}
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeText}>Welcome to GameSite!</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search title…"
        placeholderTextColor="#6c757d"
        value={search}
        onChangeText={setSearch}
      />

      {/* HEADER ROW */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.titleCell, styles.headerText]}>
          Title
        </Text>
        <Text style={[styles.cell, styles.genreCell, styles.headerText]}>
          Genre
        </Text>
        <Text style={[styles.cell, styles.platformCell, styles.headerText]}>
          Platform
        </Text>
        <Text style={[styles.cell, styles.storeCell, styles.headerText]}>
          Store
        </Text>

        {/* ✅ Show whitelist column only when logged‑in */}
        {user && (
          <Text style={[styles.cell, styles.checkboxCell, styles.headerText]}>
            ✓
          </Text>
        )}
      </View>

      {/* DATA ROWS */}
      <FlatList
        data={filtered}
        keyExtractor={i => String(i.id)}
/* Inside the FlatList renderItem */
renderItem={({ item }) => (
  <View style={styles.row}>
    <Text style={[styles.cell, styles.titleCell]}>
      {item.game_name}
    </Text>

    {/* Use the name fields that come from the serializer */}
    <Text style={[styles.cell, styles.genreCell]}>
      {item.genre_name}
    </Text>
    <Text style={[styles.cell, styles.platformCell]}>
      {item.platform_name}
    </Text>
    <Text style={[styles.cell, styles.storeCell]}>
      {item.store_name}
    </Text>

    {/* Whitelist switch – only for logged‑in users */}
    {user && (
      <View style={styles.checkboxCell}>
        <Switch
          value={item.is_whitelisted}
          onValueChange={() =>
            toggleWhitelist(item.id, item.is_whitelisted)
          }
          thumbColor={item.is_whitelisted ? '#0066cc' : '#ccc'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      </View>
    )}
  </View>
)}
        ListEmptyComponent={
          <Text style={styles.empty}>No games found.</Text>
        }
      />
    </View>
  );
}

/* -------------------------------------------------------------
   STYLES (unchanged)
   ------------------------------------------------------------- */
const COLORS = {
  bg: '#f8f9fa',
  headerBg: '#e9ecef',
  text: '#212529',
  accent: '#0066cc',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  checkboxCell: {
    flex: 0.6,
    alignItems: 'center',
  },
  welcomeBox: {
    backgroundColor: '#fad900',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 12,
    alignSelf: 'stretch',
  },

  welcomeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  search: {
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ced4da',
    minHeight: 44,
    alignItems: 'center',
  },
  headerRow: {
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 2,
    borderBottomColor: '#adb5bd',
  },

  cell: { paddingHorizontal: 4, color: COLORS.text, fontSize: 14 },
  headerText: { fontWeight: '600' },
  titleCell: { flex: 2 },
  genreCell: { flex: 1 },
  platformCell: { flex: 1 },
  storeCell: { flex: 1 },

  empty: {
    marginTop: 20,
    textAlign: 'center',
    color: COLORS.text,
    fontStyle: 'italic',
  },
});