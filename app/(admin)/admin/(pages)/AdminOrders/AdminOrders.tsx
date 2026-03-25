"use client";
import { useState, useEffect } from "react";
import { Search, ShoppingCart, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase/supabase_client";
import { useToast } from "@/app/context/ToastContext";
import { useQuery } from "@tanstack/react-query";

interface Order {
  id: string;
  shipping_address: any;
  status: string;
  total_amount: number;
  payment_status: string;
  items: string[];
  notes: string | null;
  created_at: string;
}

const statusOptions = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];
const statusColors: Record<string, string> = {
  pending: "badge-warning",
  processing: "badge-info",
  shipped: "badge-info",
  delivered: "badge-success",
  cancelled: "badge-error",
  refunded: "badge-ghost",
};

const AdminOrders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const { showToast: toast } = useToast();

  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin_orders", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data || []) as unknown as Order[];
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (error) toast("Error", "error", (error as Error).message);
  }, [error, toast]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    if (error) toast("Error", "error", error.message);
    else {
      toast("Status updated", "success");
      refetch();
    }
  };

  const filtered = orders.filter((o) => {
    const searchLower = search.toLowerCase();
    const customerName =
      `${o.shipping_address?.firstName || ""} ${o.shipping_address?.lastName || ""}`.toLowerCase();
    return (
      customerName.includes(searchLower) ||
      (o.shipping_address?.email || "").toLowerCase().includes(searchLower) ||
      (o.id || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">
          {orders.length} total orders {isLoading && "(Updating...)"}
        </p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full pl-9"
          />
        </div>
        <select
          className="select select-bordered w-full max-w-xs"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span>Loading orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
                    <tr key={order.id}>
                      <td className="font-mono text-xs text-foreground">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td>
                        <p className="font-medium text-foreground">
                          {order.shipping_address?.firstName}{" "}
                          {order.shipping_address?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.shipping_address?.email}
                        </p>
                      </td>
                      <td className="text-foreground">
                        ₵{(order.total_amount || 0).toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`badge ${order.payment_status === "success" ? "badge-success" : "badge-warning"}`}
                        >
                          {order.payment_status === "success"
                            ? "Paid"
                            : order.payment_status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="select select-bordered select-sm"
                          value={order.status}
                          onChange={(e) =>
                            updateStatus(order.id, e.target.value)
                          }
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s} className="capitalize">
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-muted-foreground text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <button
                          className="btn btn-ghost rounded-full"
                          onClick={() => setViewOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Dialog */}
      {viewOrder && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg">Order Details</h3>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Order ID</span>
                  <p className="font-mono text-foreground">{viewOrder.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date</span>
                  <p className="text-foreground">
                    {new Date(viewOrder.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Customer</span>
                  <p className="text-foreground">
                    {viewOrder.shipping_address?.firstName}{" "}
                    {viewOrder.shipping_address?.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="text-foreground">
                    {viewOrder.shipping_address?.email}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={`badge ${statusColors[viewOrder.status]} capitalize`}
                  >
                    {viewOrder.status}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment</span>
                  <span
                    className={`badge ${viewOrder.payment_status === "paid" ? "badge-success" : "badge-warning"}`}
                  >
                    {viewOrder.payment_status}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Shipping</span>
                  <p className="text-foreground">
                    {typeof viewOrder.shipping_address === "object" &&
                    viewOrder.shipping_address !== null ? (
                      <>
                        {viewOrder.shipping_address.address}
                        <br />
                        {viewOrder.shipping_address.city},{" "}
                        {viewOrder.shipping_address.state}{" "}
                        {viewOrder.shipping_address.zipCode}
                        <br />
                        {viewOrder.shipping_address.country}
                      </>
                    ) : (
                      viewOrder.shipping_address || "—"
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Total</span>
                  <p className="text-lg font-bold text-foreground">
                    ${(viewOrder.total_amount || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              {viewOrder.notes && (
                <div>
                  <span className="text-sm text-muted-foreground">Notes</span>
                  <p className="text-foreground">{viewOrder.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-action">
              <button className="btn" onClick={() => setViewOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
