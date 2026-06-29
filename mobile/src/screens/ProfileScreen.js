import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui";
import { colors, radius, spacing } from "../theme";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const initial = (user.userName || "?")[0].toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.userName}>u/{user.userName}</Text>
        {user.email ? <Text style={styles.email}>{user.email}</Text> : null}
        {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.karma ?? 0}</Text>
            <Text style={styles.statLabel}>Karma</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {user.createdAt ? new Date(user.createdAt).getFullYear() : "—"}
            </Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button title="Log Out" variant="outline" onPress={signOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: { color: colors.white, fontSize: 30, fontWeight: "800" },
  userName: { fontSize: 20, fontWeight: "800", color: colors.text },
  email: { color: colors.textMuted, marginTop: 2 },
  bio: { color: colors.text, marginTop: spacing.sm, textAlign: "center" },
  statsRow: { flexDirection: "row", marginTop: spacing.lg },
  stat: { alignItems: "center", marginHorizontal: spacing.xl },
  statValue: { fontSize: 18, fontWeight: "800", color: colors.text },
  statLabel: { color: colors.textMuted, fontSize: 12 },
  actions: { marginTop: spacing.xl },
});
