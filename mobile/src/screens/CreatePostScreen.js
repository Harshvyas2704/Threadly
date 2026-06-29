import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { Button, Input, Loading } from "../components/ui";
import { listCommunitiesApi } from "../api/communities.api";
import { createPostApi } from "../api/posts.api";
import { colors, radius, spacing } from "../theme";

export default function CreatePostScreen({ navigation }) {
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [communityId, setCommunityId] = useState(null);
  const [type, setType] = useState("text"); // "text" | "link"
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await listCommunitiesApi();
        setCommunities(data.communities);
      } catch {
        setCommunities([]);
      } finally {
        setLoadingCommunities(false);
      }
    })();
  }, []);

  const submit = async () => {
    setError(null);
    if (!communityId) return setError("Pick a community");
    if (!title.trim()) return setError("Title is required");
    if (type === "link" && !mediaUrl.trim())
      return setError("Link posts need a URL");

    setSubmitting(true);
    try {
      const payload = { communityId, title: title.trim(), type };
      if (type === "text") payload.body = body;
      if (type === "link") payload.mediaUrl = mediaUrl.trim();
      const data = await createPostApi(payload);
      // Reset and jump to the new post in the Home tab.
      setTitle("");
      setBody("");
      setMediaUrl("");
      navigation.navigate("Home", {
        screen: "PostDetail",
        params: { postId: data.post._id },
      });
    } catch (err) {
      setError(err.message || "Could not create post");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCommunities) return <Loading text="Loading communities…" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Community</Text>
      <View style={styles.chips}>
        {communities.map((c) => (
          <Pressable
            key={c._id}
            onPress={() => setCommunityId(c._id)}
            style={[styles.chip, communityId === c._id && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                communityId === c._id && styles.chipTextActive,
              ]}
            >
              r/{c.slug}
            </Text>
          </Pressable>
        ))}
        {communities.length === 0 ? (
          <Text style={styles.muted}>No communities yet.</Text>
        ) : null}
      </View>

      <Text style={styles.label}>Type</Text>
      <View style={styles.chips}>
        {["text", "link"].map((t) => (
          <Pressable
            key={t}
            onPress={() => setType(t)}
            style={[styles.chip, type === t && styles.chipActive]}
          >
            <Text style={[styles.chipText, type === t && styles.chipTextActive]}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      <Input
        label="Title"
        value={title}
        onChangeText={setTitle}
        placeholder="An interesting title"
      />
      {type === "text" ? (
        <Input
          label="Body (optional)"
          value={body}
          onChangeText={setBody}
          placeholder="Say something…"
          multiline
          style={styles.multiline}
        />
      ) : (
        <Input
          label="Link URL"
          value={mediaUrl}
          onChangeText={setMediaUrl}
          placeholder="https://…"
          autoCapitalize="none"
          keyboardType="url"
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Post" onPress={submit} loading={submitting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  label: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.lg },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: "600" },
  chipTextActive: { color: colors.white },
  multiline: { height: 100, textAlignVertical: "top" },
  error: { color: colors.danger, marginBottom: spacing.md },
  muted: { color: colors.textMuted },
});
