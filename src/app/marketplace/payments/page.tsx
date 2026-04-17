"use client";
import { Button } from "@/components/ui/button";
import { Column, DataTable } from "@/components/ui/data-table";
import { DateDropdown } from "@/components/ui/date-dropdown";
import { IconDropdown } from "@/components/ui/icon-dropdown";

import {
  BadgeIndianRupee,
  Download,
  IndianRupeeIcon,
  Search,
} from "lucide-react";
import { useState } from "react";

type SearchOption = {
  label: string;
  value: string;
};

interface SearchFilterBarProps {
  options?: SearchOption[];
  placeholder?: string;
  onSearch?: (type: string, query: string) => void;
}

type PaymentCycleData = {
  paymentDate: string;
  day: string;
  paymentCycle: string;
  transactionId: string;
  amount: number;
};

const payments: PaymentCycleData[] = [];

const columns: Column<PaymentCycleData>[] = [
  {
    header: "Payment Date",
    accessor: "paymentDate",
  },
  {
    header: "Day",
    accessor: "day",
  },
  {
    header: "Payment Cycle",
    accessor: "paymentCycle",
  },
  {
    header: "Transaction ID",
    accessor: "transactionId",
    cell: (row) => (
      <span className="font-medium text-xs text-blue-600">
        {row.transactionId}
      </span>
    ),
  },
  {
    header: "Amount",
    accessor: "amount",
    cell: (row) => (
      <span className="font-semibold text-green-600">₹{row.amount}</span>
    ),
  },
  {
    header: "Action",
    accessor: "transactionId",
    cell: () => (
      <Button
        size="sm"
        className="text-xs border border-black rounded-none font-semibold"
        variant={"outline"}
      >
        <Download />
        Payment Sheet
      </Button>
    ),
  },
];

const PaymentsPage = ({
  options = [],
  placeholder = "Enter Transaction ID here",
  onSearch,
}: SearchFilterBarProps) => {
  const [searchBy, setSearchBy] = useState("");
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!onSearch) return;
    const selected = options.find((opt) => opt.label === searchBy);
    onSearch(selected?.value || "", query);
  };
  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left */}
        <div>
          <p className="text-sm text-gray-500">Payments /</p>
          <h1 className="text-xl sm:text-2xl font-bold py-1">
            Payment History
          </h1>
        </div>

        {/* Right Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
          {/* Card 1 */}
          <div className="flex items-center gap-3 bg-purple-100 p-3 rounded-sm w-full">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <IndianRupeeIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-bold text-purple-600">₹0</p>
              <p className="text-xs text-black/80">Total payment till date</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-center gap-3 bg-red-100 p-3 rounded-sm w-full">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <IndianRupeeIcon className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-base font-bold text-red-600">₹0</p>
              <p className="text-xs text-black/80">Current outstanding</p>
              <p className="text-xs text-black/80">(As of Today)</p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 my-6">
        {/* Date */}
        <div className="w-full sm:w-auto">
          <label className="text-xs">Payment Date</label>
          <DateDropdown label="--Select--" />
        </div>

        {/* Cycle */}
        <div className="w-full sm:w-auto">
          <label className="text-xs">Payment Cycle</label>
          <IconDropdown
            icon={BadgeIndianRupee}
            label="--Select--"
            className="text-xs font-semibold rounded-sm text-black/80"
            labelClassName="text-xs bg-white"
            items={[
              { label: "Daily", onClick: () => {} },
              { label: "Weekly", onClick: () => {} },
            ]}
          />
        </div>

        {/* Search */}
        <div className="w-full sm:flex-1">
          <label className="text-xs">Search By Transaction ID</label>
          <div className="flex items-center w-full h-9 bg-white border">
            <input
              type="text"
              value={query}
              placeholder={placeholder}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 h-full px-3 text-xs outline-none"
            />
            <button
              onClick={handleSearch}
              className="h-full px-3 bg-black text-white flex items-center justify-center hover:bg-black/80"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="my-6 overflow-x-auto">
        <DataTable
          columns={columns}
          data={payments}
          emptyMessage="You don't have any payment records to show."
        />
      </div>
    </>
  );
};

export default PaymentsPage;
