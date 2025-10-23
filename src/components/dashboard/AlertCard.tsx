import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  titulo: string;
  tipo: string;
  impacto: number;
  descricao: string;
  status: "pendente" | "resolvido" | "ignorado" | "em_analise";
  data_alerta: string;
  hipoteses?: string[];
  acoes?: string[];
  onStatusChange?: (newStatus: string) => void;
}

export function AlertCard({
  titulo,
  tipo,
  impacto,
  descricao,
  status,
  data_alerta,
  hipoteses = [],
  acoes = [],
  onStatusChange,
}: AlertCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "resolvido":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "em_analise":
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <AlertCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusBadge = () => {
    const variants = {
      pendente: "destructive" as const,
      em_analise: "default" as const,
      resolvido: "secondary" as const,
      ignorado: "outline" as const,
    };
    
    const labels = {
      pendente: "Pendente",
      em_analise: "Em Análise",
      resolvido: "Resolvido",
      ignorado: "Ignorado",
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  return (
    <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {getStatusIcon()}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">{titulo}</h3>
                {getStatusBadge()}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium">{tipo}</span>
                <span>•</span>
                <span>Impacto: <span className="text-destructive font-semibold">{impacto.toFixed(1)}%</span></span>
                <span>•</span>
                <span>{new Date(data_alerta).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <p className="text-muted-foreground">{descricao}</p>

        {/* Hipóteses */}
        {hipoteses.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Hipóteses Sugeridas:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {hipoteses.map((hipotese, index) => (
                <li key={index}>{hipotese}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Ações Recomendadas */}
        {acoes.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Ações Recomendadas:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {acoes.map((acao, index) => (
                <li key={index}>{acao}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        {status !== "resolvido" && onStatusChange && (
          <div className="flex gap-2 pt-2">
            {status === "pendente" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange("em_analise")}
              >
                Em Análise
              </Button>
            )}
            <Button
              size="sm"
              variant="default"
              onClick={() => onStatusChange("resolvido")}
            >
              Marcar como Resolvido
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
