import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import RequireAuth from "./components/RequireAuth";

import type { UserItem } from "./config";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setInitialUsers, logout, updateUser } from "./store/usersSlice";
import { setInitialActivities } from "./store/activitiesSlice";
import { loadUsers, loadActivities } from "./config";
import "./index.css";

import { DEFAULT_ADMINS } from "./constants/defaultAdmins";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ControlsBar from "./components/ControlsBar";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RegisteredUsersPage from "./pages/RegisteredUsersPage";
import DashboardPage from "./pages/DashboardPage";
import MyActivityPage from "./pages/MyActivityPage";
import UserActivityPage from "./pages/UserActivityPage";
import UserPermissionsPage from "./pages/UserPermissionsPage";
import ProfilePage from "./pages/ProfilePage";

function AppContent() {
  const dispatch = useAppDispatch();
  const users = useAppSelector((s) => s.users.users);
  const currentUser = useAppSelector((s) => s.users.currentUser);

  const managers = users.filter((u) => u.role === "Manager");
  const pageRef = useRef<any>(null);

  const [activeTab, setActiveTab] = useState("admins");
  const [managerFilter, setManagerFilter] =
    useState<number | "all" | "unassigned">("all");

  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const location = useLocation();

  // ✅ ONLY SPECIAL PAGE
  const isLanding = location.pathname === "/";
  const showControls = location.pathname === "/users";

  // ================= THEME INIT =================
  useEffect(() => {
    const saved = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | null;

    if (saved) {
      setTheme(saved);
      return;
    }

    const mq =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)");
    const prefersLight = mq ? mq.matches : false;
    setTheme(prefersLight ? "light" : "dark");

    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("theme");
      if (!stored) {
        setTheme(e.matches ? "light" : "dark");
      }
    };

    if (mq && mq.addEventListener) {
      mq.addEventListener("change", handleChange);
      return () => mq.removeEventListener("change", handleChange);
    }

    if (mq && mq.addListener) {
      mq.addListener(handleChange as any);
      return () => mq.removeListener(handleChange as any);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("light", theme === "light");
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ================= LOAD DATA =================
  useEffect(() => {
    const loadedUsers = loadUsers();
    const merged = [...loadedUsers];

    DEFAULT_ADMINS.forEach((admin) => {
      if (!merged.some((u) => u.id === admin.id)) {
        merged.push(admin);
      }
    });

    dispatch(setInitialUsers(merged));
    dispatch(setInitialActivities(loadActivities()));
  }, [dispatch]);

  // ================= ACTIONS =================
  const handleLogout = () => {
    dispatch(logout());
    sessionStorage.removeItem("currentUser");
    window.location.href = "/login";
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleChangePassword = (updatedUser: UserItem) => {
    dispatch(updateUser(updatedUser));
  };

  return (
    <div className="app-container">

      {!isLanding && (
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          theme={theme}
          onThemeToggle={handleThemeToggle}
        />
      )}

      <div className="main-layout">

        {!isLanding && <Sidebar currentUser={currentUser} />}

        <main className="main-content">
          {!isLanding && showControls && (
            <ControlsBar
              currentUser={currentUser}
              managers={managers}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              managerFilter={managerFilter}
              setManagerFilter={setManagerFilter}
              pageRef={pageRef}
            />
          )}

          <Routes>
            {/* 🌟 LANDING PAGE */}
            <Route path="/" element={<LandingPage />} />

            {/* 🔐 AUTH (SAME AS OLD BEHAVIOR) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 📦 MAIN APP */}
            <Route
              path="/users"
              element={
                <RegisteredUsersPage
                  ref={pageRef}
                  activeTab={activeTab}
                  managerFilter={managerFilter}
                  setManagerFilter={setManagerFilter}
                  setActiveTab={setActiveTab}
                />
              }
            />
            
  <Route
    path="/profile"
    element={
      <RequireAuth currentUser={currentUser}>
        <ProfilePage
          currentUser={currentUser!}
          onChangePassword={handleChangePassword}
        />
      </RequireAuth>
    }
  />
            <Route
              path="/dashboard"
              element={<DashboardPage currentUser={currentUser} />}
            />
            <Route
              path="/my-activity"
              element={<MyActivityPage currentUser={currentUser} />}
            />
            <Route
              path="/user-activity"
              element={<UserActivityPage currentUser={currentUser} />}
            />
            <Route
              path="/user-permissions"
              element={<UserPermissionsPage currentUser={currentUser} />}
            />

            {currentUser && (
              <Route
                path="/profile"
                element={
                  <ProfilePage
                    currentUser={currentUser}
                    onChangePassword={handleChangePassword}
                  />
                }
              />
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
