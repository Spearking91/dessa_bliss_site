"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/supabase_client";
import { useAuth } from "@/app/auth/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import {
  Loader2,
  Package,
  Receipt,
  ShoppingBag,
  CheckCircle2,
  Truck,
  Box,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
  shipping_address: any;
  payment_reference?: string;
}

const statusSteps = ["pending", "processing", "shipped", "delivered"];

const MyOrdersPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      try {
        // We filter by the email stored in the shipping_address JSON column
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("shipping_address->>email", user.email)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error: any) {
        showToast("Error", "error", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, showToast]);

  const getStepIndex = (status: string) => {
    return statusSteps.indexOf(status.toLowerCase());
  };

  if (loading) {
    return (
      <div className="container min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Fetching your order history...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-base-100 shadow-2xl p-8 rounded-3xl max-w-md w-full border border-base-200">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-primary opacity-20" />
          <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
          <p className="text-base-content/60 mb-8">
            Sign in to track your order progress and view your purchase history.
          </p>
          <Link href="/auth" className="btn btn-primary btn-wide rounded-full">
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 min-h-screen py-8 md:py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-base-content tracking-tight">
              Order Progress
            </h1>
            <p className="text-base-content/60">
              Follow the journey of your purchases
            </p>
          </div>
          <Link
            href="/"
            className="btn btn-ghost btn-sm rounded-full bg-base-100 shadow-sm"
          >
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="card bg-base-100 shadow-xl p-12 text-center items-center rounded-3xl">
            <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-base-content/30" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No orders found</h2>
            <p className="text-base-content/60 mb-8 max-w-xs">
              It looks like you haven't placed any orders yet. Start exploring
              our products!
            </p>
            <Link href="/" className="btn btn-primary rounded-full px-8">
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentIdx = getStepIndex(order.status);
              const isCancelled = ["cancelled", "refunded"].includes(
                order.status.toLowerCase(),
              );

              return (
                <div
                  key={order.id}
                  className="card bg-base-100 shadow-xl overflow-hidden border border-base-300 rounded-3xl"
                >
                  {/* Order Summary Header */}
                  <div className="bg-base-200/50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-base-300">
                    <div className="flex gap-8">
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-base-content/40">
                          Order Date
                        </p>
                        <p className="text-sm font-bold">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-base-content/40">
                          Total Paid
                        </p>
                        <p className="text-sm font-bold text-primary">
                          GH₵{order.total_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black tracking-widest text-base-content/40">
                        Order #
                      </p>
                      <p className="text-xs font-mono font-bold bg-base-300/50 px-2 py-1 rounded">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Order Progress Body */}
                  <div className="p-6">
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Journey Status</h3>
                        <span
                          className={`badge ${order.payment_status === "success" ? "badge-success" : "badge-warning"} badge-md font-bold text-[10px]`}
                        >
                          {order.payment_status === "success"
                            ? "PAYMENT VERIFIED"
                            : order.payment_status?.toUpperCase()}
                        </span>
                      </div>

                      {isCancelled ? (
                        <div className="alert alert-error bg-error/5 border-error/20 text-error rounded-2xl">
                          <p className="font-bold">
                            This order has been {order.status}.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-base-200/30 p-5 rounded-2xl border border-base-300/50">
                          <div className="breadcrumbs text-xs sm:text-sm">
                            <ul>
                              {statusSteps.map((step, idx) => {
                                const active = idx <= currentIdx;
                                return (
                                  <li
                                    key={step}
                                    className={
                                      active
                                        ? "text-primary font-bold"
                                        : "text-base-content/30"
                                    }
                                  >
                                    <span className="flex items-center gap-2">
                                      {active ? (
                                        <CheckCircle2 size={16} />
                                      ) : (
                                        <Clock
                                          size={16}
                                          className="opacity-50"
                                        />
                                      )}
                                      {step.charAt(0).toUpperCase() +
                                        step.slice(1)}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-base-200">
                      <p className="text-xs text-base-content/50 italic font-medium">
                        {order.status === "delivered"
                          ? "Your order has arrived! Thank you for choosing Dessa Bliss."
                          : "We are carefully preparing your items for delivery."}
                      </p>
                      <Link
                        href={`/order-confirmation?ref=${encodeURIComponent(order.payment_reference!)}`}
                        className="btn btn-outline btn-sm gap-2 rounded-full w-full sm:w-auto px-6"
                      >
                        <Receipt size={16} />
                        Re-access Receipt
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
