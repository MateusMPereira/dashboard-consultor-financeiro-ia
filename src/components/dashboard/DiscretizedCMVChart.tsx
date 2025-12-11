import { HorizontalBarChart } from "./HorizontalBarChart";

interface ChartData {
  name: string;
  value: number;
}

interface DiscretizedCMVChartProps {
  data: ChartData[];
}

export function DiscretizedCMVChart({ data }: DiscretizedCMVChartProps) {
  return (
    <HorizontalBarChart
      data={data}
      title="CMV Discretizado"
    />
  );
}
