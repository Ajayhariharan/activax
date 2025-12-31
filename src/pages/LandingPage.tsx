import { useNavigate } from "react-router-dom";
import GradientBlinds from "../components/GradientBlinds";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page-wrapper">
      {/* FULL HERO SCREEN */}
      <section className="landing-hero">
        <GradientBlinds
          gradientColors={["#FF9FFC", "#9727ffff"]}
          angle={0}
          noise={0.25}
          blindCount={14}
          blindMinWidth={60}
          spotlightRadius={0.45}
          spotlightSoftness={1}
          spotlightOpacity={1}
          mouseDampening={0.12}
          distortAmount={0}
          shineDirection="left"
          mixBlendMode="lighten"
        />
        <div className="landing-content">
          <h1>User & Activity Management System</h1>
          <p>Role based management of users, activities and permissions</p>
          <button className="enter-btn" onClick={() => navigate("/login")}>
            Enter App
          </button>
        </div>
      </section>

      {/* SECOND PAGE / CONTENT BELOW */}
      <section className="next-section">
        {/* ABOUT SECTION – OUTSIDE HERO */}
      <div  style={{borderRadius:"30px"}} className="landing-about">
      
      
      {/* ABOUT SECTION TITLE */}
      <div className="about-title-wrap">
        <h1>About This App</h1>
      </div><br></br>
  <div className="about-container">
    <section>
      <h3>📌 What is this app?</h3>
      <p>
        A complete Frontend based <b>User & Activity Management System</b> designed to
        manage users, track daily activities, and control access based on
        roles like <b>Admin</b>, <b>Manager</b>, and <b>User</b>.
      </p>
    </section>

    <section>
      <h3>👥 Roles & Responsibilities</h3>
      <ul>
        <li><b>Admin</b> – Register users, track activities & manage permissions.</li>
        <li><b>Manager</b> – Manage assigned users & review activity logs.</li>
        <li><b>User</b> – View profile & log daily activities.</li>
      </ul>
    </section>

    <section>
      <h3>📝 How to Register</h3>
      <p>
        Managers and Users can register by filling out the form
        with name, email, role, manager, and password.
      </p>
    </section>

    <section>
      <h3>📅 How to Add Activities</h3>
      <ul>
        <li>Users add activities from <b>My Activity</b> (after manager approval).</li>
        <li>Include date, description, image & work details.</li>
        <li>Admins & Managers review via <b>User Activity</b>.</li>
      </ul>
    </section>

    <section>
      <h3>👤 Profile Management</h3>
      <ul>
        <li>Update profile picture & password securely.</li>
        <li>All updates are validated and stored safely.</li>
      </ul>
    </section>

    <section>
      <h3>🔐 Permissions & Security</h3>
      <p>All access is role-based with secure authentication.</p>
      <ul>
        <li>JWT authentication</li>
        <li>Protected routes</li>
        <li>Granular access rules</li>
      </ul>
    </section>

    <section>
      <h3>📊 Dashboard Features</h3>
      <ul>
        <li>User stats & recent activity overview</li>
        <li>Metric summary cards</li>
        <li>Live recent feed</li>
      </ul>
    </section>

    <section>
      <h3>📈 Activity Tracking</h3>
      <ul>
        <li><b>My Activity</b> — Users log work</li>
        <li><b>User Activity</b> — Managers review</li>
        <li>Filter by user & date</li>
      </ul>
    </section>

    <section>
      <h3>⚙️ User Permissions (Manager Only)</h3>
      <ul>
        <li>Assign & modify roles</li>
        <li>Control access levels</li>
        <li>Track permission changes</li>
      </ul>
    </section>

    <section>
      <h3>✅ Key Features Summary</h3>
      <ul>
        <li>User lifecycle management</li>
        <li>Real-time activity tracking</li>
        <li>Role-based access</li>
        <li>Mobile friendly</li>
        <li>Secure uploads</li>
        <li>Fast search & filtering</li>
        <li>Modern UI/UX</li>
      </ul>
    </section>

    <section>
      <h3>🚀 Getting Started</h3>
      <ol>
        <li>Register / Login</li>
        <li>Create users or managers</li>
        <li>Log activities</li>
        <li>Managers review & approve</li>
      </ol>
    </section>
    <section>
      <h3>📞 Contact</h3>
      <ul>
        <li>third planet in the Solar System</li>
        <li>orbiting at about 150 million km away</li>
        <li>phn: #universalcode</li>
      </ul>
    </section>

  </div>
</div>

      </section>
    </div>
  );
}
