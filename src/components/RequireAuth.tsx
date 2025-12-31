// components/RequireAuth.tsx
import { Navigate, useLocation } from "react-router-dom";
import type { UserItem } from "../config";
import type { ReactElement } from "react";

export default function RequireAuth({
  currentUser,
  children,
}: {
  currentUser: UserItem | null | undefined;
  children: ReactElement;
}) {
  const location = useLocation();

  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}
