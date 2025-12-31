// pages/RegisterPage.tsx
import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import UserForm from "../components/UserForm";
import type { UserItem, RegisterFormValues } from "../config";
import { emptyValues } from "../config";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addUser } from "../store/usersSlice";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [successVisible, setSuccessVisible] = useState(false);
  const [createdName, setCreatedName] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.users.users);
  const managers = users.filter((u) => u.role === "Manager");
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = (values: RegisterFormValues) => {
    const userValues = {
      ...values,
      managerId: values.managerId === "" ? undefined : Number(values.managerId),
    };
    const user: UserItem = { id: Date.now(), ...userValues };

    const isDuplicate = users.some(
      (u) =>
        u.fullName.toLowerCase().trim() ===
          user.fullName.toLowerCase().trim() &&
        u.email.toLowerCase().trim() === user.email.toLowerCase().trim()
    );
    if (isDuplicate) {
      console.error("User already exists:", user.fullName, user.email);
      return;
    }

    dispatch(addUser(user));
    setCreatedName(user.fullName);
    setSuccessVisible(true);
  };

  return (
    <section className="form-card" style={{ maxWidth: 980 }}>
      {/* mobile-only toggle centered above form */}
      {isMobile && (
        <div           style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }} className="auth-toggle">
          <button
            className="auth-toggle-btn"
            type="button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="auth-toggle-btn active"
            type="button"
            onClick={() => {}}
          >
            Register
          </button>
        </div>
      )}

      <h2>Register User</h2>
      <div style={{ height: 8 }} />
      <UserForm
        initial={emptyValues}
        users={users}
        onSubmit={handleSubmit}
        managers={managers}
      />

<Dialog
  header="Registration Successful"
  visible={successVisible}
  style={{ width: "420px" }}
  modal
  closable={false}   // removes X button
  onHide={() => {}}  // disable hide on overlay click
  dismissableMask={false}
  footer={
    <button
      style={{
        padding: "10px 22px",
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        cursor: "pointer",
        fontWeight: 600,
      }}
      onClick={() => {
        setSuccessVisible(false);
        navigate("/login");
      }}
    >
      OK
    </button>
  }
>
  <p>
    <strong>{createdName}</strong> has been registered successfully.
  </p>
</Dialog>

    </section>
  );
}
