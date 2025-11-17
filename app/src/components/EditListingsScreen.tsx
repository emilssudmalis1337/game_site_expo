// app/src/components/EditListingsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
 Button,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const SERVER_ROOT = "http://192.168.42.41:8000";
const GAMES_ENDPOINT = `${SERVER_ROOT}/api/games/`;

type Game = {
  id: number;
  game_name: string;
  genre: string;
  platform: string;
  store: string;
};

export default function EditListingsScreen() {
  // -----------------------------------------------------------------
  // State for the list of games
  // -----------------------------------------------------------------
  const [games, setGames] = useState<Game[] | null>(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------------
  // Form state (mirrors the Django add‑game form)
  // ---------------------------------------------------------------
  const [title, setTitle] = useState("");
  const [genreId, setGenreId] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [storeId, setStoreId] = useState("");

  // -------------------------------------------------------------
  // Lookup tables for the dropdowns
  // -----------------------------------------------------------------
  const [genres, setGenres] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [platforms, setPlatforms] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [stores, setStores] = useState<Array<{ id: number; name: string }>>(
    []
  );

  // -----------------------------------------------------------------
  // Optional foreign‑key fields (keep them if you need them later)
  // --------------------------------------------------------
  const [sizeId, setSizeId] = useState("");
  const [developerId, setDeveloperId] = useState("");
  const [publisherId, setPublisherId] = useState("");

  // -----------------------------------------------------------------
  // Load the games list (GET)
  // -----------------------------------------------------------------
  const loadGames = async () => {
    try {
    const r = await fetch(GAMES_ENDPOINT, {
        headers: { Accept: "application/json" },
        credentials: "include", // send session cookie
      });
      const data: Game[] = await r.json();
      setGames(data);
    } catch (e) {
      console.warn(e);
      Alert.alert("Error", "Could not load games.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // Load lookup tables (genres, platforms, stores)
  // -----------------------------------------------------------------
const fetchLookup = async (
  url: string,
  primaryKey: string,
  setter: (v: Array<{ id: number; name: string }>) => void
) => {
  try {
    const r = await fetch(url, {
      headers: { Accept: "application/json" },
      credentials: "include",
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);

    const data = await r.json(); // array of objects
    const mapped = data.map((obj: any) => ({
      id: obj.id,
      // Try the primary key first (e.g. "genre"); if undefined, fall back to `name`
      name: obj[primaryKey] ?? obj.name ?? "",
    }));
    setter(mapped);
  } catch (e) {
    console.warn(`lookup ${url}`, e);
  }
};

  // -----------------------------------------------------------------
  // Initial data loading
  // -----------------------------------------------------------------
  useEffect(() => {
    loadGames();
    fetchLookup(`${SERVER_ROOT}/api/genres/`, "genre", setGenres);
    fetchLookup(`${SERVER_ROOT}/api/platforms/`, "platform", setPlatforms);
    fetchLookup(`${SERVER_ROOT}/api/stores/`, "store", setStores);
  }, []);

  // -----------------------------------------------------------------
  // Create a new game (POST)
  // -----------------------------------------------------------------
  const handleCreate = async () => {
    if (!title || !genreId || !platformId || !storeId) {
      Alert.alert(
        "Missing fields",
        "Please fill in Title, Genre, Platform and Store."
      );
      return;
    }

    const body = new URLSearchParams();
    body.append("game_name", title);
    body.append("genre", genreId);
    body.append("platform", platformId);
    body.append("store", storeId);

    try {
      const r = await fetch(GAMES_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
        credentials: "include",
      });

      if (!r.ok) throw new Error(`HTTP ${r.status}`);

      await loadGames(); // refresh list
      clearForm();
      Alert.alert("Success", "Game created.");
    } catch (e: any) {
      console.warn(e);
      Alert.alert("Error", e.message ?? "Could not create game.");
    }
  };

  const clearForm = () => {
    setTitle("");
    setGenreId("");
    setPlatformId("");
    setStoreId("");
    setSizeId("");
    setDeveloperId("");
    setPublisherId("");
  };

  // -----------------------------------------------------------------
  // Delete a game (DELETE)
  // -----------------------------------------------------------------
  const handleDelete = async (gameId: number) => {
    Alert.alert("Confirm", "Delete this game?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const r = await fetch(`${GAMES_ENDPOINT}${gameId}/`, {
              method: "DELETE",
              credentials: "include",
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);

            // Optimistically remove from local state
            setGames((prev) =>
              prev?.filter((g) => g.id !== gameId) ?? null
            );
            Alert.alert("Deleted", "Game removed.");
          } catch (e: any) {
            console.warn(e);
            Alert.alert("Error", e.message ?? "Could not delete game.");
          }
        },
      },
    ]);
  };

  // -----------------------------------------------------------------
  // UI rendering
  // -----------------------------------------------------------------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ---------- Header with Add‑Game form ---------- */}
      <FlatList
        data={games}
        keyExtractor={(g) => String(g.id)}
        ListEmptyComponent={<Text>No games found.</Text>}
        ListHeaderComponent={
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add New Game</Text>

            {/* Title */}
            <TextInput
              style={styles.input}
              placeholder="Title *"
              value={title}
              onChangeText={setTitle}
            />

            {/* Genre dropdown */}
            <Picker
              selectedValue={genreId}
              onValueChange={(value) => setGenreId(String(value))}
              style={styles.picker}
            >
              <Picker.Item label="-- Choose Genre --" value="" />
              {genres.map((g) => (
                <Picker.Item
                  key={g.id}
                  label={g.name}
                  value={String(g.id)}
                />
              ))}
            </Picker>

            {/* Platform dropdown */}
            <Picker
              selectedValue={platformId}
              onValueChange={(value) => setPlatformId(String(value))}
              style={styles.picker}
            >
              <Picker.Item label="-- Choose Platform --" value="" />
              {platforms.map((p) => (
                <Picker.Item
                  key={p.id}
                  label={p.name}
                  value={String(p.id)}
                />
              ))}
            </Picker>

            {/* Store dropdown */}
            <Picker
              selectedValue={storeId}
              onValueChange={(value) => setStoreId(String(value))}
              style={styles.picker}
            >
              <Picker.Item label="-- Choose Store --" value="" />
              {stores.map((s) => (
                <Picker.Item
                  key={s.id}
                  label={s.name}
                  value={String(s.id)}
                />
              ))}
            </Picker>

            {/* Submit button */}
            <Button
              title="Create Game"
              onPress={handleCreate}
              color="#0066cc"
            />
          </View>
        }
        // -----------------------------------------------------------------
        // Row renderer – each game + Delete button
        // -----------------------------------------------------------------
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>{item.game_name}</Text>
              <Text style={styles.rowMeta}>
  {item.genre_name} • {item.platform_name} • {item.store_name}
</Text>
            </View>

            <Button
              title="Delete"
              color="#d9534f"
              onPress={() => handleDelete(item.id)}
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

/* -------------------------------------------------------------
   Styles (unchanged – keep exactly as you had them)
   ------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "#212529",
  },

  input: {
    height: 44,
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    color: "#212529",
  },

  picker: {
    height: 44,
    marginBottom: 10,
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomColor: "#e9ecef",
    borderBottomWidth: 1,
  },

  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: "500", color: "#212529" },
  rowMeta: { fontSize: 13, color: "#6c757d" },
});