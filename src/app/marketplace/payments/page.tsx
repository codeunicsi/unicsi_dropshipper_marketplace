"use client";
import { Button } from "@/components/ui/button";
import { Column, DataTable } from "@/components/ui/data-table";
import { DateDropdown } from "@/components/ui/date-dropdown";
import { IconDropdown } from "@/components/ui/icon-dropdown";
import SearchFilterBar from "@/components/ui/search-bar-icon";
import {
  BadgeIndianRupee,
  Download,
  IndianRupeeIcon,
  Search,
} from "lucide-react";
import React, { useState } from "react";

type SearchOption = {
  label: string;
  value: string;
};

interface SearchFilterBarProps {
  options: SearchOption[];
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

const payments: PaymentCycleData[] = [
  {
    paymentDate: "05 Mar 2026",
    day: "Thursday",
    paymentCycle: "Weekly",
    transactionId: "TXN987654321",
    amount: 5400,
  },
  {
    paymentDate: "10 Mar 2026",
    day: "Tuesday",
    paymentCycle: "Daily",
    transactionId: "TXN123456789",
    amount: 3200,
  },
];

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
  options,
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
      <div className="flex justify-between">
        <div>
          <p className="text-base text-gray-500">Payments /</p>
          <h1 className="text-2xl text-black font-bold py-1">
            Payment History
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-60 h-24 flex gap-2 bg-purple-100 rounded-sm">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-3 my-2">
              <IndianRupeeIcon className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-purple-600 my-3">
              ₹4,66,889
              <p className="text-xs text-black/90 my-1">
                Total payment till date
              </p>
              <p className="text-xs text-black/90 font-medium my-1">
                (Since 08 Feb 2023)
              </p>
            </span>
          </div>
          <div className="w-60 h-24 bg-red-100 rounded-sm flex">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-3 my-2">
              <IndianRupeeIcon className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-lg font-bold text-red-600 my-3">
              ₹0
              <p className="text-xs text-black/90 my-1">Current outstanding</p>
              <p className="text-xs text-black/90 font-medium my-1">
                (As of Today)
              </p>
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-3 my-6">
        <div>
          <label className="text-xs">Payment Date</label>
          <DateDropdown label="--Select--" />
        </div>
        <div>
          <label className="text-xs">Payment Cycle</label>
          <IconDropdown
            icon={BadgeIndianRupee}
            label="--Select--"
            className="text-xs font-semibold rounded-sm text-black/80 "
            labelClassName="text-xs bg-white"
            items={[
              {
                label: "Daily",
                onClick: () => console.log("Option 1 clicked"),
              },
              {
                label: "Weekly",
                onClick: () => console.log("Option 2 clicked"),
              },
            ]}
          />
        </div>
        <div>
          <label className="text-xs">Search By Transaction ID</label>
          <div className="flex items-center w-2/3 h-8 border-y bg-white">
            {" "}
            {/* Input */}
            <input
              type="text"
              value={query}
              placeholder={placeholder}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 h-8 px-3 text-xs outline-none border"
            />
            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="h-8 px-2 bg-black text-white flex items-center rounded-xs rounded-r-sm justify-center hover:bg-black/80 transition"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="my-6">
        <DataTable columns={columns} data={payments} />
      </div>
    </>
  );
};

export default PaymentsPage;
