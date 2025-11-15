import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import api from "@/../middleware/interceptors.ts";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, Play, Package } from "lucide-react";
import StockOverview from "@/components/dashboard/StockOverview";
import TransactionLedger from "@/components/dashboard/TransactionLedger";
import type { Product, Transaction } from "@/types/inventory";

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) navigate("/");

    fetchStockOverview();
    fetchTransactionLedger();
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // ------------------ FETCH STOCK ------------------
  const fetchStockOverview = async () => {
    try {
      const res = await api.get("/inventory/stock");

      const products = res.data?.products || [];
      const batches = res.data?.batches || [];

      const normalizedData = products.map((p: any) => ({
        id: p.product_id,
        name: p.name,
        currentQuantity: Number(p.current_quantity),
        totalInventoryCost: Number(p.total_cost),
        averageCostPerUnit: Number(p.avg_cost),
        batches: batches
          .filter((batch: any) => batch.product_id === p.product_id)
          .map((batch: any) => ({
            quantity: Number(batch.quantity),
            costPerUnit: Number(batch.unit_price),
            purchaseDate: new Date(batch.purchased_at),
          })),
      }));

      setProducts(normalizedData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch stock overview");
    }
  };

  // ------------------ FETCH LEDGER ------------------
  const fetchTransactionLedger = async () => {
    try {
      const res = await api.get("/inventory/ledger");

      const normalized = res.data.map((tx: any) => ({
        id: tx.id,
        productId: tx.product_id,
        type: tx.type || "purchase",
        quantity: Number(tx.quantity),
        costPerUnit: Number(tx.unit_price),
        totalCost: Number(tx.quantity) * Number(tx.unit_price),
        timestamp: new Date(tx.timestamp),
      }));

      setTransactions(normalized);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch transaction ledger");
    }
  };

  // ------------------ SOCKET.IO REALTIME ------------------
  const setupSocket = () => {
    const socket = io(import.meta.env.VITE_ENDPOINT_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () =>
      console.log("Connected to Socket.IO:", socket.id)
    );

    socket.on("ledgerUpdate", (event) => {
      console.log("Real-time ledger event received:", event);

      // -------- NORMALIZE PAYLOAD -------
      const isPurchase = event.type === "purchase";

      const newTx: Transaction = {
        id:
          event.sale_id ||
          event.batch_id ||
          event.event_id ||
          `TXN-${Date.now()}`,
        productId: event.product_id,
        type: isPurchase ? "purchase" : "sale",
        quantity: Number(event.quantity),
        costPerUnit:
          Number(event.unit_price) ||
          Number(event.cogs) / Number(event.quantity) ||
          0,
        totalCost:
          Number(event.unit_price) * Number(event.quantity) ||
          Number(event.cogs) ||
          0,
        timestamp: new Date(
          event.timestamp || event.purchased_at || event.sold_at
        ),
      };

      // -------- UPDATE TRANSACTIONS -------
      setTransactions((prev) => [...prev, newTx]);

      // -------- UPDATE STOCK OVERVIEW -------
      setProducts((prevProducts) =>
        prevProducts.map((p) => {
          if (p.id !== event.product_id) return p;

          const qty = Number(event.quantity);
          const unitPrice = Number(event.unit_price || 0);
          const cogs = Number(event.cogs || 0);

          let newQuantity = p.currentQuantity;
          let newTotalCost = p.totalInventoryCost;

          if (isPurchase) {
            newQuantity += qty;
            newTotalCost += qty * unitPrice;
          } else {
            newQuantity -= qty;
            newTotalCost -= cogs;
          }

          const newAvg =
            newQuantity > 0 ? +(newTotalCost / newQuantity).toFixed(2) : 0;

          const updatedBatches = isPurchase
            ? [
                ...p.batches,
                {
                  quantity: qty,
                  costPerUnit: unitPrice,
                  purchaseDate: new Date(event.timestamp),
                },
              ]
            : p.batches;

          return {
            ...p,
            currentQuantity: newQuantity,
            totalInventoryCost: newTotalCost,
            averageCostPerUnit: newAvg,
            batches: updatedBatches,
          };
        })
      );
    });
  };

  // ------------------ SIMULATE TRANSACTIONS ------------------
  const simulateTransactions = async () => {
    try {
      setIsSimulating(true);
      toast.success("Simulation Started — watch real-time updates!");
      const res = await api.post("/simulateTransactions");

      toast.success("Simulation Ended!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to simulate transactions");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userId");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-2 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">Inventory Manager</p>
              <p className="text-sm text-muted-foreground">Stock Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={simulateTransactions}
              disabled={isSimulating}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              {isSimulating ? "Simulating..." : "Simulate Transactions"}
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2 border">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <StockOverview products={products} />
        <TransactionLedger transactions={transactions} />
      </main>
    </div>
  );
};

export default Dashboard;
