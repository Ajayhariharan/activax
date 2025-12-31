// components/Header.tsx
import { useRef, useEffect, useState } from "react";
import type { UserItem } from "../config";
import { Menu } from "primereact/menu";
import { useNavigate, useLocation } from "react-router-dom";

interface HeaderProps {
  currentUser?: UserItem | null;
  onLogout: () => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

export default function Header({
  currentUser,
  onLogout,
  theme,
  onThemeToggle,
}: HeaderProps) {
  const profileMenuRef = useRef<Menu | null>(null);
  const profileBtnRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(
    window.innerWidth < 768
  );

  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const showBackToLanding = !currentUser && isAuthPage;

  /* ============ WATCH WINDOW WIDTH (mobile vs desktop) ============ */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= CLOSE MENU ON ROUTE CHANGE ================= */
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  /* ================= OUTSIDE CLICK FOR PROFILE POPUP (desktop) ================= */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile) return; // only for desktop

      const target = event.target as Node;
      const profileOverlay = document.querySelector(
        ".p-menu.profile-menu"
      ) as HTMLElement | null;

      const clickedProfileOutside =
        profileOverlay &&
        !profileOverlay.contains(target) &&
        !profileBtnRef.current?.contains(target);

      if (clickedProfileOutside) profileMenuRef.current?.hide(event as any);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  /* ================= ROLE MENU ITEMS (for mobile drawer) ================= */
  const role = currentUser?.role;

  const baseMenu = currentUser
    ? [
        {
          label: "Dashboard",
          icon: "pi pi-chart-bar",
          command: () => {
            navigate("/dashboard");
            setIsMobileMenuOpen(false);
          },
        },
      ]
    : [];

  const adminMenu =
    role === "Admin"
      ? [
          {
            label: "Registered Users",
            icon: "pi pi-users",
            command: () => {
              navigate("/users");
              setIsMobileMenuOpen(false);
            },
          },
          {
            label: "User Activity",
            icon: "pi pi-history",
            command: () => {
              navigate("/user-activity");
              setIsMobileMenuOpen(false);
            },
          },
        ]
      : [];

  const managerMenu =
    role === "Manager"
      ? [
          {
            label: "Registered Users",
            icon: "pi pi-users",
            command: () => {
              navigate("/users");
              setIsMobileMenuOpen(false);
            },
          },
          {
            label: "User Activity",
            icon: "pi pi-history",
            command: () => {
              navigate("/user-activity");
              setIsMobileMenuOpen(false);
            },
          },
          {
            label: "User Permissions",
            icon: "pi pi-lock",
            command: () => {
              navigate("/user-permissions");
              setIsMobileMenuOpen(false);
            },
          },
        ]
      : [];

  const userMenu =
    role === "User"
      ? [
          {
            label: "User Details",
            icon: "pi pi-user",
            command: () => {
              navigate("/users");
              setIsMobileMenuOpen(false);
            },
          },
          {
            label: "My Activity",
            icon: "pi pi-list",
            command: () => {
              navigate("/my-activity");
              setIsMobileMenuOpen(false);
            },
          },
        ]
      : [];

const mobileMenuModel = [
  // put Profile first for logged‑in users
  ...(currentUser
    ? [
        {
          label: "My Profile",
          icon: "pi pi-user",
          command: () => {
            navigate("/profile");
            setIsMobileMenuOpen(false);
          },
        },
      ]
    : []),

  // then the rest of the pages
  ...baseMenu,
  ...adminMenu,
  ...managerMenu,
  ...userMenu,

  // auth items when not logged in
  ...(!currentUser
    ? [
        {
          label: "Login",
          icon: "pi pi-sign-in",
          command: () => {
            navigate("/login");
            setIsMobileMenuOpen(false);
          },
        },
        {
          label: "Register",
          icon: "pi pi-user-plus",
          command: () => {
            navigate("/register");
            setIsMobileMenuOpen(false);
          },
        },
      ]
    : []),
];


  return (
    <>
      <header className="header">
        <div className="header-left">
          <h1>xeus</h1>
        </div>

        <div className="header-center">
          {currentUser && (
            <div className="greeting">Hi, {currentUser.fullName}</div>
          )}
        </div>

        <div className="header-right">
          <div className="header-controls" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* 🌗 THEME TOGGLE */}
            <button
              className={`theme-toggle-pill ${theme}`}
              onClick={onThemeToggle}
              aria-label="Toggle theme"
            >
              <span className="icon sun">☀</span>
              <span className="icon moon">🌙</span>
              <span className="thumb" />
            </button>

            {/* ⬅ BACK TO LANDING */}
            {showBackToLanding && (
              <button
                className="back-to-landing-btn"
                onClick={() => navigate("/")}
              >
                <i className="pi pi-arrow-left" />
              </button>
            )}

            {/* 👤 PROFILE (desktop: popup menu, mobile: direct profile) */}
            {currentUser && (
              <>
                {!isMobile && (
                  <>
                    <Menu
                      ref={profileMenuRef}
                      popup
                      className="profile-menu"
                      model={[
                        {
                          label: "My Profile",
                          icon: "pi pi-user",
                          command: () => navigate("/profile"),
                        },
                        { separator: true },
                        {
                          label: "Logout",
                          icon: "pi pi-sign-out",
                          command: onLogout,
                        },
                      ]}
                    />
                    <button
                      ref={profileBtnRef}
                      className="profile-btn"
                      onClick={(e) => profileMenuRef.current?.toggle(e)}
                    >
                      {currentUser.profileImage ? (
                        <img
                          src={currentUser.profileImage}
                          alt="Profile"
                          className="header-avatar"
                        />
                      ) : (
                        <span>👤</span>
                      )}
                    </button>
                  </>
                )}

                {isMobile && (
                  <button
                    ref={profileBtnRef}
                    className="profile-btn"
                    onClick={() => navigate("/profile")}
                  >
                    {currentUser.profileImage ? (
                      <img
                        src={currentUser.profileImage}
                        alt="Profile"
                        className="header-avatar"
                      />
                    ) : (
                      <span>👤</span>
                    )}
                  </button>
                )}
              </>
            )}

            {/* 📱 MOBILE MENU BUTTON – only on mobile */}
            {isMobile && (
              <button
                ref={mobileMenuBtnRef}
                className="mobile-menu-btn large"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <i className="pi pi-bars" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 🥳 FULLSCREEN MOBILE MENU (mobile only) */}
      {isMobile && isMobileMenuOpen && (
        <>
          <div
            className="mobile-menu-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="mobile-menu-panel">
            <div className="mobile-menu-header">
              <h2>Menu</h2>
              <button
                className="menu-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="pi pi-times" />
              </button>
            </div>

            <div className="custom-mobile-menu">
              <div className="custom-menu-top">
                {mobileMenuModel
                  .filter((item) => item.label !== "Logout")
                  .map((item) => (
                    <button
                      key={item.label}
                      className="custom-menu-item"
                      onClick={item.command}
                    >
                      <i className={item.icon || "pi pi-circle-fill"} />
                      <span>{item.label}</span>
                    </button>
                  ))}
              </div>



              {/* logout fixed at bottom */}
              {currentUser && (
                <button
                  className="custom-menu-item logout-item"
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <i className="pi pi-sign-out" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
