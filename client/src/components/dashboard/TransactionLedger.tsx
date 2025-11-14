import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/types/inventory";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface TransactionLedgerProps {
  transactions: Transaction[];
}

const TransactionLedger = ({ transactions }: TransactionLedgerProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Ledger</CardTitle>
        <CardDescription>
          Time-series view of all purchases and sales with FIFO cost calculation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border px-6 py-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Product ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Cost/Unit</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No transactions yet. Click "Simulate Transactions" to generate demo data.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.timestamp.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.productId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={transaction.type === 'purchase' ? 'default' : 'secondary'}
                        className="gap-1"
                      >
                        {transaction.type === 'purchase' ? (
                          <ArrowDownCircle className="w-3 h-3" />
                        ) : (
                          <ArrowUpCircle className="w-3 h-3" />
                        )}
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{transaction.quantity}</TableCell>
                    <TableCell className="text-right">${transaction.costPerUnit.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={transaction.type === 'purchase' ? 'text-destructive' : 'text-success'}>
                        {transaction.type === 'purchase' ? '-' : '+'}${transaction.totalCost.toFixed(2)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionLedger;