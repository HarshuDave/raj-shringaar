import { getAuthenticatedCustomer } from "@/lib/auth/customer-session";
import { getOrdersByCustomerId } from "@/lib/data/repository";
import CustomerAccountClient from "@/components/store/CustomerAccountClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Devotional Account & Orders | Raj Shringaar",
  description:
    "Sign in securely with mobile OTP to view your Raj Shringaar order history and sacred receipts.",
};

export default async function AccountPage() {
  const customer = await getAuthenticatedCustomer();
  const orders =
    customer && customer.phoneVerified
      ? await getOrdersByCustomerId(customer.id)
      : [];

  return (
    <div className="bg-ivory py-12 sm:py-16 px-4 sm:px-6 lg:px-12">
      <CustomerAccountClient customer={customer} orders={orders} />
    </div>
  );
}
