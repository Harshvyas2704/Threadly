import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/ui";
import { colors, spacing } from "../theme";

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!userName || !email || !password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      await signUp(userName.trim(), email.trim(), password);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <Text style={styles.logo}>Create account</Text>
        <Text style={styles.subtitle}>Join the Threadly community</Text>

        <Input
          label="Username"
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="none"
          placeholder="3–30 letters/numbers"
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="at least 8 characters"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title="Sign Up" onPress={submit} loading={loading} />

        <Pressable
          style={styles.linkRow}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.muted}>Already have an account? </Text>
          <Text style={styles.link}>Sign in</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, justifyContent: "center", padding: spacing.xl },
  logo: { fontSize: 28, fontWeight: "800", color: colors.text, textAlign: "center" },
  subtitle: {
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },
  error: { color: colors.danger, marginBottom: spacing.md },
  linkRow: { flexDirection: "row", justifyContent: "center", marginTop: spacing.lg },
  muted: { color: colors.textMuted },
  link: { color: colors.primary, fontWeight: "700" },
});
