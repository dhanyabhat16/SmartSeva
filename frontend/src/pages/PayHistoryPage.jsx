import React, { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import { toast } from "react-hot-toast";

const PayHistoryPage = () => {
  const { payHist, payments, earn } = useAdminStore();
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [days]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      await payHist({ days });
    } catch (error) {
      toast.error("Failed to fetch payment history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto bg-card rounded-2xl shadow-lg border border-border p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-semibold text-primary mb-3 sm:mb-0">Payment History</h1>

          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
                <option value="1">1 days</option>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
              <option value="15">15 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="100">100 days</option>
              <option value="365">365 days</option>
            </select>

            <button
              onClick={fetchHistory}
              disabled={loading}
              className="bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:opacity-90 transition"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
          <p className="text-sm text-muted-foreground">
            Showing payments for last <span className="font-semibold">{days}</span> days
          </p>
          <p className="text-lg font-semibold text-primary">
            Total Earnings: ₹{earn ? parseFloat(earn).toFixed(2) : "0.00"}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Amount (₹)</th>
                <th className="px-4 py-3 text-left">Method</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments && payments.length > 0 ? (
                payments.map((p, index) => (
                  <tr
                    key={index}
                    className="border-t border-border hover:bg-muted/50 transition"
                  >
                    <td className="px-4 py-3 font-medium">{p.amount}</td>
                    <td className="px-4 py-3">{p.payment_method}</td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        p.status === "completed"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {p.status}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(p.payment_date).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayHistoryPage;
