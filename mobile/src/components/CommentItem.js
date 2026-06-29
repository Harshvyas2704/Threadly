import { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";
import { voteCommentApi } from "../api/comments.api";

// Indent nested replies by depth (capped on the backend at 3).
export default function CommentItem({ comment, onReply, onAuthError }) {
  const [score, setScore] = useState(comment.voteScore);

  const vote = async (value) => {
    const prev = score;
    setScore((s) => s + value);
    try {
      const data = await voteCommentApi(comment._id, value);
      setScore(data.voteScore);
    } catch (err) {
      setScore(prev);
      onAuthError?.(err);
    }
  };

  return (
    <View style={[styles.wrap, { marginLeft: comment.depth * spacing.lg }]}>
      <Text style={styles.author}>
        u/{comment.author?.userName || (comment.isDeleted ? "—" : "unknown")}
      </Text>
      <Text style={[styles.body, comment.isDeleted && styles.deleted]}>
        {comment.body}
      </Text>
      <View style={styles.actions}>
        <Pressable onPress={() => vote(1)} hitSlop={6}>
          <Text style={styles.arrow}>▲</Text>
        </Pressable>
        <Text style={styles.score}>{score}</Text>
        <Pressable onPress={() => vote(-1)} hitSlop={6}>
          <Text style={[styles.arrow, styles.down]}>▼</Text>
        </Pressable>
        {!comment.isDeleted && comment.depth < 3 ? (
          <Pressable onPress={() => onReply(comment)} hitSlop={6}>
            <Text style={styles.reply}>Reply</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  author: { color: colors.textMuted, fontSize: 12, marginBottom: 2 },
  body: { color: colors.text, fontSize: 14, lineHeight: 19 },
  deleted: { fontStyle: "italic", color: colors.textMuted },
  actions: { flexDirection: "row", alignItems: "center", marginTop: spacing.xs },
  arrow: { color: colors.upvote, fontSize: 14, fontWeight: "700" },
  down: { color: colors.downvote },
  score: { marginHorizontal: spacing.sm, color: colors.text, fontWeight: "600" },
  reply: { marginLeft: spacing.lg, color: colors.textMuted, fontWeight: "600", fontSize: 13 },
});
