import { Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "../theme";

import HomeFeedScreen from "../screens/HomeFeedScreen";
import SearchScreen from "../screens/SearchScreen";
import CreatePostScreen from "../screens/CreatePostScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PostDetailScreen from "../screens/PostDetailScreen";
import CommunityScreen from "../screens/CommunityScreen";

const Tab = createBottomTabNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.card },
  headerTitleStyle: { color: colors.text },
  headerTintColor: colors.primary,
};

// Screens shared by several tabs (post detail, community page). Registered in
// each stack that can navigate to them so the tab bar stays visible.
const withSharedScreens = (Stack) => (
  <>
    <Stack.Screen
      name="PostDetail"
      component={PostDetailScreen}
      options={{ title: "Post" }}
    />
    <Stack.Screen
      name="Community"
      component={CommunityScreen}
      options={({ route }) => ({ title: `r/${route.params?.slug ?? ""}` })}
    />
  </>
);

const HomeStack = createNativeStackNavigator();
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={stackScreenOptions}>
    <HomeStack.Screen
      name="HomeFeed"
      component={HomeFeedScreen}
      options={{ title: "Threadly" }}
    />
    {withSharedScreens(HomeStack)}
  </HomeStack.Navigator>
);

const SearchStack = createNativeStackNavigator();
const SearchStackNavigator = () => (
  <SearchStack.Navigator screenOptions={stackScreenOptions}>
    <SearchStack.Screen
      name="SearchHome"
      component={SearchScreen}
      options={{ title: "Search" }}
    />
    {withSharedScreens(SearchStack)}
  </SearchStack.Navigator>
);

const ProfileStack = createNativeStackNavigator();
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={stackScreenOptions}>
    <ProfileStack.Screen
      name="ProfileHome"
      component={ProfileScreen}
      options={{ title: "Profile" }}
    />
    {withSharedScreens(ProfileStack)}
  </ProfileStack.Navigator>
);

const CreateStack = createNativeStackNavigator();
const CreateStackNavigator = () => (
  <CreateStack.Navigator screenOptions={stackScreenOptions}>
    <CreateStack.Screen
      name="CreatePost"
      component={CreatePostScreen}
      options={{ title: "Create Post" }}
    />
  </CreateStack.Navigator>
);

const tabIcon = (glyph) => ({ color }) => (
  <Text style={{ fontSize: 18, color }}>{glyph}</Text>
);

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{ tabBarIcon: tabIcon("🏠") }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{ tabBarIcon: tabIcon("🔍") }}
      />
      <Tab.Screen
        name="Create"
        component={CreateStackNavigator}
        options={{ tabBarIcon: tabIcon("➕") }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ tabBarIcon: tabIcon("👤") }}
      />
    </Tab.Navigator>
  );
}
