// pages/MyActivityPage.tsx
import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { Editor } from "primereact/editor";
import { compressImage } from "../utils/imageUtils";
import "quill/dist/quill.snow.css";
import { Navigate } from "react-router-dom";
import type { UserItem, ActivityItem } from "../config";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addActivity as addActivityAction,
  updateActivity as updateActivityAction,
  removeActivity as removeActivityAction,
} from "../store/activitiesSlice";

function toLocalDateString(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function MyActivityPage({
  currentUser,
}: {
  currentUser?: UserItem | null;
}) {
if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const perms = currentUser.activityPermissions;

  if (!perms || !perms.view) {
    return (
      <p
        className="empty-text"
        style={{
          height: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontSize: "18px",
          opacity: 0.85,
        }}
      >
        You don't have permission to Add or view activities.
        <br />
        Please contact your manager.
      </p>
    );
  }

  const dispatch = useAppDispatch();
  const allActivities = useAppSelector((s) => s.activities.items);

  const [items, setItems] = useState<ActivityItem[]>([]);
  const [date, setDate] = useState<Date | null>(new Date());
  const [text, setText] = useState("");

  const [editVisible, setEditVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ActivityItem | null>(null);
  const [editDate, setEditDate] = useState<Date | null>(null);
  const [editText, setEditText] = useState("");

  // ✅ Enhanced delete state with date
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [toDelete, setToDelete] = useState<ActivityItem | null>(null);
  const [deleteActivityDate, setDeleteActivityDate] = useState<string>("");

  // NEW: Add dialog visibility
  const [addVisible, setAddVisible] = useState(false);

  useEffect(() => {
    setItems(
      allActivities
        .filter((a) => a.userId === currentUser.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    );
  }, [allActivities, currentUser.id]);

  /* ADD */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!perms.add || !text.trim() || !date) return;

    const created: ActivityItem = {
      id: Date.now(),
      userId: currentUser.id,
      date: toLocalDateString(date),
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    dispatch(addActivityAction(created));
    setText("");
    setDate(new Date());
    setAddVisible(false); // close popup after save
  };

  /* EDIT */
  const openEdit = (it: ActivityItem) => {
    if (!perms.edit) return;
    setEditingItem(it);
    setEditDate(new Date(it.date));
    setEditText(it.text);
    setEditVisible(true);
  };

  const saveEdit = () => {
    if (!editingItem || !editDate) return;

    const updated: ActivityItem = {
      ...editingItem,
      date: toLocalDateString(editDate),
      text: editText.trim(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(updateActivityAction(updated));
    closeEdit();
  };

  const closeEdit = () => {
    setEditVisible(false);
    setEditingItem(null);
    setEditDate(null);
    setEditText("");
  };

  /* DELETE */
  // ✅ Enhanced confirmDelete with date
  const confirmDelete = (it: ActivityItem) => {
    if (!perms.delete) return;
    setToDelete(it);
    setDeleteActivityDate(it.date);
    setDeleteVisible(true);
  };

  const doDelete = () => {
    if (!toDelete) return;
    dispatch(removeActivityAction(toDelete.id));
    setDeleteVisible(false);
    setToDelete(null);
    setDeleteActivityDate("");
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

  return (
    <section className="card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>My Activity</h2>

        {perms.add && (
          <Button
            label="Add Activity"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => setAddVisible(true)}
            style={{ borderRadius: "30px" }}
          />
        )}
      </div>

      {/* ADD POPUP (FULLSCREEN) */}
      <Dialog
        header="Add Activity"
        visible={addVisible}
        modal
        draggable={false}
        style={{ width: "96vw", height: "100vh" }}
        contentStyle={{ height: "calc(100vh - 100px)", overflow: "auto" }}
        onHide={() => setAddVisible(false)}
        footer={
          <>
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setAddVisible(false)}
            />
            <Button
              type="button"
              label="Add"
              className="p-button-success"
              onClick={(e) => submit(e as any)}
            />
          </>
        }
      >
        <form onSubmit={submit} className="my-activity-form" style={{ height: "100%" }}>
          <Calendar
            value={date}
            onChange={(e) => setDate(e.value as Date)}
            dateFormat="yy-mm-dd"
            placeholder="Select date"
          />
          <div className="form-row" style={{ marginTop: 16 }}>
            <Editor
              value={text}
              onTextChange={(e) => setText(e.htmlValue || "")}
              showHeader={false}
              style={{ height: "250px", width: "1270px" }}
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

      {/* LIST */}
      <ul className="activity-list">
        {items.map((it) => (
          <li key={it.id} className="activity-item">
            <div className="activity-item-top">
              <div>
                <strong>{currentUser.fullName}</strong>
                <div className="muted">
                  <div>
                    <strong>Activity date:</strong>{" "}
                    {new Date(it.date).toLocaleDateString()}
                    {it.updatedAt && " · edited"}
                  </div>
                </div>
              </div>
              <div className="activity-actions" style={{display: 'flex', gap: '3px'}}  >
                {perms.edit && (
                  <Button
                  style={{height:"33px"}}
                    icon="pi pi-pencil"
                    className="p-button-text"
                    onClick={() => openEdit(it)}
                  />
                )}
                {perms.delete && (
                  <Button
                    icon="pi pi-trash"
                    className="p-button-text p-button-danger"
                    onClick={() => confirmDelete(it)}
                  />
                )}
              </div>
            </div>

            <div
              className="activity-item-body ql-editor"
              style={{ fontSize: "16px", lineHeight: "1.5" }}
              dangerouslySetInnerHTML={{ __html: it.text }}
            />
          </li>
        ))}
      </ul>

      {/* EDIT DIALOG */}
      <Dialog
        header="Edit Activity"
        visible={editVisible}
        modal
        draggable={false}
        style={{ width: "96vw", height: "100vh" }}
        contentStyle={{ height: "calc(100vh - 100px)", overflow: "auto" }}
        onHide={closeEdit}
        footer={
          <>
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={closeEdit}
            />
            <Button
              type="button"
              label="Save"
              icon="pi pi-check"
              className="p-button-success"
              onClick={saveEdit}
            />
          </>
        }
      >
        <form className="my-activity-form" style={{ height: "100%" }}>
          {/* DATE (DISABLED) */}
          <Calendar
            value={editDate}
            disabled // ✅ date disabled
            dateFormat="yy-mm-dd"
          />

          {/* EDITOR */}
          <div className="form-row" style={{ marginTop: 16 }}>
            <Editor
              value={editText}
              onTextChange={(e) => setEditText(e.htmlValue || "")}
              showHeader={false}
              style={{ height: "250px", width: "1270px" }}
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

      {/* DELETE CONFIRM */}
      <Dialog
        header="Confirm Delete"
        visible={deleteVisible}
        draggable={false}
        modal
        onHide={() => {
          setDeleteVisible(false);
          setToDelete(null);
          setDeleteActivityDate("");
        }}
        footer={
          <>
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => {
                setDeleteVisible(false);
                setToDelete(null);
                setDeleteActivityDate("");
              }}
            />
            <Button
              label="Delete"
              icon="pi pi-trash"
              className="p-button-danger"
              onClick={doDelete}
            />
          </>
        }
      >
        <div>
          <p>Are you sure you want to delete this activity?</p>
          {/* ✅ Show activity date */}
          <div className="muted" style={{ marginTop: 12 }}>
            <strong>Date:</strong> {new Date(deleteActivityDate).toLocaleDateString()}
          </div>
        </div>
      </Dialog>
    </section>
  );
}
