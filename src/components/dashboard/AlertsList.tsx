import { AlertCard } from "./AlertCard";

interface Alert {
  id: string;
  titulo: string;
  tipo: string;
  impacto: number;
  descricao: string;
  status: "pendente" | "resolvido" | "ignorado" | "em_analise";
  data_alerta: string;
  hipoteses?: string[];
  acoes?: string[];
}

interface AlertsListProps {
  alerts: Alert[];
  onStatusChange?: (alertId: string, newStatus: string) => void;
}

export function AlertsList({ alerts, onStatusChange }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">Nenhum alerta no momento</p>
        <p className="text-sm mt-2">Seus indicadores financeiros estão saudáveis!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <AlertCard
          key={alert.id}
          {...alert}
          onStatusChange={
            onStatusChange
              ? (newStatus) => onStatusChange(alert.id, newStatus)
              : undefined
          }
        />
      ))}
    </div>
  );
}
