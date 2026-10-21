"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

interface FinancialSummary {
  totalNetworkGmv: number;
  totalPlatformRevenue: number;
  bookingCommission: number;
  partsGrossRevenue: number;
  workshopSettlements: number;
  completedRepairsCount: number;
  totalBookingsCount: number;
  paidOrdersCount: number;
  activeWorkshopsCount: number;
}

interface SettlementItem {
  id: string;
  bookingId: string;
  workshopName: string;
  customerName: string;
  serviceType: string;
  gross: number;
  fee: number;
  netPayout: number;
  date: string;
  status: string;
}

interface PayoutRequestItem {
  id: string;
  amount: number;
  method: string;
  status: string;
  note?: string | null;
  createdAt: string;
  processedAt?: string | null;
  provider: { businessName: string; address?: string | null; user?: { name?: string | null } };
}

const PAYOUT_TABS = [
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "PAID", label: "Paid" },
  { key: "REJECTED", label: "Rejected" },
] as const;

export default function FinancialsPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequestItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [payoutStatus, setPayoutStatus] = useState<string>("PENDING");
  const [actingPayoutId, setActingPayoutId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchFinancials = useCallback(async () => {
    try {
      const res = await api.get("/admin/financials");
      setSummary(res.data.summary);
      setSettlements(res.data.recentSettlements || []);
    } catch (err) {
      console.error("Error fetching financials:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const fetchPayouts = useCallback(async () => {
    try {
      const res = await api.get("/admin/payouts", {
        params: { status: payoutStatus, page: 1, limit: 50 },
      });
      setPayouts(res.data.payouts || []);
      if (payoutStatus === "PENDING") setPendingCount(res.data.pendingCount ?? 0);
      else if (payoutStatus === "all") setPendingCount(res.data.pendingCount ?? 0);
    } catch (err) {
      console.error("Error fetching payout requests:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [payoutStatus]);

  useEffect(() => {
    fetchFinancials();
    fetchPayouts();
  }, [fetchFinancials, fetchPayouts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFinancials();
    fetchPayouts();
  };

  const handlePayoutAction = async (payoutId: string, action: "approve" | "reject" | "mark_paid") => {
    setActingPayoutId(payoutId);
    try {
      await api.patch(`/admin/payouts/${payoutId}`, { action });
      showToast(
        action === "approve"
          ? "Payout request approved — queued for KHQR disbursement"
          : action === "reject"
          ? "Payout request rejected — amount returned to workshop balance"
          : "Payout marked as paid"
      );
      fetchPayouts();
      fetchFinancials();
    } catch (err) {
      console.error("Error processing payout:", err);
      showToast("Could not process payout request");
    } finally {
      setActingPayoutId(null);
    }
  };

  const handleExportReport = () => {
    const rows = [
      ["Settlement #", "Workshop", "Customer", "Service", "Gross", "Fee", "Net", "Date", "Status"],
      ...filteredSettlements.map((s) => [
        s.id,
        s.workshopName,
        s.customerName,
        s.serviceType,
        s.gross.toFixed(2),
        s.fee.toFixed(2),
        s.netPayout.toFixed(2),
        new Date(s.date).toISOString().slice(0, 10),
        s.status,
      ]),
      [],
      ["Payout #"],
      ["Payout Request", "Workshop", "Method", "Amount", "Status", "Requested", "Processed"],
      ...payouts.map((p) => [
        p.id,
        p.provider?.businessName || "",
        p.method,
        p.amount.toFixed(2),
        p.status,
        new Date(p.createdAt).toISOString().slice(0, 10),
        p.processedAt ? new Date(p.processedAt).toISOString().slice(0, 10) : "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `techtune-financial-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Financial Statement exported to CSV successfully");
  };

  const filteredSettlements = settlements.filter(
    (s) =>
      s.workshopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-xs font-mono">Calculating network revenue &amp; settlement ledgers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Notification Toast ────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Header & Sync ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Platform Revenue &amp; Settlements Hub</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Network GMV accounting, 10% workshop booking commission tracking, auto parts revenue, and partner bank payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>{refreshing ? "Calculating..." : "Sync Revenue"}</span>
          </button>

          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-2xs cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV Statement</span>
          </button>
        </div>
      </div>

      {/* ─── 4 Standard KPI Overview Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Network GMV</p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
            ${summary?.totalNetworkGmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total repair dispatches + parts shop GMV</p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Retained Revenue</p>
          <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            ${summary?.totalPlatformRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">10% network commission + parts margins</p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workshop Payouts Settled</p>
          <p className="text-2xl font-black text-blue-600 mt-1 font-mono">
            ${summary?.workshopSettlements.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">90% net disbursed to partner garages</p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Commercial Transactions</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {(summary?.completedRepairsCount || 0) + (summary?.paidOrdersCount || 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {summary?.completedRepairsCount || 0} repairs &bull; {summary?.paidOrdersCount || 0} orders
          </p>
        </div>
      </div>

      {/* ─── Platform Economic Framework & Breakdown ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded p-5 shadow-2xs space-y-2">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            10% Workshop Take-Rate
          </h3>
          <p className="text-2xl font-black text-indigo-700 font-mono">
            ${summary?.bookingCommission.toFixed(2) || "0.00"}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            TechTune deducts an automated 10% network commission on all completed and verified roadside &amp; bay repair tickets.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-5 shadow-2xs space-y-2">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Auto Parts E-Commerce Gross
          </h3>
          <p className="text-2xl font-black text-slate-900 font-mono">
            ${summary?.partsGrossRevenue.toFixed(2) || "0.00"}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Direct parts purchases made by motorists for scheduled maintenance, batteries, lubricants, and brake pads.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded p-5 shadow-2xs space-y-2">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Cambodia Bakong / KHQR Ready
          </h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              100% INSTANT SETTLEMENT
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All workshop disbursements support automated settlement to ABA Bank, Wing Bank, and ACLEDA Bank accounts.
          </p>
        </div>
      </div>

      {/* ─── Workshop Withdrawal Requests (real payout approvals) ─────────── */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Workshop Withdrawal Requests
              {pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold align-middle">
                  {pendingCount} AWAITING REVIEW
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Approve, reject, or mark KHQR disbursements as paid. Rejected amounts return to the workshop&apos;s balance.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded bg-slate-100">
            {PAYOUT_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setPayoutStatus(t.key)}
                className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                  payoutStatus === t.key
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3">Request #</th>
                <th className="px-5 py-3">Workshop</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Requested</th>
                <th className="px-5 py-3">Note</th>
                <th className="px-5 py-3 text-right">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                    No withdrawal requests in this state.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      PO-{p.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{p.provider?.businessName || "Unknown"}</p>
                      <p className="text-slate-400 text-[11px]">{p.provider?.address || "Phnom Penh"}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                        {p.method}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 max-w-[180px] truncate">
                      {p.note || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          p.status === "PENDING"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : p.status === "APPROVED"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : p.status === "PAID"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {actingPayoutId === p.id ? (
                        <span className="text-slate-400 text-[11px]">Working…</span>
                      ) : p.status === "PENDING" ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handlePayoutAction(p.id, "approve")}
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 transition cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handlePayoutAction(p.id, "reject")}
                            className="px-2.5 py-1 rounded bg-white border border-rose-300 text-rose-700 text-[10px] font-bold hover:bg-rose-50 transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : p.status === "APPROVED" ? (
                        <button
                          onClick={() => handlePayoutAction(p.id, "mark_paid")}
                          className="px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 transition cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Itemized Settlement Ledger Table ───────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Settlement Ledger &amp; Platform Commission Deductions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Itemized transaction records for completed roadside dispatches</p>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workshop, customer, service..."
              className="w-full sm:w-64 px-3 py-1.5 pl-8 rounded text-xs border border-slate-300 focus:outline-none focus:border-slate-900 bg-white"
            />
            <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3">Settlement #</th>
                <th className="px-5 py-3">Workshop Facility</th>
                <th className="px-5 py-3">Customer &amp; Service</th>
                <th className="px-5 py-3">Gross Ticket</th>
                <th className="px-5 py-3">10% Platform Fee</th>
                <th className="px-5 py-3">Net Disbursed</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredSettlements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    No settlement records match your search query.
                  </td>
                </tr>
              ) : (
                filteredSettlements.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.id}
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{item.workshopName}</p>
                      <p className="text-slate-400 text-[11px]">Phnom Penh Partner</p>
                    </td>

                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="font-medium text-slate-900">{item.serviceType}</p>
                      <p className="text-slate-500 text-[11px]">{item.customerName}</p>
                    </td>

                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      ${item.gross.toFixed(2)}
                    </td>

                    <td className="px-5 py-3.5 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      +${item.fee.toFixed(2)}
                    </td>

                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-700 whitespace-nowrap">
                      ${item.netPayout.toFixed(2)}
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 font-mono whitespace-nowrap">
                      {new Date(item.date).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
