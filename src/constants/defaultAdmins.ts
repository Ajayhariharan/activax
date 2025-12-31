import type { UserItem } from "../config";

export const DEFAULT_ADMINS: UserItem[] = [
  {
    id: 1001,
    fullName: "Admin One",
    email: "admin1@example.com",
    password: "admin123",
    confirmPassword: "admin123",
    phone: "9123569104",
    gender: "Female",
    dob: "2006-04-18",
    country: "India",
    role: "Admin",
    managerId: undefined,
  },
  {
    id: 1002,
    fullName: "Admin Two",
    email: "admin2@example.com",
    password: "admin123",
    confirmPassword: "admin123",
    phone: "9361968178",
    gender: "Male",
    dob: "2005-12-02",
    country: "India",
    role: "Admin",
    managerId: undefined,
  },
];
