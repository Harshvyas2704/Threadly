import * as SecureStore from "expo-secure-store";

// Refresh and access tokens live in the device secure store (Keychain /
// Keystore), never in plain AsyncStorage.
const ACCESS_KEY = "threadly.accessToken";
const REFRESH_KEY = "threadly.refreshToken";

export const saveTokens = async (accessToken, refreshToken) => {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken ?? "");
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken ?? "");
};

export const loadTokens = async () => ({
  accessToken: (await SecureStore.getItemAsync(ACCESS_KEY)) || null,
  refreshToken: (await SecureStore.getItemAsync(REFRESH_KEY)) || null,
});

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
};
