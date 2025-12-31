import { useCallback, useRef, useState  } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux"; // ✅ Added Redux hook
import type { RegisterFormValues, UserItem, Role } from "../config";
import type { RootState } from "../store"; // ✅ Adjust path to your store
import { eighteenYearsAgo, hundredYearsAgo } from "../config";
import { InputText } from "primereact/inputtext";    

type Props = {
  users: UserItem[];
  initial: RegisterFormValues;
  managers: UserItem[];
  onSubmit: (v: RegisterFormValues) => void;
  onCancel?: () => void;
  showCancel?: boolean;
  submitLabel?: string;
  fixedRole?: Role;
  fixedManagerId?: number;
  allowAdmin?: boolean; // ✅ This will be controlled by currentUser.role
};

function toLocalDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const COUNTRY_CODES: Record<string, string> = {
  India: "+91",
  USA: "+1",
  UK: "+44",
};




const schema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone is required"),
  gender: Yup.string().required("Gender is required"),
  dob: Yup.string().required("Date of birth is required"),
  country: Yup.string().required("Country is required"),
  role: Yup.string().required("Role is required"),

  password: Yup.string()
    .required("Password is required")
    .min(8, "Minimum 8 characters")
    .matches(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
      "Must include 1 uppercase, 1 number & 1 special character"
    ),


  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});


export default function UserForm({
  users = [],
  initial,
  managers,
  onSubmit,
  onCancel,
  showCancel,
  submitLabel = "Submit",
  fixedRole,
  fixedManagerId,
  allowAdmin = false, // ✅ Default false, overridden by currentUser
}: Props) {
  const currentId = (initial as any).id;
  const toastRef = useRef<Toast>(null);
// 👁 password visibility
const [showPassword, setShowPassword] = useState(false);   // false = hidden
const [showConfirm, setShowConfirm] = useState(false);     // false = hidden
const isMobile = window.innerWidth <= 768;


  // ✅ Get current logged-in user from Redux
  const currentUser = useSelector((state: RootState) => state.users.currentUser);

  // ✅ Admin-only: allowAdmin = true when currentUser.role === "Admin"
  const isAdminLoggedIn = currentUser?.role === "Admin";
  const effectiveAllowAdmin = allowAdmin || isAdminLoggedIn;

  const isUserAlreadyExists = useCallback(
    (values: RegisterFormValues) =>
      users.some(
        (u) =>
          u.fullName.toLowerCase().trim() ===
            values.fullName.toLowerCase().trim() &&
          u.email.toLowerCase().trim() ===
            values.email.toLowerCase().trim() &&
          u.id !== currentId
      ),
    [users, currentId]
  );

  return (
    <>
      <Toast ref={toastRef} position="top-right" />

      <Formik
        initialValues={{
          ...initial,
          role: fixedRole ?? initial.role,
          managerId:
            fixedManagerId !== undefined
              ? String(fixedManagerId)
              : initial.managerId ?? "",
        }}
        validationSchema={schema}
        validateOnBlur
        validateOnChange={false}
        validate={(values) => {
          const errors: any = {};

          const fullNameExists = users.some(
            (u) =>
              u.fullName.toLowerCase().trim() ===
                values.fullName.toLowerCase().trim() &&
              u.id !== currentId
          );
          if (fullNameExists) errors.fullName = "Full name already exists";

          const emailExists = users.some(
            (u) =>
              u.email.toLowerCase().trim() ===
                values.email.toLowerCase().trim() &&
              u.id !== currentId
          );
          if (emailExists) errors.email = "Email already exists";

          if (values.role === "User" && !values.managerId) {
            errors.managerId = "Select a manager";
          }

          return errors;
        }}
        onSubmit={(values, actions) => {
          const normalizedValues: RegisterFormValues = {
            ...values,
            managerId:
              values.managerId === "" || values.managerId == null
                ? ""
                : Number(values.managerId),
          };

          if (isUserAlreadyExists(normalizedValues)) {
            toastRef.current?.show({
              severity: "error",
              summary: "User Already Exists",
              detail: "User with same name and email already exists",
              life: 5000,
            });
            actions.setSubmitting(false);
            return;
          }

          onSubmit(normalizedValues);
          actions.setSubmitting(false);
        }}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          setFieldTouched,
          submitCount,
        }) => (
          <Form className="form-card-inner" noValidate  autoComplete="off">
            <input
  type="text"
  name="fake-username"
  autoComplete="username"
  style={{ display: "none" }}
/>
<input
  type="password"
  name="fake-password"
  autoComplete="current-password"
  style={{ display: "none" }}
/>

            <div className="form-grid">
              {/* FULL NAME */}
              <div className="form-field">
                <label>
                  Full Name <span className="req">*</span>
                </label>
                <Field
                  name="fullName"
                  onBlur={() => setFieldTouched("fullName", true)}
                  className={
                    (touched.fullName || submitCount > 0) && errors.fullName
                      ? "input-error"
                      : ""
                  }
                />
                {(touched.fullName || submitCount > 0) && (
                  <div className="error-text">{errors.fullName}</div>
                )}
              </div>

              {/* EMAIL */}
              <div className="form-field">
                <label>
                  Email <span className="req">*</span>
                </label>
                <Field
                  name="email"
                  type="email"
                  autoComplete="off"
                  onBlur={() => setFieldTouched("email", true)}
                  className={
                    (touched.email || submitCount > 0) && errors.email
                      ? "input-error"
                      : ""
                  }
                />
                {(touched.email || submitCount > 0) && (
                  <div className="error-text">{errors.email}</div>
                )}
              </div>

              {/* DOB */}
              <div className="form-field">
                <label>
                  Date of Birth <span className="req">*</span>
                </label>
                <Calendar
                  value={values.dob ? new Date(values.dob + "T00:00:00") : null}
                  minDate={hundredYearsAgo}
                  maxDate={eighteenYearsAgo}
                  yearRange="1925:2007"
                  viewDate={new Date(2007, 0, 1)}
                  dateFormat="yy-mm-dd"
                  onChange={(e) =>
                    setFieldValue(
                      "dob",
                      e.value ? toLocalDateString(e.value as Date) : ""
                    )
                  }
                  className={submitCount > 0 && errors.dob ? "input-error" : ""}
                />
                {submitCount > 0 && (
                  <div className="error-text">{errors.dob}</div>
                )}
              </div>

              {/* GENDER */}
              <div className="form-field">
                <label>
                  Gender <span className="req">*</span>
                </label>
                <Dropdown
                  value={values.gender}
                  options={[
                    { label: "Male", value: "Male" },
                    { label: "Female", value: "Female" },
                    { label: "Other", value: "Other" },
                  ]}
                  onChange={(e) => setFieldValue("gender", e.value)}
                  className={
                    (submitCount > 0 && errors.gender) ? "input-error" : ""
                  }
                />
                {submitCount > 0 && (
                  <div className="error-text">{errors.gender}</div>
                )}
              </div>

              {/* COUNTRY */}
              <div className="form-field">
                <label>
                  Country <span className="req">*</span>
                </label>
                <Dropdown
                  value={values.country}
                  options={[
                    { label: "India", value: "India" },
                    { label: "USA", value: "USA" },
                    { label: "UK", value: "UK" },
                  ]}
                  onChange={(e) => {
                    const country = e.value;
                    setFieldValue("country", country);

                    const code = COUNTRY_CODES[country];

                    if (code) {
                      // add prefix only if not already present
                      if (!values.phone?.startsWith(code)) {
                        setFieldValue("phone", code + " ");
                      }
                    }
                  }}
                  className={(submitCount > 0 && errors.country) ? "input-error" : ""}
                />
                {submitCount > 0 && (
                  <div className="error-text">{errors.country}</div>
                )}
              </div>

              {/* PHONE */}
              <div className="form-field">
                <label>
                  Phone <span className="req">*</span>
                </label>
                <Field
                  name="phone"
                  inputMode="numeric"
                  disabled={!values.country}
                  placeholder={
                    values.country
                      ? "Enter phone number"
                      : "Select country first"
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    // allow only numbers and +
                    const numericValue = e.target.value.replace(/[^\d+]/g, "");
                    setFieldValue("phone", numericValue);
                  }}
                  className={
                    (touched.phone || submitCount > 0) && errors.phone
                      ? "input-error"
                      : ""
                  }
                />
                {(touched.phone || submitCount > 0) && (
                  <div className="error-text">{errors.phone}</div>
                )}
              </div>

              {/* ROLE - ✅ Admin option shows ONLY when admin is logged in */}
              <div className="form-field">
                <label>
                  Role <span className="req">*</span>
                </label>
                <Dropdown
                  value={values.role}
                  disabled={!!fixedRole}
                  options={[
                    ...(effectiveAllowAdmin ? [{ label: "Admin", value: "Admin" }] : []),
                    { label: "Manager", value: "Manager" },
                    { label: "User", value: "User" },
                  ]}
                  onChange={(e) => {
                    setFieldValue("role", e.value);
                    if (e.value !== "User") setFieldValue("managerId", "");
                  }}
                  className={
                    (submitCount > 0 && errors.role) ? "input-error" : ""
                  }
                />
                {submitCount > 0 && (
                  <div className="error-text">{errors.role}</div>
                )}
              </div>

              {/* MANAGER */}
              {values.role === "User" && (
                <div className="form-field">
                  <label>
                    Manager <span className="req">*</span>
                  </label>
                  <Dropdown
                    value={values.managerId}
                    options={managers.map((m) => ({
                      label: m.fullName,
                      value: String(m.id),
                    }))}
                    onChange={(e) =>
                      setFieldValue("managerId", e.value)
                    }
                    className={
                      (submitCount > 0 && errors.managerId)
                        ? "input-error"
                        : ""
                    }
                  />
                  {submitCount > 0 && (
                    <div className="error-text">
                      {(errors as any).managerId}
                    </div>
                  )}
                </div>
              )}

              {/* PASSWORD */}

              <div className="form-field">
                <label>
                  Password <span className="req">*</span>
                </label>
                <div className="password-field">
                  <Field
                    as={InputText}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="off"
                    className={
                      (submitCount > 0 && errors.password ? "input-error " : "") +
                      "password-input"
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={showPassword ? "pi pi-eye-slash" : "pi pi-eye"} />
                  </button>
                </div>
                {submitCount > 0 && (
                  <div className="error-text">{errors.password}</div>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="form-field">
                <label>
                  Confirm Password <span className="req">*</span>
                </label>
                <div className="password-field">
                  <Field
                    as={InputText}
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete="off"
                    className={
                      (submitCount > 0 && errors.confirmPassword ? "input-error " : "") +
                      "password-input"
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  >
                    <i className={showConfirm ? "pi pi-eye-slash" : "pi pi-eye"} />
                  </button>
                </div>
                {submitCount > 0 && (
                  <div className="error-text">{errors.confirmPassword}</div>
                )}
              </div>

            </div>
{/* SUBMIT */}
<div className="submit-row">
  <button type="submit" className="p-button p-button-success">
    {submitLabel}
  </button>

  {/* ❌ Hide Cancel on Mobile */}
  {!isMobile && showCancel && onCancel && (
    <button
      type="button"
      onClick={onCancel}
      className="p-button p-button-secondary"
      style={{ marginLeft: 8 }}
    >
      Cancel
    </button>
  )}
</div>

          </Form>
        )}
      </Formik>
    </>
  );
}
