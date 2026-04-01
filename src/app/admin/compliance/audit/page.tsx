"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Loading from "./loading";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground">
          Complete system activity and change tracking
        </p>
      </div>

      <Card>
        <CardContent className="flex gap-4 pt-6">
          <div className="flex-1 flex items-center gap-2 bg-input px-3 py-2 rounded-lg">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search logs..."
              className="bg-transparent flex-1 outline-none text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">847K</p>
              <p className="text-sm text-muted-foreground">Total Logs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">234K</p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">18</p>
              <p className="text-sm text-muted-foreground">Admin Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">100%</p>
              <p className="text-sm text-muted-foreground">Retention Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<Loading />}>
        <Card className="p-6">
          <div className="text-center py-12 text-muted-foreground">
            <p>No audit logs yet</p>
          </div>
        </Card>
      </Suspense>
    </div>
  );
}
