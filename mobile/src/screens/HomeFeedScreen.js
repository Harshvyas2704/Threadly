import { useCallback, useState } from "react";
import { FlatList, RefreshControl, View, Text, Pressable, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import PostCard from "../components/PostCard";
import { Loading, EmptyState } from "../components/ui";
import { getHomeFeedApi, getTrendingApi } from "../api/feed.api";
import { colors, spacing } from "../theme";

export default function HomeFeedScreen({ navigation }) {
  const [tab, setTab] = useState("home"); // "home" | "trending"
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (which) => {
      try {
        const data =
          which === "trending"
            ? await getTrendingApi()
            : await getHomeFeedApi();
        setPosts(data.posts);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  // Reload whenever the screen regains focus (e.g. after creating a post).
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load(tab);
    }, [tab, load]),
  );

  const switchTab = (next) => {
    setTab(next);
    setLoading(true);
    load(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {["home", "trending"].map((t) => (
          <Pressable key={t} onPress={() => switchTab(t)} style={styles.tab}>
            <Text style={[styles.tabText, tab === t && styles.tabActive]}>
              {t === "home" ? "Home" : "Trending"}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() =>
                navigation.navigate("PostDetail", { postId: item._id })
              }
            />
          )}
          contentContainerStyle={posts.length === 0 && styles.emptyWrap}
          ListEmptyComponent={
            <EmptyState
              text={
                tab === "home"
                  ? "Your home feed is empty. Join communities to see posts."
                  : "No trending posts in the last 24 hours."
              }
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load(tab);
              }}
              tintColor={colors.primary}
            />
          }
          ListFooterComponent={<View style={{ height: spacing.xl }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
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
});
