import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";
import { colors, radius, spacing } from "../theme";

export const Button = ({ title, onPress, loading, disabled, variant = "primary" }) => {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variant === "outline" && styles.buttonOutline,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? colors.primary : colors.white} />
      ) : (
        <Text
          style={[styles.buttonText, variant === "outline" && styles.buttonTextOutline]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

export const Input = ({ label, error, style, ...props }) => (
  <View style={styles.inputWrap}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={[styles.input, error && styles.inputError, style]}
      {...props}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

export const Loading = ({ text }) => (
  <View style={styles.center}>
    <ActivityIndicator size="large" color={colors.primary} />
    {text ? <Text style={styles.muted}>{text}</Text> : null}
  </View>
);

export const EmptyState = ({ text }) => (
  <View style={styles.center}>
    <Text style={styles.muted}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonPressed: { backgroundColor: colors.primaryDark },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.white, fontWeight: "700", fontSize: 15 },
  buttonTextOutline: { color: colors.primary },
  inputWrap: { marginBottom: spacing.md },
  label: { color: colors.textMuted, marginBottom: spacing.xs, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: 15,
  },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 12, marginTop: spacing.xs },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  muted: { color: colors.textMuted, marginTop: spacing.sm, textAlign: "center" },
});
