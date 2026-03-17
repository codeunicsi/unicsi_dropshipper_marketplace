"use client";
import { StoreDropdown } from "@/components/ui/store-dropdown";
import React, { useState } from "react";
import { Column, DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

type ReportData = {
  reportName: string;
  type: string;
  requestedOn: string;
  dateRange: string;
  status: "Pending" | "Completed" | "Failed";
};

const reports: ReportData[] = [
  {
    reportName: "Sales Summary Feb 2026",
    type: "Sales",
    requestedOn: "03 Mar 2026",
    dateRange: "01 Feb 2026 - 28 Feb 2026",
    status: "Completed",
  },
  {
    reportName: "RTO Analysis Jan 2026",
    type: "RTO",
    requestedOn: "02 Mar 2026",
    dateRange: "01 Jan 2026 - 31 Jan 2026",
    status: "Pending",
  },
  {
    reportName: "Payment Report",
    type: "Finance",
    requestedOn: "01 Mar 2026",
    dateRange: "01 Feb 2026 - 28 Feb 2026",
    status: "Failed",
  },
];

const ReportsPage = () => {
  const [store, setStore] = useState("xxncby-gx");

  const columns: Column<ReportData>[] = [
    {
      header: "Report Name",
      accessor: "reportName",
    },
    {
      header: "Type",
      accessor: "type",
    },
    {
      header: "Requested On",
      accessor: "requestedOn",
    },
    {
      header: "Report Date Range",
      accessor: "dateRange",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.status === "Completed"
              ? "bg-green-100 text-green-700"
              : row.status === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "reportName",
      cell: () => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs cursor-pointer hover:bg-gray-100"
          >
            View
          </Button>
          <Button size="sm" className="my-button text-xs cursor-pointer">
            Download
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="mt-2 text-base text-black">
            Find all your requested reports here in one place.
          </p>
        </div>

        <div className="">
          <StoreDropdown
            stores={["xxncby-gx", "demo-store", "Others"]}
            value={store}
            onChange={setStore}
          />
        </div>
      </div>
      <div className="mt-6">
        <DataTable columns={columns} data={reports} />
      </div>
    </div>
  );
};

export default ReportsPage;
