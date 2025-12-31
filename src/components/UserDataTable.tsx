import React, { forwardRef, useImperativeHandle } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import type { UserItem } from "../config";
import type { DataTableFilterMeta } from "primereact/datatable";

type Props = {
  value: any[];
  rows: number;
  rowClassName: (data: any) => string;
  filters: DataTableFilterMeta;
  setFilters: React.Dispatch<React.SetStateAction<DataTableFilterMeta>>;
  nameHeader: string;
  showGender?: boolean;
  showDob?: boolean;
  showManagerName?: boolean;
  showTeamSize?: boolean;
  actionsTemplate: (rowData: UserItem) => React.ReactNode;
  nameBody: (rowData: UserItem) => React.ReactNode;
  isMobile?: boolean;
};

const UserDataTable = forwardRef<any, Props>((props, ref) => {
  const {
    value,
    rows,
    rowClassName,
    filters,
    setFilters,
    nameHeader,
    showGender = false,
    showDob = false,
    showManagerName = false,
    showTeamSize = false,
    actionsTemplate,
    nameBody,
    isMobile = false
  } = props;

  useImperativeHandle(ref, () => ({
    openNew: () => {},
    openNewAdmin: () => {},
    openEdit: () => {}
  }));

 /* ------------------- 📱 MOBILE VIEW ------------------- */
if (isMobile) {
  return (
    <div className="mobile-table-wrapper">

      {value.map((row: any) => (
        <div key={row.id} className="mobile-card">

          {/* HEADER = NAME */}
          <div className="mobile-card-header">
            {nameBody(row)}
          </div>

          <div className="mobile-card-body">

            {showTeamSize && (
              <div className="mobile-row">
                <span className="label">Team Size</span>
                <span className="value">{row.teamSize ?? "-"}</span>
              </div>
            )}

            {showManagerName && (
              <div className="mobile-row">
                <span className="label">Manager</span>
                <span className="value">{row.managerName ?? "-"}</span>
              </div>
            )}

            <div className="mobile-row">
              <span className="label">Email</span>
              <span className="value">{row.email}</span>
            </div>

          </div>

          {/* FOOTER = ACTIONS */}
          <div className="mobile-card-footer">
            <div className="actions-inline">
              {actionsTemplate(row)}
            </div>
          </div>

        </div>
      ))}

    </div>
  );
}


  /* ------------------- 🖥 DESKTOP VIEW (UNCHANGED) ------------------- */

  return (
    <DataTable
    
      value={value}
      paginator
      rows={rows}
      dataKey="id"
      responsiveLayout="scroll"
      rowClassName={rowClassName}
      filters={filters}
      filterDisplay="row"
      onFilter={(e) => setFilters(e.filters)}
      
    >
      <Column field="fullName" header={nameHeader} body={nameBody} filter sortable />
      <Column field="email" header="Email" filter sortable />
      <Column field="phone" header="Phone" filter sortable />
      {showGender && <Column field="gender" header="Gender" sortable />}
      <Column field="country" header="Country" sortable />
      {showDob && <Column field="dob" header="DOB" sortable />}
      {showTeamSize && <Column field="teamSize" header="Team Size" sortable />}
      {showManagerName && <Column field="managerName" header="Manager" sortable />}
      <Column body={actionsTemplate} header="Actions" />
    </DataTable>
  );
});

UserDataTable.displayName = "UserDataTable";

export default UserDataTable;
