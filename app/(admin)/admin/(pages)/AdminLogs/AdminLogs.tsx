// "use client";
// import { useState, useEffect, useCallback } from "react";
// import { Search, ScrollText } from "lucide-react";

// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "@/app/components/table";
// import { useToast } from "@/app/context/ToastContext";
// import { supabase } from "@/utils/supabase/supabase_client";
// import { Badge } from "@/app/components/badge";

// interface LogEntry {
//   id: string;
//   event_time: string;
//   schema_name: string;
//   table_name: string;
//   operation: string;
//   row_data: Record<string, any> | null;
//   changed_fields: Record<string, any> | null;
//   actor: string | null;
//   actor_email: string | null;
// }

// const AdminLogs = () => {
//   const [logs, setLogs] = useState<LogEntry[]>([]);
//   const [search, setSearch] = useState("");
//   const { showToast } = useToast();

//   const fetchLogs = useCallback(async () => {
//     const { data, error } = await supabase
//       .from("activity_logs")
//       .select("*")
//       .order("event_time", { ascending: false })
//       .limit(200);
//     if (error) showToast("Error", "error", error.message);
//     else setLogs((data || []) as unknown as LogEntry[]);
//   }, [showToast]);

//   useEffect(() => {
//     fetchLogs();
//   }, [fetchLogs]);

//   const filtered = logs.filter(
//     (l) =>
//       l.operation.toLowerCase().includes(search.toLowerCase()) ||
//       l.table_name.toLowerCase().includes(search.toLowerCase()) ||
//       (l.actor_email &&
//         l.actor_email.toLowerCase().includes(search.toLowerCase())),
//   );

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-foreground">Activity Logs</h1>
//         <p className="text-muted-foreground">{logs.length} log entries</p>
//       </div>

//       <div className="relative max-w-sm">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//         <input
//           placeholder="Search logs..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="pl-9"
//         />
//       </div>

//       <div className="card bg-base-100 shadow-md">
//         <div className="card-bodyp-0">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Timestamp</TableHead>
//                 <TableHead>Operation</TableHead>
//                 <TableHead>Table</TableHead>
//                 <TableHead>Row ID</TableHead>
//                 <TableHead>Actor</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filtered.length === 0 ? (
//                 <TableRow>
//                   <TableCell
//                     colSpan={5}
//                     className="text-center py-8 text-muted-foreground"
//                   >
//                     <ScrollText className="h-8 w-8 mx-auto mb-2" />
//                     No logs found
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filtered.map((log) => (
//                   <TableRow key={log.id}>
//                     <TableCell className="text-muted-foreground text-sm">
//                       {new Date(log.event_time).toLocaleString()}
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant="secondary">{log.operation}</Badge>
//                     </TableCell>
//                     <TableCell className="text-foreground">
//                       {log.table_name}
//                     </TableCell>
//                     <TableCell className="font-mono text-xs text-foreground">
//                       {String(log.row_data?.id || "—").slice(0, 8)}
//                     </TableCell>
//                     <TableCell className="font-mono text-xs text-muted-foreground">
//                       {log.actor_email || log.actor?.slice(0, 8) || "—"}
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminLogs;
"use client";
import { useState, useEffect } from "react";
import { Search, ScrollText, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/app/components/table";
import { useToast } from "@/app/context/ToastContext";
import { supabase } from "@/utils/supabase/supabase_client";
import { Badge } from "@/app/components/badge";

interface LogEntry {
  id: string;
  event_time: string;
  schema_name: string;
  table_name: string;
  operation: string;
  row_data: Record<string, any> | null;
  changed_fields: Record<string, any> | null;
  actor: string | null;
  actor_email: string | null;
}

const AdminLogs = () => {
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  // useQuery handles caching, loading, and error states automatically.
  const {
    data: logs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["activity_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("event_time", { ascending: false })
        .limit(200);

      if (error) throw new Error(error.message);
      return (data || []) as unknown as LogEntry[];
    },
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes to prevent refetching on navigation
  });

  // Display error toast if query fails
  useEffect(() => {
    if (error) {
      showToast("Error", "error", (error as Error).message);
    }
  }, [error, showToast]);

  const filtered = logs.filter(
    (l) =>
      l.operation.toLowerCase().includes(search.toLowerCase()) ||
      l.table_name.toLowerCase().includes(search.toLowerCase()) ||
      (l.actor_email &&
        l.actor_email.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Activity Logs</h1>
        <p className="text-muted-foreground">
          {logs.length} log entries {isLoading && "(Updating...)"}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="card bg-base-100 shadow-md">
        <div className="card-body p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Row ID</TableHead>
                <TableHead>Actor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span>Loading logs...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <ScrollText className="h-8 w-8 mx-auto mb-2" />
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(log.event_time).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{log.operation}</Badge>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {log.table_name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-foreground">
                      {String(log.row_data?.id || "—").slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.actor_email || log.actor?.slice(0, 8) || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
