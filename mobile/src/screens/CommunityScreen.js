import { useCallback, useState } from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import PostCard from "../components/PostCard";
import { Button, Loading, EmptyState } from "../components/ui";
import {
  getCommunityApi,
  getCommunityPostsApi,
  joinCommunityApi,
  leaveCommunityApi,
} from "../api/communities.api";
import { colors, radius, spacing } from "../theme";

export default function CommunityScreen({ route, navigation }) {
  const { slug } = route.params;
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([
        getCommunityApi(slug),
        getCommunityPostsApi(slug),
      ]);
      setCommunity(c.community);
      setPosts(p.posts);
    } catch {
      setCommunity(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const toggleMembership = async () => {
    setWorking(true);
    setError(null);
    try {
      if (joined) {
        await leaveCommunityApi(slug);
        setJoined(false);
        setCommunity((c) => ({ ...c, memberCount: c.memberCount - 1 }));
      } else {
        await joinCommunityApi(slug);
        setJoined(true);
        setCommunity((c) => ({ ...c, memberCount: c.memberCount + 1 }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  };

  if (loading) return <Loading />;
  if (!community) return <EmptyState text="Community not found." />;

  const Header = (
    <View style={styles.header}>
      <Text style={styles.name}>{community.name}</Text>
      <Text style={styles.slug}>r/{community.slug}</Text>
      <Text style={styles.desc}>{community.description}</Text>
      <Text style={styles.members}>{community.memberCount} members</Text>
      <Button
        title={joined ? "Leave" : "Join"}
        variant={joined ? "outline" : "primary"}
        onPress={toggleMembership}
        loading={working}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.postsHeading}>Posts</Text>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={posts}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={Header}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onPress={() =>
            navigation.navigate("PostDetail", { postId: item._id })
          }
        />
      )}
      ListEmptyComponent={<EmptyState text="No posts in this community yet." />}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: { fontSize: 22, fontWeight: "800", color: colors.text },
  slug: { color: colors.textMuted, marginTop: 2 },
  desc: { color: colors.text, marginTop: spacing.sm, lineHeight: 20 },
  members: { color: colors.textMuted, marginVertical: spacing.md },
  error: { color: colors.danger, marginTop: spacing.sm },
  postsHeading: {
    marginTop: spacing.lg,
    fontWeight: "700",
    color: colors.text,
    fontSize: 16,
  },
});
