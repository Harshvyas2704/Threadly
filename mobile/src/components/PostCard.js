import { useState } from "react";
import { Pressable, Text, View, StyleSheet, Image } from "react-native";
import { colors, radius, spacing } from "../theme";
import { votePostApi } from "../api/posts.api";

// Up/down voter shared by post cards and the detail header.
export const VoteControl = ({ score, onVote, vertical = true }) => (
  <View style={[styles.voteBox, vertical ? styles.voteCol : styles.voteRow]}>
    <Pressable onPress={() => onVote(1)} hitSlop={8}>
      <Text style={styles.voteArrow}>▲</Text>
    </Pressable>
    <Text style={styles.voteScore}>{score}</Text>
    <Pressable onPress={() => onVote(-1)} hitSlop={8}>
      <Text style={[styles.voteArrow, styles.voteDown]}>▼</Text>
    </Pressable>
  </View>
);

export default function PostCard({ post, onPress, onAuthError }) {
  const [score, setScore] = useState(post.voteScore);

  const vote = async (value) => {
    const prev = score;
    setScore((s) => s + value); // optimistic
    try {
      const data = await votePostApi(post._id, value);
      setScore(data.voteScore); // reconcile with server (handles toggle/flip)
    } catch (err) {
      setScore(prev);
      onAuthError?.(err);
    }
  };

  const community = post.community || {};
  const author = post.author || {};

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <VoteControl score={score} onVote={vote} />
        <View style={styles.body}>
          <Text style={styles.meta}>
            r/{community.slug || community.name || "?"} ·{" "}
            <Text style={styles.metaAuthor}>u/{author.userName || "unknown"}</Text>
          </Text>
          <Text style={styles.title}>{post.title}</Text>
          {post.type === "image" && post.mediaUrl ? (
            <Image source={{ uri: post.mediaUrl }} style={styles.image} />
          ) : post.body ? (
            <Text style={styles.snippet} numberOfLines={3}>
              {post.body}
            </Text>
          ) : null}
          <Text style={styles.footer}>💬 {post.commentCount} comments</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  row: { flexDirection: "row" },
  voteBox: { alignItems: "center" },
  voteCol: { marginRight: spacing.md, paddingTop: spacing.xs },
  voteRow: { flexDirection: "row" },
  voteArrow: { color: colors.upvote, fontSize: 16, fontWeight: "700" },
  voteDown: { color: colors.downvote },
  voteScore: { fontWeight: "700", color: colors.text, marginVertical: 2 },
  body: { flex: 1 },
  meta: { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
  metaAuthor: { color: colors.textMuted },
  title: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: spacing.xs },
  snippet: { color: colors.text, fontSize: 14, lineHeight: 19 },
  image: { width: "100%", height: 180, borderRadius: radius.sm, marginVertical: spacing.xs },
  footer: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm },
});
