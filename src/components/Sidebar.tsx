// components/Sidebar.tsx
import { NavLink } from "react-router-dom";
import type { UserItem } from "../config";

interface SidebarProps {
  currentUser?: UserItem | null;
}

export default function Sidebar({ currentUser }: SidebarProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    ["sidebar-link", isActive ? "active" : ""].filter(Boolean).join(" ");

  const role = currentUser?.role;

  return (
    <aside className="sidebar"  >
      <ul className="sidebar-list">
        {/* Dashboard for everyone who is logged in */}
        {currentUser && (
          <li>
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          </li>
        )}

        {/* Admin: Dashboard, Registered Users, User Activity */}
        {role === "Admin" && (
          <>
            <li>
              <NavLink to="/users" className={linkClass}>
                Registered Users
              </NavLink>
            </li>
            <li>
              <NavLink to="/user-activity" className={linkClass}>
                User Activity
              </NavLink>
            </li>
          </>
        )}

        {/* Manager: Dashboard, Registered Users, User Activity, User Permissions */}
        {role === "Manager" && (
          <>
            <li>
              <NavLink to="/users" className={linkClass}>
                Registered Users
              </NavLink>
            </li>
            <li>
              <NavLink to="/user-activity" className={linkClass}>
                User Activity
              </NavLink>
            </li>
            <li>
              <NavLink to="/user-permissions" className={linkClass}>
                User Permissions
              </NavLink>
            </li>
          </>
        )}

        {/* User: Dashboard, User Details, My Activity */}
        {role === "User" && (
          <>
            <li>
              <NavLink to="/users" className={linkClass}>
                User Details
              </NavLink>
            </li>
            <li>
              <NavLink to="/my-activity" className={linkClass}>
                My Activity
              </NavLink>
            </li>
          </>
        )}

        {/* When not logged in, show auth links */}
        {!currentUser && (
          <>
            <li>
              <NavLink to="/register" className={linkClass}>
                Register
              </NavLink>
            </li>
            <li>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
}
