"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Order, OrderStatus } from "@/lib/types";
import { updateOrderStatusAction } from "@/app/actions/admin-orders";

export default function OrderRow({ order }: { order: Order }) {
  const [status, setStatus] = useState<OrderStatus>(order.orderStatus);
  const [isPending, startTransition] = useTransition();

  const statuses: OrderStatus[] = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const handleStatusChange = (newStatus: OrderStatus) => {
    setStatus(newStatus);
    startTransition(async () => {
      await updateOrderStatusAction(order.id, newStatus);
    });
  };

  return (
    <tr className="hover:bg-ivory/50 transition-colors">
      <td className="py-4 px-4 font-bold text-royal text-xs">
        {order.orderNumber}
      </td>

      <td className="py-4 px-4 text-xs">
        <p className="font-semibold text-royal">{order.customerName}</p>
        <p className="text-[10px] text-royal/60">
          +91 {order.customerPhone} • {order.customerEmail}
        </p>
        <p className="text-[10px] text-royal/50 mt-0.5 truncate max-w-xs">
          {order.shippingAddress.city}, {order.shippingAddress.state} –{" "}
          {order.shippingAddress.pincode}
        </p>
      </td>

      <td className="py-4 px-4 text-xs">
        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <div className="relative h-6 w-6 shrink-0 overflow-hidden bg-royal/10 border border-gold/20">
                <Image
                  src={item.image || "/products/premium-poshak.png"}
                  alt={item.productName}
                  fill
                  className="object-cover"
                  sizes="24px"
                />
              </div>
              <span className="truncate max-w-[150px] font-medium text-royal">
                {item.productName}
              </span>
              <span className="text-[10px] text-royal/60">
                {item.size ? `(Sz ${item.size})` : ""} × {item.quantity}
              </span>
            </div>
          ))}
        </div>
      </td>

      <td className="py-4 px-4 font-semibold text-royal text-xs">
        ₹{order.totalAmount.toLocaleString("en-IN")}
      </td>

      <td className="py-4 px-4 text-xs">
        <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800">
          {order.paymentStatus}
        </span>
      </td>

      <td className="py-4 px-4 text-xs">
        <select
          value={status}
          disabled={isPending}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          className={`h-8 px-2 text-xs border font-semibold outline-none transition-colors ${
            status === "Delivered"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : status === "Shipped"
              ? "bg-blue-50 border-blue-300 text-blue-800"
              : status === "Cancelled"
              ? "bg-red-50 border-red-300 text-red-800"
              : "bg-amber-50 border-amber-300 text-amber-800"
          }`}
        >
          {statuses.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </td>

      <td className="py-4 px-4 text-[11px] text-royal/60">
        {new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </td>
    </tr>
  );
}
