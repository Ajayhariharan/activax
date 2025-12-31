// pages/UserPermissionsPage.tsx
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import type { UserItem, ActivityPermissions } from "../config";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateUser as updateUserAction } from "../store/usersSlice";

export default function UserPermissionsPage({
  currentUser,
}: {
  currentUser?: UserItem | null;
}) {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.users.users);

if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const teamUsers = users.filter(
    (u) => u.role === "User" && u.managerId === currentUser.id
  );

  const defaultPerms: ActivityPermissions = {
    view: true,
    add: false,
    edit: false,
    delete: false,
  };

  const [draft, setDraft] = useState<Record<number, ActivityPermissions>>({});
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const getPerms = (u: UserItem) =>
    draft[u.id] ?? u.activityPermissions ?? defaultPerms;

  const updatePerm = (
  userId: number,
  key: keyof ActivityPermissions,
  value: boolean
) => {
  const prev = getPerms({ id: userId } as UserItem);

  // ❌ block unchecking view if other permissions exist
  if (
    key === "view" &&
    !value &&
    (prev.add || prev.edit || prev.delete)
  ) {
    return;
  }

  const next: ActivityPermissions = {
    ...prev,
    [key]: value,
  };

  // ✅ auto-enable view when add/edit/delete is enabled
  if ((key === "add" || key === "edit" || key === "delete") && value) {
    next.view = true;
  }

  setDraft((d) => ({ ...d, [userId]: next }));
};


  const startEdit = (u: UserItem) => {
    setDraft((d) => ({
      ...d,
      [u.id]: getPerms(u),
    }));
    setEditingUserId(u.id);
  };

  const submit = (u: UserItem) => {
    dispatch(
      updateUserAction({
        ...u,
        activityPermissions: getPerms(u),
      })
    );
    setEditingUserId(null);
  };

  return (
    <section className="card">
      <h2>User Permissions</h2>

      {teamUsers.length === 0 ? (
        <p className="empty-text">No users assigned.</p>
      ) : (
        <div className="permission-table">
          {/* HEADER */}
          <div className="permission-row header">
            <div style={{ textAlign: "left" }}>User</div>
            <div>View</div>
            <div>Add</div>
            <div>Edit</div>
            <div>Delete</div>
            <div>Action</div>
          </div>

          {/* ROWS */}
          {teamUsers.map((u) => {
            const p = getPerms(u);
            const isEditing = editingUserId === u.id;
            const isViewLocked = p.add || p.edit || p.delete;


            return (
              <div key={u.id} className="permission-row">
                <div className="user-name">{u.fullName}</div>

                {(["view", "add", "edit", "delete"] as const).map((k) => (
                  <div key={k} className="cell">
                    <Checkbox
                      checked={p[k]}
                      disabled={
                        !isEditing ||
                        (k === "view" && (p.edit || p.delete))
                      }
                      onChange={(e) => updatePerm(u.id, k, e.checked!)}
                      className={
    k === "view" && isViewLocked ? "locked-view-checkbox" : ""
  }
                    />
                  </div>
                ))}

                <div className="cell">
                  {!isEditing ? (
                    <Button
                      icon="pi pi-pencil"
                      className="p-button-text"
                      onClick={() => startEdit(u)}
                      tooltip="Edit"
                    />
                  ) : (
                    <Button
                      icon="pi pi-check"
                      className="p-button-success p-button-text"
                      onClick={() => submit(u)}
                      tooltip="Save"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
