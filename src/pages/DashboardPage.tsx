// src/pages/DashboardPage.tsx
import { useMemo, useState } from "react";
import type { UserItem } from "../config";
import { useAppSelector } from "../store/hooks";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import "quill/dist/quill.snow.css";
import { MemoChart } from "../components/MemoChart";
import { Navigate } from "react-router-dom";

type Props = {
  currentUser?: UserItem | null;
};

/* TIMEZONE SAFE DATE HELPERS */
const toLocalDateString = (d: Date | null) => {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const fromDateString = (v: string) => (v ? new Date(v + "T00:00:00") : null);

export default function DashboardPage({ currentUser }: Props) {
  const users = useAppSelector((s) => s.users.users);
  const activities = useAppSelector((s) => s.activities.items);

if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const userById = useMemo(() => {
    const map = new Map<number, UserItem>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const activitiesPerUser = useMemo(() => {
    const counts = new Map<number, number>();
    activities.forEach((a) => {
      counts.set(a.userId, (counts.get(a.userId) ?? 0) + 1);
    });
    return counts;
  }, [activities]);

  const activitiesPerManager = useMemo(() => {
    const counts = new Map<number, number>();
    activities.forEach((a) => {
      const owner = userById.get(a.userId);
      if (!owner || typeof owner.managerId !== "number") return;
      const managerId = owner.managerId;
      counts.set(managerId, (counts.get(managerId) ?? 0) + 1);
    });
    return counts;
  }, [activities, userById]);

  const userActivityByDate = useMemo(() => {
    if (currentUser.role !== "User") return [];
    const map = new Map<string, number>();
    activities
      .filter((a) => a.userId === currentUser.id)
      .forEach((a) => {
        map.set(a.date, (map.get(a.date) ?? 0) + 1);
      });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));
  }, [activities, currentUser]);

  const managerTeamUsers = useMemo(() => {
    if (currentUser.role !== "Manager") return [];
    return users.filter((u) => u.managerId === currentUser.id && u.role === "User");
  }, [users, currentUser]);

  const allManagers = useMemo(
    () => users.filter((u) => u.role === "Manager"),
    [users]
  );

  const userTeamUsers = useMemo(() => {
    if (currentUser.role !== "User" || currentUser.managerId == null) return [];
    return users.filter(
      (u) =>
        u.role === "User" &&
        u.managerId === currentUser.managerId &&
        u.id !== currentUser.id
    );
  }, [users, currentUser]);

  /* ========= DATA (memoized) ========= */

  const userLineData = useMemo(
    () =>
      currentUser.role === "User"
        ? {
            labels: userActivityByDate.map((r) => r.date),
            datasets: [
              {
                label: "Activities",
                data: userActivityByDate.map((r) => r.count),
                borderColor: "#42A5F5",
                backgroundColor: "rgba(66, 165, 245, 0.3)",
                tension: 0.3,
              },
            ],
          }
        : null,
    [currentUser.role, userActivityByDate]
  );

  const managerBarData = useMemo(
    () =>
      currentUser.role === "Manager"
        ? {
            labels: managerTeamUsers.map((u) => u.fullName),
            datasets: [
              {
                label: "Activities per user",
                data: managerTeamUsers.map((u) => activitiesPerUser.get(u.id) ?? 0),
                backgroundColor: "#66BB6A",
              },
            ],
          }
        : null,
    [currentUser.role, managerTeamUsers, activitiesPerUser]
  );

  const adminManagerBarData = useMemo(
    () =>
      currentUser.role === "Admin"
        ? {
            labels: allManagers.map((m) => m.fullName),
            datasets: [
              {
                label: "Activities per manager",
                data: allManagers.map((m) => activitiesPerManager.get(m.id) ?? 0),
                backgroundColor: "#FFA726",
              },
            ],
          }
        : null,
    [currentUser.role, allManagers, activitiesPerManager]
  );


  const userTeamPieData = useMemo(
    () =>
      currentUser.role === "User"
        ? {
            labels: ["You", "Your Team"],
            datasets: [
              {
                data: [
                  activitiesPerUser.get(currentUser.id) ?? 0,
                  userTeamUsers.reduce(
                    (sum, u) => sum + (activitiesPerUser.get(u.id) ?? 0),
                    0
                  ),
                ],
                backgroundColor: ["#42A5F5", "#FFA726"],
              },
            ],
          }
        : null,
    [currentUser.role, currentUser.id, userTeamUsers, activitiesPerUser]
  );

  const managerPieData = useMemo(
    () =>
      currentUser.role === "Manager"
        ? {
            labels: managerTeamUsers.map((u) => u.fullName),
            datasets: [
              {
                data: managerTeamUsers.map((u) => activitiesPerUser.get(u.id) ?? 0),
                backgroundColor: [
                  "#66BB6A",
                  "#26C6DA",
                  "#FFCA28",
                  "#EC407A",
                  "#8D6E63",
                ],
              },
            ],
          }
        : null,
    [currentUser.role, managerTeamUsers, activitiesPerUser]
  );

  const adminManagerPieData = useMemo(
    () =>
      currentUser.role === "Admin"
        ? {
            labels: allManagers.map((m) => m.fullName),
            datasets: [
              {
                data: allManagers.map((m) => activitiesPerManager.get(m.id) ?? 0),
                backgroundColor: [
                  "#FFA726",
                  "#29B6F6",
                  "#EF5350",
                  "#9CCC65",
                  "#AB47BC",
                ],
              },
            ],
          }
        : null,
    [currentUser.role, allManagers, activitiesPerManager]
  );

  /* ========= OPTIONS (memoized) ========= */

 // ✅ BASE OPTIONS FOR LINE/BAR CHARTS (with scales + hover)
const baseOptions = useMemo(
  () => ({
    plugins: {
      legend: {
        labels: {
          color: "#9900ff",
          usePointStyle: true,
          padding: 20,
        },
      },
    },

    onHover: (event: any, elements: any[]) => {
      const canvas = event?.native?.target as HTMLCanvasElement | undefined;
      if (!canvas) return;
      canvas.style.cursor = elements.length ? "pointer" : "default";
    },

    scales: {
      x: {
        ticks: {
          color: "rgba(98, 0, 255, 1)",
        },
        grid: {
          color: "rgba(82, 72, 72, 0.34)",
        },
        title: {
          display: false, // enable if needed
          text: "",
          color: "rgba(98, 0, 255, 1)",
        },
      },

      y: {
        ticks: {
          stepSize: 1,
          precision: 0,
          callback: (v: number) => (Number.isInteger(v) ? v : null),
          color: "rgba(98, 0, 255, 1)",
        },
        grid: {
          color: "rgba(82, 72, 72, 0.34)",
        },
        title: {
          display: false, // enable if needed
          text: "",
          color: "rgba(98, 0, 255, 1)",
        },
      },
    },
  }),
  []
);


  // ✅ SEPARATE PIE-SPECIFIC BASE OPTIONS (hover pointer + no grid + theme-aware legend)
  const pieBaseOptions = useMemo(
    () => ({
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { 
            color: "#9900ffff", // Works on light/dark themes
            usePointStyle: true,
            padding: 20,
            font: {
              size: 14
            }
          },
        },
      },
      // ✅ PIE-SPECIFIC HOVER POINTER (no scales = no grid)
      onHover: (event: any, elements: any[]) => {
        const canvas = event?.native?.target as HTMLCanvasElement | undefined;
        if (!canvas) return;
        canvas.style.cursor = elements.length ? "pointer" : "default";
      },
      // No scales = automatically no grid lines for pie charts
    }),
    []
  );

  const userOptions = useMemo(
    () => ({
      ...baseOptions,
      scales: {
        ...baseOptions.scales,
        y: {
          ...baseOptions.scales.y,
          ticks: {
            stepSize: 1,
            precision: 0,
            callback: (value: number) =>
              Number.isInteger(value) ? value : null,
            color: "#9900ffff",
          },
        },
      },
    }),
    [baseOptions]
  );

  const dialogUserOptions = useMemo(
    () => ({
      ...baseOptions,
      scales: {
        ...baseOptions.scales,
        x: {
          ...baseOptions.scales.x,
          title: {
            ...baseOptions.scales.x.title,
            text: "Users",
          },
        },
      },
    }),
    [baseOptions]
  );

  /* ========= ADMIN MANAGER USERS DIALOG ========= */

  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(null);
  const [managerDialogDate, setManagerDialogDate] = useState<string>("");

  const selectedManager = useMemo(
    () => allManagers.find((m) => m.id === selectedManagerId) ?? null,
    [allManagers, selectedManagerId]
  );

  const selectedManagerUsers = useMemo(() => {
    if (!selectedManager) return [];
    return users.filter(
      (u) => u.role === "User" && u.managerId === selectedManager.id
    );
  }, [users, selectedManager]);

  const selectedManagerUsersBarData = useMemo(
    () =>
      selectedManager && selectedManagerUsers.length > 0
        ? (() => {
            const labels = selectedManagerUsers.map((u) => u.fullName);
            const data = selectedManagerUsers.map((u) => {
              const userActs = activities.filter((a) => a.userId === u.id);
              const filtered = managerDialogDate
                ? userActs.filter((a) => a.date === managerDialogDate)
                : userActs;
              return filtered.length;
            });
            return {
              labels,
              datasets: [
                {
                  label: managerDialogDate
                    ? `Activities on ${managerDialogDate}`
                    : `Activities for ${selectedManager.fullName}'s users`,
                  data,
                  backgroundColor: "#26C6DA",
                },
              ],
            };
          })()
        : null,
    [selectedManager, selectedManagerUsers, activities, managerDialogDate]
  );

  const handleAdminManagerClick = (event: any) => {
    if (!adminManagerBarData) return;
    const index = event?.element?.index;
    if (index == null) return;
    const managerName = adminManagerBarData.labels[index] as string;
    const manager = allManagers.find((m) => m.fullName === managerName);
    if (!manager) return;
    setSelectedManagerId(manager.id);
    setManagerDialogDate("");
  };

  const adminManagerBarOptions = useMemo(
    () => ({
      ...baseOptions,
      onClick: (_evt: any, elements: any[]) => {
        if (!elements?.length) return;
        const element = elements[0];
        handleAdminManagerClick({ element });
      },
    }),
    [baseOptions, adminManagerBarData, allManagers]
  );

  /* ========= USER ACTIVITIES DIALOG FOR MANAGER/ADMIN ========= */

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [dialogDate, setDialogDate] = useState<string>("");

  const selectedUser = useMemo(
    () =>
      selectedUserId != null
        ? users.find((u) => u.id === selectedUserId) ?? null
        : null,
    [selectedUserId, users]
  );

  const selectedUserActivities = useMemo(() => {
    if (selectedUserId == null) return [];
    return activities
      .filter((a) => a.userId === selectedUserId)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [selectedUserId, activities]);

  const managerUserBarOptions = useMemo(
    () => ({
      ...baseOptions,
      onClick: (_evt: any, elements: any[]) => {
        if (!elements?.length || !managerBarData) return;
        const element = elements[0];
        const index = element.index;
        const label = managerBarData.labels[index] as string;
        const user = managerTeamUsers.find((u) => u.fullName === label);
        if (!user) return;
        setSelectedUserId(user.id);
        setDialogDate("");
      },
    }),
    [baseOptions, managerBarData, managerTeamUsers]
  );



  const managerPieOptions = useMemo(
    () => ({
      ...pieBaseOptions, // ✅ Uses separate pie base with hover pointer
      onClick: (_evt: any, elements: any[]) => {
        if (!elements?.length || !managerPieData) return;
        const index = elements[0].index;
        const label = managerPieData.labels[index] as string;
        const user = managerTeamUsers.find((u) => u.fullName === label);
        if (!user) return;
        setSelectedUserId(user.id);
        setDialogDate("");
      },
    }),
    [pieBaseOptions, managerPieData, managerTeamUsers]
  );

  const adminManagerPieOptions = useMemo(
    () => ({
      ...pieBaseOptions, // ✅ Uses separate pie base with hover pointer
      onClick: (_evt: any, elements: any[]) => {
        if (!elements?.length || !adminManagerPieData) return;
        const index = elements[0].index;
        const label = adminManagerPieData.labels[index] as string;
        const manager = allManagers.find((m) => m.fullName === label);
        if (!manager) return;
        setSelectedManagerId(manager.id);
        setManagerDialogDate("");
      },
    }),
    [pieBaseOptions, adminManagerPieData, allManagers]
  );

  const managerDialogBarOptions = useMemo(
    () => ({
      ...dialogUserOptions,
      onClick: (_evt: any, elements: any[]) => {
        if (!elements?.length || !selectedManagerUsersBarData) return;
        const element = elements[0];
        const index = element.index;
        const label = selectedManagerUsersBarData.labels[index] as string;
        const user = selectedManagerUsers.find((u) => u.fullName === label);
        if (!user) return;
        setSelectedUserId(user.id);
        setDialogDate("");
      },
    }),
    [dialogUserOptions, selectedManagerUsersBarData, selectedManagerUsers]
  );

  /* ========= RENDER ========= */

  return (
    <section className="card">
      <h2>Dashboard</h2>

      {currentUser.role === "User" && (
        <>
          <h3>Your Daily activity</h3>
          {userLineData && userLineData.labels.length > 0 ? (
            <div className="chart-row">
              <div className="main-chart">

                <MemoChart type="line" data={userLineData} options={userOptions} />
              </div>
              <div className="pie-chart">

                {userTeamPieData && (
                  <MemoChart type="pie" data={userTeamPieData} options={pieBaseOptions} />
                )}
              </div>
            </div>
          ) : (
            <p className="empty-text">No activities yet.</p>
          )}
        </>
      )}

      {currentUser.role === "Manager" && (
        <>
          <h3>Your users' activities</h3>
          {managerBarData && managerBarData.labels.length > 0 ? (
            <div className="chart-row">
              <div className="main-chart">
                <MemoChart
                  type="bar"
                  data={managerBarData}
                  options={managerUserBarOptions}
                />
              </div>
               <div className="pie-chart">

                {managerPieData && (
                  <MemoChart
                    type="pie"
                    data={managerPieData}
                    options={managerPieOptions}
                  />
                )}
              </div>
            </div>
          ) : (
            <p className="empty-text">No users or activities yet.</p>
          )}
        </>
      )}

      {currentUser.role === "Admin" && (
        <>
          <h3>Activities by manager</h3>
          {adminManagerBarData && adminManagerBarData.labels.length > 0 ? (
            <div className="chart-row">
              <div className="main-chart">
                <MemoChart
                  type="bar"
                  data={adminManagerBarData}
                  options={adminManagerBarOptions}
                />
              </div>
               <div className="pie-chart">
                {adminManagerPieData && (
                  <MemoChart
                    type="pie"
                    data={adminManagerPieData}
                    options={adminManagerPieOptions}
                  />
                )}
              </div>
            </div>
          ) : (
            <p className="empty-text">No managers or activities yet.</p>
          )}

        </>
      )}

      {/* Dialog for admin: users of selected manager */}
      <Dialog
        header={
          selectedManager
            ? `Users of ${selectedManager.fullName}`
            : "Manager's Users"
        }
        visible={!!selectedManager}
        modal
        draggable={false}
        style={{ width: "720px", maxWidth: "95vw" }}
        onHide={() => {
          setSelectedManagerId(null);
          setManagerDialogDate("");
        }}
      >
        
        <div className="field" style={{ marginBottom: 12 }}>
          <label style={{ fontSize: "12px"}} >Filter by date</label><br></br>
          <Calendar
            value={fromDateString(managerDialogDate)}
            onChange={(e) =>
              setManagerDialogDate(toLocalDateString(e.value as Date))
            }
            dateFormat="yy-mm-dd"
            placeholder="Select date"
          />
        </div>
        {selectedManagerUsersBarData ? (
          <MemoChart
            type="bar"
            data={selectedManagerUsersBarData}
            options={managerDialogBarOptions}
          />
        ) : (
          <p className="empty-text">No users or activities for this manager.</p>
        )}
      </Dialog>

      {/* Dialog for manager/admin: activities of selected user */}
      <Dialog
        header={
          selectedUser ? `Activities of ${selectedUser.fullName}` : "User Activities"
        }
        visible={selectedUserId != null}
        modal
        draggable={false}
        style={{ width: "720px", maxWidth: "95vw" }}
        onHide={() => {
          setSelectedUserId(null);
          setDialogDate("");
        }}
      >
        <div className="field" style={{ marginBottom: 12 }}>
          <label style={{ fontSize: "12px"}} >Filter by date</label><br></br>
          <Calendar
            value={fromDateString(dialogDate)}
            onChange={(e) =>
              setDialogDate(toLocalDateString(e.value as Date))
            }
            dateFormat="yy-mm-dd"
            placeholder="Select date"
          />
        </div>

        <div
          style={{
            maxHeight: "calc(60vh - 90px)",
            overflowY: "auto",
            paddingRight: 6,
          }}
        >
          {selectedUserActivities
            .filter((a) => !dialogDate || a.date === dialogDate)
            .length === 0 ? (
            <p className="empty-text">No activities for this date.</p>
          ) : (
            <ul className="activity-list">
              {selectedUserActivities
                .filter((a) => !dialogDate || a.date === dialogDate)
                .map((a) => (
                  <li key={a.id} className="activity-item">
                    <div className="muted">
                      <div>
                        <strong>Activity date:</strong>{" "}
                        {new Date(a.date).toLocaleDateString()}
                        {a.updatedAt && " · edited"}
                      </div>
                    </div>
                    <div
                      className="activity-item-body ql-editor"
                      style={{ fontSize: "16px", lineHeight: "1.5" }}
                      dangerouslySetInnerHTML={{ __html: a.text }}
                    />
                  </li>
                ))}
            </ul>
          )}
        </div>
      </Dialog>
    </section>
  );
}
