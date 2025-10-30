import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  type: "income" | "expense";
}

interface TransactionsListProps {
  transactions: Transaction[];
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  return (
    <Card className="p-6 shadow-card">
      <h3 className="text-xl font-bold mb-4">Transações Recentes</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.description}</TableCell>
              <TableCell>
                <Badge variant="secondary">{transaction.category}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
              <TableCell
                className={cn(
                  "text-right font-semibold",
                  transaction.type === "income" ? "text-success" : "text-destructive"
                )}
              >
                {transaction.type === "income" ? "+" : "-"} R$ {Math.abs(transaction.amount).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}