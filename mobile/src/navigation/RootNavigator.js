import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { Loading } from "../components/ui";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";

// Navigation-flow auth gating: which navigator mounts depends purely on auth
// state, so there are no protected "routes" — signing in/out swaps the tree.
export default function RootNavigator() {
  const { user, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <Loading text="Loading Threadly…" />;
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
