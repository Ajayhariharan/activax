// src/config.ts
import * as Yup from "yup";

export type Role = "Admin" | "Manager" | "User";

export interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  gender: string;
  dob: string;
  country: string;
  role: Role | "";
  managerId?: number | "";
}

export interface ActivityPermissions {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

/* ===========================
   USER RUNTIME MODEL
   =========================== */
export interface UserItem extends RegisterFormValues {
  id: number;
  activityPermissions?: ActivityPermissions;
  profileImage?: string;
}

const USERS_KEY = "users_data";

export const loadUsers = (): UserItem[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as UserItem[]) : [];
  } catch {
    return [];
  }
};

export const saveUsers = (users: UserItem[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/* ===========================
   DATE HELPERS
   =========================== */
export const today = new Date();

export const eighteenYearsAgo = new Date();
eighteenYearsAgo.setFullYear(today.getFullYear() - 18);

export const hundredYearsAgo = new Date();
hundredYearsAgo.setFullYear(today.getFullYear() - 100);

/* ===========================
   VALIDATION
   =========================== */
export const validationSchema = Yup.object({
  fullName: Yup.string().min(3, "Minimum 3 characters").required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Min 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
  phone: Yup.string()
    .required("Phone is required")
    .transform((value) => (value ? value.trim() : value))
    .matches(/^\d+$/, "Only numbers are allowed")
    .test("len", "Enter 10 digit number", (val) => !!val && val.length === 10),
  gender: Yup.string().required("Gender is required"),
  dob: Yup.date()
    .required("Date of birth is required")
    .min(hundredYearsAgo, "Date of birth seems invalid")
    .max(
      eighteenYearsAgo,
      `You must be at least 18 years old (born on or before ${eighteenYearsAgo.toLocaleDateString()})`
    ),
  country: Yup.string().required("Country is required"),
  role: Yup.mixed<Role | "">()
    .oneOf(["Admin", "Manager", "User"], "Select a valid role")
    .required("Role is required"),
});

export const emptyValues: RegisterFormValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  gender: "",
  dob: "",
  country: "",
  role: "",
  managerId: "",
};

/* ===========================
   ACTIVITY STORAGE
   =========================== */
export interface ActivityItem {
  id: number;
  userId: number;
  date: string;
  text: string;
  createdAt: string;
  updatedAt?: string; 
}

const ACTIVITY_KEY = "activities_data";

export const saveActivities = (items: ActivityItem[]) => {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(items));
};

export const loadActivities = (): ActivityItem[] => {
  const raw = localStorage.getItem(ACTIVITY_KEY);
  return raw ? (JSON.parse(raw) as ActivityItem[]) : [];
};



export const addActivity = (
  a: Omit<ActivityItem, "id" | "createdAt" | "updatedAt">
): ActivityItem => {
  const items = loadActivities();
  const next: ActivityItem = {
    ...a,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  saveActivities([next, ...items]);
  return next;
};

export const updateActivity = (
  id: number,
  payload: { date?: string; text?: string }
): ActivityItem | null => {
  const items = loadActivities();
  const idx = items.findIndex((it) => it.id === id);
  if (idx === -1) return null;

  const updated: ActivityItem = {
    ...items[idx],
    date: payload.date ?? items[idx].date,
    text: payload.text ?? items[idx].text,
    updatedAt: new Date().toISOString(),
  };

  items.splice(idx, 1, updated);
  saveActivities(items);
  return updated;
};

export const removeActivity = (id: number): boolean => {
  const items = loadActivities();
  const next = items.filter((it) => it.id !== id);
  if (next.length === items.length) return false;
  saveActivities(next);
  return true;
};

export const queryActivities = (opts?: {
  userId?: number;
  from?: string;
  to?: string;
}) => {
  let items = loadActivities();

  const { userId, from, to } = opts ?? {};

  if (userId !== undefined) {
    items = items.filter((it) => it.userId === userId);
  }

  if (from) {
    items = items.filter((it) => it.date >= from);
  }

  if (to) {
    items = items.filter((it) => it.date <= to);
  }

  return items.sort((a, b) => {
    if (a.date === b.date) return b.createdAt.localeCompare(a.createdAt);
    return b.date.localeCompare(a.date);
  });
};

