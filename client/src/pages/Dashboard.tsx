import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Play, Package} from "lucide-react";
import type{ Transaction, Product } from "@/types/inventory";

import StockOverview from "@/components/dashboard/StockOverview";
import TransactionLedger from "@/components/dashboard/TransactionLedger";

const Dashboard = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated");
        if (!isAuthenticated) {
        navigate("/");
        }

        // Initialize with some sample data
        initializeData();
    }, [navigate]);


    const initializeData = () => {
        const initialProducts: Product[] = 
        [
            {
                id: "PROD-1",
                name: "Widget A",
                currentQuantity: 100,
                totalInventoryCost: 5000,
                averageCostPerUnit: 50,
                batches: [
                { quantity: 60, costPerUnit: 48, purchaseDate: new Date("2024-01-15") },
                { quantity: 40, costPerUnit: 52, purchaseDate: new Date("2024-02-01") }
                ]
            },
            {
                id: "PROD-2",
                name: "Gadget B",
                currentQuantity: 75,
                totalInventoryCost: 3750,
                averageCostPerUnit: 50,
                batches: [
                { quantity: 75, costPerUnit: 50, purchaseDate: new Date("2024-01-20") }
                ]
            },
            {
                id: "PROD-3",
                name: "Component C",
                currentQuantity: 120,
                totalInventoryCost: 4800,
                averageCostPerUnit: 40,
                batches: [
                { quantity: 50, costPerUnit: 38, purchaseDate: new Date("2024-01-10") },
                { quantity: 70, costPerUnit: 42, purchaseDate: new Date("2024-02-15") }
                ]
            }
        ];

        const initialTransactions: Transaction[] = [
            {
                id: "TXN-1",
                productId: "1",
                productName: "Widget A",
                type: "purchase",
                quantity: 100,
                costPerUnit: 50,
                totalCost: 5000,
                timestamp: new Date("2024-01-15"),
            },
            {
                id: "TXN-2",
                productId: "2",
                productName: "Gadget B",
                type: "purchase",
                quantity: 75,
                costPerUnit: 50,
                totalCost: 3750,
                timestamp: new Date("2024-01-20"),
            }
        ];

        setProducts(initialProducts);
        setTransactions(initialTransactions);
    }

    const simulateTransactions = () => {}

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
    )
}

export default Dashboard;