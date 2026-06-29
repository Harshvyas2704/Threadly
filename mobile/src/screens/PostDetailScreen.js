import { useCallback, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { VoteControl } from "../components/PostCard";
import CommentItem from "../components/CommentItem";
import { Loading } from "../components/ui";
import { getPostApi, votePostApi } from "../api/posts.api";
import { listCommentsApi, createCommentApi } from "../api/comments.api";
import { colors, spacing } from "../theme";

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [sending, setSending] = useState(false);
  const [commentError, setCommentError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        getPostApi(postId),
        listCommentsApi(postId),
      ]);
      setPost(p.post);
      setComments(c.comments);
    } catch {
      // leave as-is
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const votePost = async (value) => {
    const prev = post.voteScore;
    setPost((p) => ({ ...p, voteScore: p.voteScore + value }));
    try {
      const data = await votePostApi(postId, value);
      setPost((p) => ({ ...p, voteScore: data.voteScore }));
    } catch {
      setPost((p) => ({ ...p, voteScore: prev }));
    }
  };

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    setCommentError(null);
    try {
      await createCommentApi(postId, text.trim(), replyTo?._id ?? null);
      setText("");
      setReplyTo(null);
      await load();
    } catch (err) {
      // Surface depth/permission/membership errors inline.
      setCommentError(err.message || "Could not post comment");
    } finally {
      setSending(false);
    }
  };

  if (loading || !post) return <Loading />;

  const PostHeader = (
    <View style={styles.header}>
      <Text style={styles.community}>
        r/{post.community?.slug} · u/{post.author?.userName}
      </Text>
      <View style={styles.headerRow}>
        <VoteControl score={post.voteScore} onVote={votePost} />
        <View style={styles.headerBody}>
          <Text style={styles.title}>{post.title}</Text>
          {post.body ? <Text style={styles.body}>{post.body}</Text> : null}
          {post.type === "link" && post.mediaUrl ? (
            <Text style={styles.link}>{post.mediaUrl}</Text>
          ) : null}
        </View>
      </View>
      <Text style={styles.commentsHeading}>
        {post.commentCount} Comments
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={PostHeader}
        renderItem={({ item }) => (
          <CommentItem comment={item} onReply={setReplyTo} />
        )}
        ListEmptyComponent={
          <Text style={styles.noComments}>
            No comments yet. Be the first!
          </Text>
        }
        contentContainerStyle={{ paddingBottom: spacing.lg }}
      />

      <View style={styles.composer}>
        {commentError ? (
          <Text style={styles.composerError}>{commentError}</Text>
        ) : null}
        {replyTo ? (
          <View style={styles.replyBanner}>
            <Text style={styles.replyText} numberOfLines={1}>
              Replying to u/{replyTo.author?.userName}
            </Text>
            <Pressable onPress={() => setReplyTo(null)} hitSlop={8}>
              <Text style={styles.replyCancel}>✕</Text>
            </Pressable>
          </View>
        ) : null}
        <View style={styles.composerRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Add a comment…"
            placeholderTextColor={colors.textMuted}
            style={styles.composerInput}
            multiline
          />
          <Pressable
            onPress={send}
            disabled={sending || !text.trim()}
            style={styles.sendBtn}
          >
            <Text style={styles.sendText}>{sending ? "…" : "Send"}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  community: { color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm },
  headerRow: { flexDirection: "row" },
  headerBody: { flex: 1, marginLeft: spacing.md },
  title: { fontSize: 18, fontWeight: "800", color: colors.text },
  body: { color: colors.text, fontSize: 15, marginTop: spacing.sm, lineHeight: 20 },
  link: { color: colors.downvote, marginTop: spacing.sm },
  commentsHeading: {
    marginTop: spacing.md,
    fontWeight: "700",
    color: colors.text,
  },
  noComments: { color: colors.textMuted, textAlign: "center", padding: spacing.xl },
  composer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  replyBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  composerError: {
    color: colors.danger,
    fontSize: 13,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  replyText: { color: colors.textMuted, flex: 1 },
  replyCancel: { color: colors.danger, fontWeight: "700", paddingHorizontal: spacing.sm },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.sm,
  },
  composerInput: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  sendBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginLeft: spacing.sm,
  },
  sendText: { color: colors.primary, fontWeight: "800" },
});
