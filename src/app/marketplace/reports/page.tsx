"use client";

import { useMemo, useState } from "react";
import { Column, DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateDropshipperReport,
  useDropshipperReportsList,
  type DropshipperReport,
  formatReportStatus,
  reportTypeLabel,
} from "@/hooks/useDropshipperReports";

function defaultDateRangeStrings() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 29);
  const ymd = (d: Date) => d.toISOString().slice(0, 10);
  return { from: ymd(from), to: ymd(to) };
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

const statusClass: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

const ReportsPage = () => {
  const defaults = useMemo(() => defaultDateRangeStrings(), []);
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [reportName, setReportName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [viewReport, setViewReport] = useState<DropshipperReport | null>(null);

  const { data: reports = [], isLoading, isError, error } =
    useDropshipperReportsList();
  const createMutation = useCreateDropshipperReport();

  const handleGenerate = async () => {
    setFormError(null);
    if (!from || !to) {
      setFormError("Choose a start and end date.");
      return;
    }
    if (from > to) {
      setFormError("Start date must be on or before end date.");
      return;
    }
    try {
      await createMutation.mutateAsync({
        from,
        to,
        ...(reportName.trim() ? { report_name: reportName.trim() } : {}),
      });
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to create report");
    }
  };

  const columns: Column<DropshipperReport>[] = [
    {
      header: "Report Name",
      accessor: "report_name",
    },
    {
      header: "Type",
      accessor: "type",
      cell: (row) => (
        <span className="text-black/80">{reportTypeLabel(row.type)}</span>
      ),
    },
    {
      header: "Requested On",
      accessor: "requested_on",
      cell: (row) => (
        <span className="whitespace-nowrap">{formatDateTime(row.requested_on)}</span>
      ),
    },
    {
      header: "Report Date Range",
      accessor: "start_date",
      cell: (row) => (
        <span className="whitespace-nowrap">
          {row.start_date} → {row.end_date}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusClass[row.status] ?? "bg-gray-100 text-gray-700"
          }`}
        >
          {formatReportStatus(row.status)}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "id",
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs cursor-pointer hover:bg-gray-100"
            onClick={() => setViewReport(row)}
          >
            View
          </Button>
          <Button
            type="button"
            size="sm"
            className="my-button text-xs cursor-pointer"
            disabled={
              row.status !== "completed" || !row.download_url?.length
            }
            onClick={() => {
              if (row.download_url) window.open(row.download_url, "_blank", "noopener,noreferrer");
            }}
          >
            Download
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="mt-2 text-base text-black">
          Find all your requested reports here in one place.
        </p>
      </div>

      <div className="mt-8 rounded-xs border bg-white p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-black">Generate report</h2>
        <p className="mt-1 text-xs text-black/70">
          Exports bulk order analytics for the selected range (same data as the
          orders dashboard). CSV is generated immediately.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="report-from">From</Label>
            <Input
              id="report-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-to">To</Label>
            <Input
              id="report-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2 lg:col-span-2">
            <Label htmlFor="report-name">Report name (optional)</Label>
            <Input
              id="report-name"
              placeholder="e.g. January bulk orders"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>
        </div>
        {formError ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {formError}
          </p>
        ) : null}
        <div className="mt-4">
          <Button
            type="button"
            className="my-button"
            disabled={createMutation.isPending}
            onClick={handleGenerate}
          >
            {createMutation.isPending ? "Generating…" : "Generate CSV report"}
          </Button>
        </div>
      </div>

      {isError ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error instanceof Error ? error.message : "Failed to load reports."}
        </p>
      ) : null}

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={reports}
          loading={isLoading}
          rowKey={(row) => row.id}
          emptyMessage="You don't have any reports to show."
        />
      </div>

      <Dialog open={!!viewReport} onOpenChange={(open) => !open && setViewReport(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Report details</DialogTitle>
          </DialogHeader>
          {viewReport ? (
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-black/60">Name</dt>
                <dd className="font-medium text-black">{viewReport.report_name}</dd>
              </div>
              <div>
                <dt className="text-black/60">Type</dt>
                <dd>{reportTypeLabel(viewReport.type)}</dd>
              </div>
              <div>
                <dt className="text-black/60">Date range</dt>
                <dd>
                  {viewReport.start_date} → {viewReport.end_date}
                </dd>
              </div>
              <div>
                <dt className="text-black/60">Status</dt>
                <dd>{formatReportStatus(viewReport.status)}</dd>
              </div>
              <div>
                <dt className="text-black/60">Format</dt>
                <dd className="uppercase">{viewReport.file_format}</dd>
              </div>
              <div>
                <dt className="text-black/60">Requested</dt>
                <dd>{formatDateTime(viewReport.requested_on)}</dd>
              </div>
              <div>
                <dt className="text-black/60">Generated</dt>
                <dd>{formatDateTime(viewReport.generated_at)}</dd>
              </div>
              {viewReport.file_size != null ? (
                <div>
                  <dt className="text-black/60">File size</dt>
                  <dd>
                    {viewReport.file_size < 1024
                      ? `${viewReport.file_size} B`
                      : `${(viewReport.file_size / 1024).toFixed(1)} KB`}
                  </dd>
                </div>
              ) : null}
              {viewReport.row_count != null ? (
                <div>
                  <dt className="text-black/60">Rows (approx.)</dt>
                  <dd>{viewReport.row_count}</dd>
                </div>
              ) : null}
              {viewReport.download_url ? (
                <div>
                  <dt className="text-black/60">Download</dt>
                  <dd>
                    <a
                      href={viewReport.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline break-all"
                    >
                      Open file
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsPage;
