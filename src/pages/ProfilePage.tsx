import { useState, useRef} from "react";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import AvatarEditor from "react-avatar-editor";
import type { UserItem } from "../config";
import { Navigate } from "react-router-dom";

type Props = {
  currentUser: UserItem;
  onChangePassword: (updatedUser: UserItem) => void;
};

export default function ProfilePage({ currentUser, onChangePassword }: Props) {

   if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  const [pwdDialogVisible, setPwdDialogVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [oldPwdError, setOldPwdError] = useState("");
  const [matchError, setMatchError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ================= IMAGE CROP STATES ================= */
  const [cropDialogVisible, setCropDialogVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const editorRef = useRef<AvatarEditor | null>(null);
  const [zoom, setZoom] = useState(1.2);

  /* ================= SAVE CROPPED IMAGE ================= */
  const getCroppedImage = async () => {
    if (!editorRef.current) return;

    const canvas = editorRef.current.getImageScaledToCanvas();

    // ⭐ JPEG + compression preserved
    const croppedImg = canvas.toDataURL("image/jpeg", 0.9);

    onChangePassword({
      ...currentUser,
      profileImage: croppedImg,
    });

    closeCropDialog();
  };

  const closeCropDialog = () => {
    setCropDialogVisible(false);
    setImageSrc(null);
    setZoom(1.2);
  };

  /* ================= IMAGE PICK ================= */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setZoom(1.2);
      setCropDialogVisible(true);
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  };

  /* ================= PASSWORD ================= */
  const closePasswordDialog = () => {
    setPwdDialogVisible(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOldPwdError("");
    setMatchError("");
  };

  const submitPassword = () => {
    setOldPwdError("");
    setMatchError("");

    if (oldPassword !== currentUser.password) {
      setOldPwdError("Old password incorrect");
      return;
    }

    if (newPassword === oldPassword) {
      setMatchError("New password must be different");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMatchError("Passwords do not match");
      return;
    }

    onChangePassword({ ...currentUser, password: newPassword });
    closePasswordDialog();
    setSuccessVisible(true);
  };

  return (
    <div className="card profile-page">
      <div className="profile-layout">

        {/* LEFT */}
        <div className="profile-details-card">
          <h2>
            {currentUser.fullName}{" "}
            <span className="role-chip">{currentUser.role}</span>
          </h2>

          <div className="detail"><i className="pi pi-envelope" /> {currentUser.email}</div>
          <div className="detail"><i className="pi pi-phone" /> {currentUser.phone}</div>
          <div className="detail"><i className="pi pi-calendar" /> {currentUser.dob}</div>
          <div className="detail"><i className="pi pi-user" /> {currentUser.gender}</div>
          <div className="detail"><i className="pi pi-globe" /> {currentUser.country}</div>

          <Button
            label="Change Password"
            icon="pi pi-lock"
            className="p-button-rounded p-button-info"
            onClick={() => setPwdDialogVisible(true)}
          />
        </div>

        {/* RIGHT */}
        <div className="profile-image-hero">
          <div className="avatar-hero">
            {currentUser.profileImage ? (
              <img src={currentUser.profileImage} />
            ) : (
              <span>👤</span>
            )}
            

            <div className="avatar-overlay">
              <i
                className="pi pi-pencil"
                onClick={() => fileInputRef.current?.click()}
              />
              {currentUser.profileImage && (
                <i
                  className="pi pi-trash"
                  onClick={() => setConfirmDeleteVisible(true)}
                />
              )}
            </div>
            
          </div>


          

          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* IMAGE CROP */}
      <Dialog
        header="Edit Profile Image"
        visible={cropDialogVisible}
        modal
        draggable={false}
        style={{ width: 420 }}
        onHide={closeCropDialog}
      >
        {imageSrc && (
          <>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <AvatarEditor
                ref={editorRef}
                image={imageSrc}
                width={250}
                height={250}
                border={30}
                borderRadius={125}   // ⭐ ROUND avatar
                scale={zoom}
                rotate={0}
              />
            </div>

            <input
              type="range"
              min="1"
              max="4"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ width: "100%", marginTop: 20 }}
            />

            <div className="flex gap-2 mt-3">
              <Button label="Cancel" className="p-button-text" onClick={closeCropDialog} />
              <Button label="Save" icon="pi pi-check" onClick={getCroppedImage} />
            </div>
          </>
        )}
      </Dialog>

      {/* DELETE */}
     <Dialog
  header="Remove Profile Photo"
  visible={confirmDeleteVisible}
  modal
  draggable={false}
  style={{ width: "420px", maxWidth: "92vw" }}
  onHide={() => setConfirmDeleteVisible(false)}
>
  <div style={{ textAlign: "center", padding: "10px 6px" }}>
    <i
      className="pi pi-exclamation-triangle"
      style={{ fontSize: "2rem", color: "#ff4081" }}
    />

    <p style={{ marginTop: "10px", opacity: 0.9 }}>
      Are you sure you want to delete your profile picture?
    </p>

    <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
      <Button
        label="Cancel"
        className="p-button-text"
        onClick={() => setConfirmDeleteVisible(false)}
      />

      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        style={{ borderRadius: "24px", padding: "8px 22px" }}
        onClick={() => {
          onChangePassword({ ...currentUser, profileImage: undefined });
          setConfirmDeleteVisible(false);
        }}
      />
    </div>
  </div>
</Dialog>


      {/* PASSWORD */}
      <Dialog
        header="Change Password"
        visible={pwdDialogVisible}
        modal
        draggable={false}
        onHide={closePasswordDialog}
      >
        <Password value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Old password" /><br />
        {oldPwdError && <small className="error">{oldPwdError}</small>}<br />

        <Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" /><br /><br />
        <Password value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" /><br />
        {matchError && <small className="error">{matchError}</small>}<br /><br />

        <Button  style={{borderRadius:"30px", width:"200px" }} label="Update" icon="pi pi-check" onClick={submitPassword} />
      </Dialog>

      <Dialog header="Success" visible={successVisible} onHide={() => setSuccessVisible(false)}>
        Password updated successfully!
      </Dialog>
    </div>
  );
}
