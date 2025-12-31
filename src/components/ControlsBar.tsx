import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import type { UserItem } from "../config";
import "../index.css";

type Props = {
  currentUser?: UserItem | null;
  managers: UserItem[];
  activeTab: string;
  setActiveTab: (t: string) => void;
  managerFilter: number | "all" | "unassigned";
  setManagerFilter: (v: number | "all" | "unassigned") => void;
  pageRef: any;
  
};

export default function ControlsBar({
  currentUser,
  managers,
  activeTab,
  setActiveTab,
  managerFilter,
  setManagerFilter,
  pageRef,
}: Props) {
  const isMobile = window.innerWidth <= 768;
  
  const tabKeys =
    currentUser?.role === "Admin"
      ? ["admins", "managers", "users"]
      : currentUser?.role === "Manager"
      ? ["managers", "users"]
      : [];

  // 🔒 SAFETY FIX (IMPORTANT)
  if (tabKeys.length && !tabKeys.includes(activeTab)) {
    setActiveTab(tabKeys[0]);
  }

  const activeIndex = Math.max(0, tabKeys.indexOf(activeTab));

  const handleTabChange = (index: number) => {
    const key = tabKeys[index] ?? tabKeys[0];
    setActiveTab(key);
    if (key === "users") setManagerFilter("all");
  };

  const getTabHeader = (key: string) => {
    if (key === "admins") return "Admins";
    if (key === "managers") return "Managers";
    return "Users";
  };
return (
  <div className={`controls-bar ${isMobile ? "mobile" : "desktop"}`}>
    {isMobile ? (
      <>
        {/* ROW: Tabs + Add User */}
        <div className="mobile-top-row">

          <div className="mobile-tabs-wrap">
            <TabView
              activeIndex={activeIndex}
              onTabChange={(e) => handleTabChange(e.index)}
              className="mobile-tabs p-tabview-custom"
              renderActiveOnly
            >
              {tabKeys.map((k) => (
                <TabPanel key={k} header={getTabHeader(k)} />
              ))}
            </TabView>
          </div>

          {(currentUser?.role === "Admin" ||
            currentUser?.role === "Manager") && (
            <Button
              icon="pi pi-user-plus"
              onClick={() =>
                pageRef.current?.openNewAdmin?.() ||
                pageRef.current?.openNew?.()
              }
              className="mobile-add-btn"
            />
          )}
        </div>

        {/* DROPDOWN BELOW (IF NEEDED) */}
        {currentUser?.role === "Admin" && activeTab === "users" && (
          <Dropdown
            value={managerFilter}
            options={[
              { label: "All managers users", value: "all" },
              ...managers.map((m) => ({
                label: m.fullName,
                value: m.id,
              })),
            ]}
            onChange={(e) => setManagerFilter(e.value)}
            placeholder="Filter manager"
            className="mobile-manager-filter"
          />
        )}
      </>
    ) : (
      <>
        <div className="controls-tabs">
          <TabView
            activeIndex={activeIndex}
            onTabChange={(e) => handleTabChange(e.index)}
            className="tabs p-tabview-custom"
            renderActiveOnly
          >
            {tabKeys.map((k) => (
              <TabPanel key={k} header={getTabHeader(k)} />
            ))}
          </TabView>
        </div>

        <div className="controls-actions">
          {currentUser?.role === "Admin" && activeTab === "users" && (
            <Dropdown
              value={managerFilter}
              options={[
                { label: "All managers users", value: "all" },
                ...managers.map((m) => ({
                  label: m.fullName,
                  value: m.id,
                })),
              ]}
              onChange={(e) => setManagerFilter(e.value)}
              placeholder="Filter by manager"
              className="manager-filter-dropdown"
            />
          )}

          {(currentUser?.role === "Admin" ||
            currentUser?.role === "Manager") && (
            <Button
              icon="pi pi-user-plus"
              onClick={() =>
                pageRef.current?.openNewAdmin?.() ||
                pageRef.current?.openNew?.()
              }
              className="add-user-btn"
            />
          )}
        </div>
      </>
    )}
  </div>
);

}
