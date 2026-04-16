"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ReactNode } from "react";

export type Column<T> = {
  header: string;
  accessor: keyof T;
  cell?: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  /** Stable row key for list updates (defaults to row index). */
  rowKey?: (row: T, index: number) => string | number;
};

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "You don’t have any orders to show.",
  rowKey,
}: DataTableProps<T>) {
  return (
    <div className="rounded-xs border bg-white">
      <Table>
        <TableHeader className="">
          <TableRow className="">
            {columns.map((col, index) => (
              <TableHead
                key={index}
                className="text-xs text-black/80 font-extrabold py-6"
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-6 text-slate-500"
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-sm font-medium text-center py-6 text-black"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow
                key={rowKey ? rowKey(row, rowIndex) : rowIndex}
                className="text-xs"
              >
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex}>
                    {col.cell
                      ? col.cell(row)
                      : (row[col.accessor] as ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
