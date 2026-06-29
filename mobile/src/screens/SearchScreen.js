import { useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";
import PostCard from "../components/PostCard";
import { EmptyState } from "../components/ui";
import { searchApi } from "../api/search.api";
import { colors, radius, spacing } from "../theme";

export default function SearchScreen({ navigation }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("posts"); // "posts" | "communities"
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const run = async (nextType = type) => {
    if (!q.trim()) return;
    try {
      const data = await searchApi(q.trim(), nextType);
      setResults(data.results);
    } catch {
      setResults([]);
    } finally {
      setSearched(true);
    }
  };

  const switchType = (t) => {
    setType(t);
    if (searched) run(t);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search Threadly"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => run()}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.tabs}>
        {["posts", "communities"].map((t) => (
          <Pressable key={t} onPress={() => switchType(t)} style={styles.tab}>
            <Text style={[styles.tabText, type === t && styles.tabActive]}>
              {t === "posts" ? "Posts" : "Communities"}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) =>
          type === "posts" ? (
            <PostCard
              post={item}
              onPress={() =>
                navigation.navigate("PostDetail", { postId: item._id })
              }
            />
          ) : (
            <Pressable
              style={styles.communityRow}
              onPress={() =>
                navigation.navigate("Community", { slug: item.slug })
              }
            >
              <Text style={styles.communityName}>r/{item.slug}</Text>
              <Text style={styles.communityDesc} numberOfLines={1}>
                {item.description}
              </Text>
              <Text style={styles.communityMeta}>
                {item.memberCount} members
              </Text>
            </Pressable>
          )
        }
        contentContainerStyle={results.length === 0 && styles.emptyWrap}
        ListEmptyComponent={
          <EmptyState
            text={searched ? "No results found." : "Search posts and communities."}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchBar: { padding: spacing.md, backgroundColor: colors.card },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  tabText: { color: colors.textMuted, fontWeight: "600" },
  tabActive: { color: colors.primary },
  emptyWrap: { flex: 1 },
  communityRow: {
    backgroundColor: colors.card,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  communityName: { fontWeight: "700", color: colors.text, fontSize: 15 },
  communityDesc: { color: colors.text, marginTop: 2 },
  communityMeta: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
});
