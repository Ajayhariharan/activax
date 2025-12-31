// pages/LoginPage.tsx
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { login } from "../store/usersSlice";
import { useEffect, useState } from "react";

const schema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password required"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.users.users);

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="login-card">
      <div className="login-card-inner">
        {/* mobile-only toggle above heading */}
        {isMobile && (
          <div className="auth-toggle"
          
          style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
          >
            <button
              className="auth-toggle-btn active"
              type="button"
              onClick={() => {}}
            >
              Login
            </button>
            <button
              className="auth-toggle-btn"
              type="button"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>
        )}

        <h2>Login</h2>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={schema}
          onSubmit={(values, actions) => {
            const email = values.email.trim().toLowerCase();
            const found = users.find(
              (u) =>
                u.email.toLowerCase() === email &&
                u.password === values.password
            );

            if (!found) {
              actions.setFieldError("email", "Invalid email or password");
              actions.setFieldError("password", " ");
              actions.setSubmitting(false);
              return;
            }

            dispatch(login(found));
            actions.setSubmitting(false);
            navigate("/dashboard");
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="input"
                />
                <ErrorMessage name="email" component="div" className="error" />
              </div>

              <div className="form-field">
                <label htmlFor="password">Password</label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  className="input"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="error"
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="login-submit-btn"
                  aria-busy={isSubmitting ? "true" : "false"}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </section>
  );
}
