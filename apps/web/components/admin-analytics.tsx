"use client";

import { useMemo, useState } from "react";
import { BarChart3, Boxes, PackageCheck, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import type { Order, Product } from "@/lib/types";

export function AdminAnalytics({ orders, products }: { orders: Order[]; products: Product[] }) {
  const [month, setMonth] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      if (Number.isNaN(orderDate.getTime())) return false;

      if (month) {
        const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`;
        if (orderMonth !== month) return false;
      }

      if (fromDate) {
        const from = new Date(`${fromDate}T00:00:00`);
        if (orderDate < from) return false;
      }

      if (toDate) {
        const to = new Date(`${toDate}T23:59:59`);
        if (orderDate > to) return false;
      }

      return true;
    });
  }, [orders, month, fromDate, toDate]);

  const totalSales = filteredOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const deliveredOrders = filteredOrders.filter((order) => order.status === "delivered").length;
  const activeProducts = products.filter((product) => product.status === "active").length;

  const metrics = [
    {
      label: "Filtered sales",
      value: formatCurrency(totalSales),
      detail: `${filteredOrders.length} matching orders`,
      icon: BarChart3
    },
    {
      label: "Delivered orders",
      value: deliveredOrders,
      detail: "Within selected period",
      icon: PackageCheck
    },
    {
      label: "Active products",
      value: activeProducts,
      detail: `${products.length} total products`,
      icon: Boxes
    },
    {
      label: "Average order",
      value: filteredOrders.length ? formatCurrency(totalSales / filteredOrders.length) : formatCurrency(0),
      detail: "Within selected period",
      icon: ReceiptText
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-white">
        <CardHeader>
          <CardTitle>Sales analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Filter by month</label>
              <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium">From date</label>
              <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-medium">To date</label>
              <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="mt-2" />
            </div>
          </div>
          <button
            type="button"
            className="mt-4 text-sm font-semibold text-orange-700 hover:text-orange-800"
            onClick={() => {
              setMonth("");
              setFromDate("");
              setToDate("");
            }}
          >
            Clear filters
          </button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="border-orange-200 bg-white">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-orange-100 text-orange-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-orange-700">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.detail}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card className="border-orange-200 bg-white">
        <CardHeader>
          <CardTitle>Recent matching orders</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders match the selected filters.</p>
          ) : (
            <div className="grid gap-3">
              {filteredOrders.slice(0, 8).map((order) => (
                <div key={order.id} className="flex flex-col gap-1 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="font-semibold text-orange-700">{formatCurrency(order.total)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
