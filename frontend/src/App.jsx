import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeFeed from "./pages/HomeFeed";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Community from "./pages/Community";
import PostDetail from "./pages/PostDetail";
import UserProfile from "./pages/UserProfile";
import CreatePost from "./pages/CreatePost";
import CreateCommunity from "./pages/CreateCommunity";
import Search from "./pages/Search";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Main app pages share the 3-column shell */}
        <Route element={<AppShell />}>
          <Route path="/" element={<HomeFeed />} />
          <Route path="/search" element={<Search />} />
          <Route path="/r/:slug" element={<Community />} />
          <Route path="/r/:slug/post/:id" element={<PostDetail />} />
          <Route path="/u/:userName" element={<UserProfile />} />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-community"
            element={
              <ProtectedRoute>
                <CreateCommunity />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Auth pages render full-width without sidebars */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="*"
          element={<div className="center">Page not found.</div>}
        />
      </Routes>
    </>
  );
}
