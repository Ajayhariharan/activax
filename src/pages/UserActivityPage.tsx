// pages/UserActivityPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Editor } from "primereact/editor";
import { compressImage } from "../utils/imageUtils";
import "quill/dist/quill.snow.css";
import type { UserItem, ActivityItem } from "../config";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  updateActivity as updateActivityAction,
  removeActivity as removeActivityAction,
} from "../store/activitiesSlice";

type Props = {
  currentUser?: UserItem | null;
};

/* ✅ TIMEZONE SAFE DATE HELPERS */
const toLocalDateString = (d: Date | null) => {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const fromDateString = (v: string) => (v ? new Date(v + "T00:00:00") : null);

export default function UserActivityPage({ currentUser }: Props) {
  const users = useAppSelector((state) => state.users.users);
  const allActivities = useAppSelector((state) => state.activities.items);
  const dispatch = useAppDispatch();

  const [selectedManagerId, setSelectedManagerId] =
    useState<number | "all" | "unassigned">("all");
  const [selectedUserId, setSelectedUserId] = useState<number | "all">("all");
  const [date, setDate] = useState<string>("");

  const [items, setItems] = useState<ActivityItem[]>([]);

  const [editVisible, setEditVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ActivityItem | null>(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState<string>("");

  // ✅ Store activity being deleted + its date
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteActivityDate, setDeleteActivityDate] = useState<string>("");

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "Manager") {
      setSelectedManagerId(currentUser.id);
      setSelectedUserId("all");
    }
  }, [currentUser]);

  const managers = useMemo(
    () => users.filter((u) => u.role === "Manager"),
    [users]
  );

  const allUsers = useMemo(
    () => users.filter((u) => u.role === "User"),
    [users]
  );

  const usersForDropdown = useMemo(() => {
    if (!currentUser) return [];

    if (currentUser.role === "Manager") {
      return allUsers.filter((u) => u.managerId === currentUser.id);
    }

    if (selectedManagerId === "all") return allUsers;
    if (selectedManagerId === "unassigned") {
      return allUsers.filter((u) => u.managerId == null);
    }

    return allUsers.filter((u) => u.managerId === selectedManagerId);
  }, [currentUser, selectedManagerId, allUsers]);

  /* FILTER ACTIVITIES */
  useEffect(() => {
    if (!currentUser) {
      setItems([]);
      return;
    }

    let result = allActivities;

    if (date) {
      result = result.filter((a) => a.date === date);
    }

    if (selectedUserId !== "all") {
      result = result.filter((a) => a.userId === selectedUserId);
    } else if (currentUser.role === "Manager") {
      const ids = usersForDropdown.map((u) => u.id);
      result = result.filter((a) => ids.includes(a.userId));
    } else if (currentUser.role === "Admin" && selectedManagerId !== "all") {
      result = result.filter((a) => {
        const owner = users.find((u) => u.id === a.userId);
        return selectedManagerId === "unassigned"
          ? owner?.managerId == null
          : owner?.managerId === selectedManagerId;
      });
    }

    result = [...result].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setItems(result);
  }, [
    currentUser,
    selectedManagerId,
    selectedUserId,
    date,
    users,
    usersForDropdown,
    allActivities,
  ]);

 if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role !== "Admin" && currentUser.role !== "Manager") {
    return <p className="empty-text">Not allowed.</p>;
  }

  const managerOptions =
    currentUser.role === "Manager"
      ? [{ label: currentUser.fullName, value: currentUser.id }]
      : [
          { label: "All managers", value: "all" },
          ...managers.map((m) => ({
            label: m.fullName,
            value: m.id,
          })),
        ];

  const userOptions = [
    { label: "All users", value: "all" },
    ...usersForDropdown.map((u) => ({
      label: u.fullName,
      value: u.id,
    })),
  ];

  const openEdit = (it: ActivityItem) => {
    setEditingItem(it);
    setEditText(it.text);
    setEditDate(it.date);
    setEditVisible(true);
  };

  const saveEdit = () => {
    if (!editingItem) return;

    dispatch(
      updateActivityAction({
        ...editingItem,
        text: editText.trim(),
        date: editDate,
      })
    );

    setEditVisible(false);
    setEditingItem(null);
  };

  const imageHandler = (quill: any) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const compressed = await compressImage(file, 600, 0.6);

      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", compressed);
    };

    input.click();
  };

  // ✅ Open delete dialog with activity date
  const openDelete = (it: ActivityItem) => {
    setDeleteId(it.id);
    setDeleteActivityDate(it.date);
  };

  return (
    <section>
      <h2>User Activity</h2>

      {/* FILTERS */}
      <div className="activity-filter-row">
        <div className="field">
          <label>Manager</label>
          <Dropdown
            value={selectedManagerId}
            options={managerOptions}
            onChange={(e) => {
              setSelectedManagerId(e.value);
              setSelectedUserId("all");
            }}
            disabled={currentUser.role === "Manager"}
          />
        </div>

        <div className="field">
          <label>User</label>
          <Dropdown
            value={selectedUserId}
            options={userOptions}
            onChange={(e) => setSelectedUserId(e.value)}
          />
        </div>

        <div className="field">
          <label>Date</label>
          <Calendar
            value={fromDateString(date)}
            onChange={(e) => setDate(toLocalDateString(e.value as Date))}
            dateFormat="yy-mm-dd"
            placeholder="Select date"
          />
        </div>
      </div>

      {/* LIST */}
      {items.length === 0 ? (
        <div className="empty-text">No activity found.</div>
      ) : (
        <ul className="activity-list">
          {items.map((it) => {
            const owner = users.find((u) => u.id === it.userId);
            return (
              <li key={it.id} className="activity-item">
                <div className="activity-item-top">
                  <div>
                    <strong>{owner?.fullName ?? "Unknown user"}</strong>
                    <div className="muted">
                      <div>
                        <strong>Activity date:</strong>{" "}
                        {new Date(it.date).toLocaleDateString()}{" "}
                        {it.updatedAt && "· edited"}
                      </div>
                    </div>
                  </div>

                <div className="activity-actions" style={{display: 'flex', gap: '3px'}} >
                  <Button
                    icon="pi pi-pencil"
                    className="p-button-text"
                    onClick={() => openEdit(it)}
                    style={{height:"33px"}}
                  />
                  <Button
                    icon="pi pi-trash"
                    className="p-button-text p-button-danger"
                    onClick={() => openDelete(it)}
                  />
                </div>

                </div>

                <div
                  className="activity-item-body ql-editor"
                  style={{ fontSize: "16px", lineHeight: "1.5" }}
                  dangerouslySetInnerHTML={{ __html: it.text }}
                />
              </li>
            );
          })}
        </ul>
      )}

      {/* EDIT */}
      <Dialog
        header="Edit Activity"
        visible={editVisible}
        modal
        draggable={false}
        style={{ width: "96vw", height: "100vh" }}
        contentStyle={{ height: "calc(100vh - 100px)", overflow: "auto" }}
        onHide={() => setEditVisible(false)}
        footer={
          <>
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setEditVisible(false)}
            />
            <Button
              label="Save"
              className="p-button-success"
              onClick={saveEdit}
            />
          </>
        }
      >
        <form className="my-activity-form" style={{ height: "100%" }}>
          {/* DATE */}
          <Calendar
            value={fromDateString(editDate)}
            disabled // ✅ date disabled
            dateFormat="yy-mm-dd"
          />

          {/* EDITOR */}
          <div className="form-row" style={{ marginTop: 16 }}>
            <Editor
              value={editText}
              onTextChange={(e) => setEditText(e.htmlValue || "")}
              showHeader={false}
              style={{ height: "250px", width: "1260px" }}
              modules={{
                toolbar: {
                  container: [
                    [{ font: [] }, { size: [] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ color: [] }, { background: [] }],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ indent: "-1" }, { indent: "+1" }],
                    [{ align: [] }],
                    ["link", "image", "code-block"],
                    ["clean"],
                  ],
                  handlers: {
                    image: function (this: any) {
                      imageHandler(this.quill);
                    },
                  },
                },
              }}
            />
          </div>
        </form>
      </Dialog>

      {/* DELETE */}
      <Dialog
        header="Confirm delete"
        visible={deleteId != null}
        modal
        draggable={false}
        onHide={() => {
          setDeleteId(null);
          setDeleteActivityDate("");
        }}
        footer={
          <>
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => {
                setDeleteId(null);
                setDeleteActivityDate("");
              }}
            />
            <Button
              label="Delete"
              className="p-button-danger"
              onClick={() => {
                if (deleteId != null) {
                  dispatch(removeActivityAction(deleteId));
                }
                setDeleteId(null);
                setDeleteActivityDate("");
              }}
            />
          </>
        }
      >
        <div>
          <p>Are you sure you want to delete this activity?</p>
          {/* ✅ Show activity date */}
          <div className="muted" style={{ marginTop: 12 }}>
            <strong>Activity Date:</strong> {new Date(deleteActivityDate).toLocaleDateString()}
          </div>
        </div>
      </Dialog>
    </section>
  );
}
