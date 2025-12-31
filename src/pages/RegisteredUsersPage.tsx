// pages/RegisteredUsersPage.tsx
import React, { useState, useImperativeHandle, forwardRef, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { FilterMatchMode } from "primereact/api";
import type { DataTableFilterMeta } from "primereact/datatable";
import UserForm from "../components/UserForm";
import UserDataTable from "../components/UserDataTable";
import { Navigate } from "react-router-dom";
import type { UserItem, RegisterFormValues, Role } from "../config";
import { emptyValues } from "../config";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addUser, updateUser, removeUser } from "../store/usersSlice";

type Props = {
  activeTab: string;
  managerFilter: number | "all" | "unassigned";
  setManagerFilter?: (v: number | "all" | "unassigned") => void;
  setActiveTab?: (t: string) => void;
};

const RegisteredUsersPage = forwardRef(function RegisteredUsersPage(
  { activeTab, managerFilter }: Props,
  ref: React.Ref<any>
) {
  const dispatch = useAppDispatch();

  // pull users & currentUser from Redux
  const users = useAppSelector((state) => state.users.users);
  const currentUser = useAppSelector((state) => state.users.currentUser);

  const toastRef = useRef<Toast>(null);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserItem | null>(null);

  const [fixedRole, setFixedRole] = useState<Role | undefined>(undefined);

  const [fixedManagerId, setFixedManagerId] = useState<number | undefined>(undefined);
  const [allowAdmin, setAllowAdmin] = useState(false);
  const [filters, setFilters] = useState<DataTableFilterMeta>({
  fullName: { value: null, matchMode: FilterMatchMode.CONTAINS },
  email: { value: null, matchMode: FilterMatchMode.CONTAINS },
  phone: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

  const isUserAlreadyExists = (values: RegisterFormValues, excludeId?: number) =>
    users.some(
      (u) =>
        u.fullName.toLowerCase().trim() === values.fullName.toLowerCase().trim() &&
        u.email.toLowerCase().trim() === values.email.toLowerCase().trim() &&
        u.id !== excludeId
    );

  useImperativeHandle(ref, () => ({
    openNew: () => {
      setEditing(null);
      setFixedRole(undefined);
      setFixedManagerId(undefined);
      setAllowAdmin(false);

      if (currentUser?.role === "Manager") {
        setFixedRole("User");
        setFixedManagerId(currentUser.id);
      }

      setDialogVisible(true);
    },
    openNewAdmin: () => {
      if (currentUser?.role !== "Admin") return;
      setEditing(null);
      setFixedRole(undefined);
      setFixedManagerId(undefined);
      setAllowAdmin(true);
      setDialogVisible(true);
    },
    openEdit: (rowData: UserItem) => {
      setEditing(rowData);
      setFixedRole(undefined);
      setFixedManagerId(undefined);
      setAllowAdmin(false);

      if (currentUser?.role === "Manager" && rowData.role === "User") {
        setFixedRole("User");
        setFixedManagerId(currentUser.id);
      }

      setDialogVisible(true);
    },
  }));
const isMobile = window.innerWidth <= 768;

  const openEdit = (rowData: UserItem) => {
    setEditing(rowData);
    setFixedRole(undefined);
    setFixedManagerId(undefined);
    setAllowAdmin(false);

    if (currentUser?.role === "Manager" && rowData.role === "User") {
      setFixedRole("User");
      setFixedManagerId(currentUser.id);
    }

    setDialogVisible(true);
  };

  const openView = (rowData: UserItem) => {
    setViewingUser(rowData);
    setViewDialogVisible(true);
  };

  const openDelete = (id: number) => {
    setToDeleteId(id);
    setConfirmDeleteVisible(true);
  };

  const handleSave = (values: RegisterFormValues) => {
    const currentId = editing?.id;

    if (isUserAlreadyExists(values, currentId)) {
      toastRef.current?.show({
        severity: "error",
        summary: editing ? "Update Failed" : "Registration Failed",
        detail: `User "${values.fullName}" with email "${values.email}" already exists.`,
        life: 5000,
      });
      return;
    }

    let finalValues: RegisterFormValues = { ...values };

    if (currentUser?.role === "Manager") {
      finalValues = {
        ...finalValues,
        role: "User",
managerId: currentUser.id,
      };
    }

    if (editing) {
      const updated: UserItem = {
        ...editing,
        ...finalValues,
        managerId:
          finalValues.managerId === "" || finalValues.managerId == null
            ? undefined
            : Number(finalValues.managerId),
      };
      dispatch(updateUser(updated));
    } else {
      const created: UserItem = {
        id: Date.now(),
        ...finalValues,
        managerId:
          finalValues.managerId === "" || finalValues.managerId == null
            ? undefined
            : Number(finalValues.managerId),
      };
      dispatch(addUser(created));
    }

    setDialogVisible(false);
    setEditing(null);
    setFixedRole(undefined);
    setFixedManagerId(undefined);
    setAllowAdmin(false);
  };

  const confirmDelete = () => {
    if (toDeleteId != null) dispatch(removeUser(toDeleteId));
    setConfirmDeleteVisible(false);
    setToDeleteId(null);
  };

  const canEditUser = (row: UserItem) => {
    if (!currentUser) return false;
    if (currentUser.role === "Admin") return true;
    if (
      currentUser.role === "Manager" &&
      row.role === "User" &&
      row.managerId === currentUser.id
    ) {
      return true;
    }
    return false;
  };

const canDeleteUser = (_row: UserItem) => currentUser?.role === "Admin";

  const actionsTemplate = (rowData: UserItem) => (
    <div style={{ display: "flex", gap: 8 }}>
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-secondary"
        onClick={() => openView(rowData)}
        aria-label="View"
        title="View"
      />
      {canEditUser(rowData) && (
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-info"
          onClick={() => openEdit(rowData)}
          aria-label="Edit"
          title="Edit"
        />
      )}
      {canDeleteUser(rowData) && (
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => openDelete(rowData.id)}
          aria-label="Delete"
          title="Delete"
        />
      )}
    </div>
  );

  const deleteTargetName =
    toDeleteId != null ? users.find((u) => u.id === toDeleteId)?.fullName : undefined;
  const admins = users.filter((u) => u.role === "Admin");
  const managers = users.filter((u) => u.role === "Manager");
  const allUsers = users.filter((u) => u.role === "User");

  const nameBody = (rowData: UserItem) => {
    const isMe = currentUser && rowData.id === currentUser.id;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>{rowData.fullName}</span>
        {isMe && <span className="you-badge">You</span>}
      </div>
    );
  };

  const managerNameFor = (u: UserItem) =>
    users.find((x) => x.id === u.managerId)?.fullName ?? "-";

  const rowClassName = (rowData: any) => {
    if (!currentUser) return "";
    return rowData.id === currentUser.id ? "highlight-row" : "";
  };

  let visibleUsers = users;
  if (!currentUser) visibleUsers = [];
  else if (currentUser.role === "Manager")
    visibleUsers = users.filter((u) => u.role === "User" && u.managerId === currentUser.id);
  else if (currentUser.role === "User")
    visibleUsers = users.filter(
      (u) =>
        u.id === currentUser.id ||
        (u.role === "User" &&
          u.managerId !== undefined &&
          currentUser.managerId !== undefined &&
          u.managerId === currentUser.managerId)
    );
  else if (currentUser.role === "Admin") visibleUsers = users;

  const usersTabList = (() => {
    if (currentUser?.role !== "Admin") return [];
    if (managerFilter === "all") return allUsers;
    if (managerFilter === "unassigned")
      return allUsers.filter((u) => u.managerId === undefined || u.managerId === null);
    return allUsers.filter((u) => u.managerId === managerFilter);
  })();

  const managersWithTeamSize = managers.map((m) => ({
    ...m,
    teamSize: users.filter((u) => u.managerId === m.id).length,
  }));

  const usersWithManagerName = usersTabList.map((u) => ({
    ...u,
    managerName: managerNameFor(u),
  }));

  return (
    <>
      <Toast ref={toastRef} position="top-right" />

      <section
        className={`table-cardx ${currentUser?.role === "User" ? "user-details-table" : ""}`}
      >
        {currentUser?.role === "Admin" ? (
          <>
            {activeTab === "admins" && (
              <UserDataTable
                value={admins}
                rows={6}
                 isMobile={isMobile}
                rowClassName={rowClassName}
                filters={filters}
                setFilters={setFilters}
                nameHeader="Admin"
                actionsTemplate={actionsTemplate}
                nameBody={nameBody}
              />
            )}
            {activeTab === "managers" && (
              <UserDataTable
                value={managersWithTeamSize}
                rows={6}
                 isMobile={isMobile}
                rowClassName={rowClassName}
                filters={filters}
                setFilters={setFilters}
                nameHeader="Manager"
                showTeamSize
                actionsTemplate={actionsTemplate}
                nameBody={nameBody}
              />
            )}
            {activeTab === "users" && (
              <UserDataTable
                value={usersWithManagerName}
                rows={8}
                 isMobile={isMobile}
                rowClassName={rowClassName}
                filters={filters}
                setFilters={setFilters}
                nameHeader="Name"
                showDob
                showManagerName
                actionsTemplate={actionsTemplate}
                nameBody={nameBody}
              />
            )}
          </>
        ) : currentUser?.role === "Manager" ? (
          <>
            {activeTab === "managers" && (
              <UserDataTable
                value={managersWithTeamSize}
                rows={6}
                 isMobile={isMobile}
                rowClassName={rowClassName}
                filters={filters}
                setFilters={setFilters}
                nameHeader="Manager"
                showTeamSize
                actionsTemplate={actionsTemplate}
                nameBody={nameBody}
              />
            )}
            {activeTab === "users" && (
              <UserDataTable
                value={visibleUsers}
                rows={8}
                 isMobile={isMobile}
                rowClassName={rowClassName}
                filters={filters}
                setFilters={setFilters}
                nameHeader="Name"
                showDob
                actionsTemplate={actionsTemplate}
                nameBody={nameBody}
              />
            )}
          </>
        ) : (
          <>
            {visibleUsers.length === 0 ? (
             <Navigate to="/login" replace />
  
            ) : (
              <UserDataTable
                value={visibleUsers.map((u) => ({
                  ...u,
                  managerName: managerNameFor(u),
                }))}
                rows={8}
                 isMobile={isMobile}
                rowClassName={rowClassName}
                filters={filters}
                setFilters={setFilters}
                nameHeader="Name"
                showGender
                showDob
                actionsTemplate={actionsTemplate}
                nameBody={nameBody}
              />
            )}
          </>
        )}

        {/* UserForm Dialog */}
        <Dialog
          draggable={false}
          header={editing ? "Edit User" : "New User"}
          visible={dialogVisible}
          style={{ width: "720px" }}
          modal
          onHide={() => {
            setDialogVisible(false);
            setEditing(null);
            setFixedRole(undefined);
            setFixedManagerId(undefined);
            setAllowAdmin(false);
          }}
        >
          <div className="user-form-scroll">
            <UserForm
              initial={
                editing ? { ...editing, confirmPassword: editing.password } : emptyValues
              }
              users={users}
              onSubmit={handleSave}
              onCancel={() => {
                setDialogVisible(false);
                setEditing(null);
                setFixedRole(undefined);
                setFixedManagerId(undefined);
                setAllowAdmin(false);
              }}
              showCancel
              submitLabel={editing ? "Update" : "Submit"}
              managers={users.filter((u) => u.role === "Manager")}
              fixedRole={fixedRole}
              fixedManagerId={fixedManagerId}
              allowAdmin={allowAdmin}
            />
          </div>
        </Dialog>

        {/* View Dialog */}
        <Dialog
          draggable={false}
          header="User Details"
          visible={viewDialogVisible}
          style={{ width: "520px" }}
          modal
          onHide={() => setViewDialogVisible(false)}
        >
          {viewingUser ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <strong>Name</strong>
                <div>
                  {viewingUser.fullName}
                  {viewingUser.id === currentUser?.id ? " (You)" : ""}
                </div>
              </div>
              <div>
                <strong>Email</strong>
                <div>{viewingUser.email}</div>
              </div>
              <div>
                <strong>Phone</strong>
                <div>{viewingUser.phone}</div>
              </div>
              <div>
                <strong>Gender</strong>
                <div>{viewingUser.gender}</div>
              </div>
              <div>
                <strong>Country</strong>
                <div>{viewingUser.country}</div>
              </div>
              <div>
                <strong>DOB</strong>
                <div>{viewingUser.dob}</div>
              </div>
              <div>
                <strong>Role</strong>
                <div>{viewingUser.role}</div>
              </div>
              <div>
                <strong>Manager</strong>
                <div>
                  {users.find((u) => u.id === viewingUser.managerId)?.fullName ?? "-"}
                </div>
              </div>
            </div>
          ) : (
            <div>No user selected</div>
          )}
        </Dialog>

        {/* Delete Dialog */}
        <Dialog
          draggable={false}
          header="Confirm Delete"
          visible={confirmDeleteVisible}
          style={{ width: "420px" }}
          modal
          onHide={() => setConfirmDeleteVisible(false)}
        >
          <p>
            <strong>{deleteTargetName ?? "User"}</strong> — are you sure you want to
            delete this user?
          </p>
          <div style={{ textAlign: "right", marginTop: 16 }}>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={() => setConfirmDeleteVisible(false)}
              className="p-button-text"
            />
            <Button
              label="Delete"
              icon="pi pi-check"
              onClick={confirmDelete}
              autoFocus
              className="p-button-danger"
              style={{ marginLeft: 8 }}
            />
          </div>
        </Dialog>
      </section>
    </>
  );
});

export default RegisteredUsersPage;
