import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getShuffledColors } from "@/lib/colors";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ChartData {
  name: string;
  value: number;
}

interface HorizontalBarChartProps {
  data: ChartData[];
  title: string;
  periodLabel?: string;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(0)}%`;
};

export function HorizontalBarChart({
  data,
  title,
  periodLabel = "Últimos 30 dias",
}: HorizontalBarChartProps) {
  const isMobile = useIsMobile();
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const sortedData = [...data].sort((a, b) => b.value - a.value);

  const top5Data = sortedData.slice(0, 5);
  const otherData = sortedData.slice(5);

  const otherValue = otherData.reduce((sum, item) => sum + item.value, 0);

  const processedData = [...top5Data];
  if (otherValue > 0) {
    processedData.push({ name: "Outros", value: otherValue });
  }

  const colors = getShuffledColors();
  const chartData = processedData.map((item, index) => ({
    ...item,
    color: item.name === "Outros" ? "#A9A9A9" : colors[index % colors.length],
  }));

  const maxChartValue = Math.max(...chartData.map(item => item.value));

  return (
    <Card className="p-6 shadow-card">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <div className="flex items-center justify-between mt-2">
          <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {periodLabel}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div>
          <TooltipProvider>
            {chartData.map((item) => (
              <Tooltip key={item.name} delayDuration={100}>
                <TooltipTrigger asChild>
                  <div
                    className="flex flex-col items-start w-full group mb-4"
                  >
                    <div
                      className={cn(
                        "pr-4 text-sm w-full mb-1",
                        !isMobile && "truncate"
                      )}
                    >
                      {item.name}
                    </div>
                    <div
                      className="flex items-center w-full"
                    >
                      <div className="w-[75%]">
                        <div
                          className="h-6 rounded-md transition-all duration-300"
                          style={{
                            width: `${(item.value / maxChartValue) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                      <div
                        className="text-right pl-4 text-sm font-medium w-[25%]"
                      >
                        {formatPercentage((item.value / totalValue) * 100)}
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formatCurrency(item.value)}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
