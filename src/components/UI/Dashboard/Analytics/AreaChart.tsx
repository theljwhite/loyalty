import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export type ChartSeries = { name: string; data: any[]; color: string }[];

interface AreaChartProps {
  width?: number;
  height?: number;
  chartSeries: ChartSeries;
  xCategories: string[];
  error: string;
}

export default function AreaChart({
  width,
  height,
  chartSeries,
  xCategories,
  error,
}: AreaChartProps) {
  const defaultOptions: ApexOptions = {
    chart: {
      height: height ?? "100%",
      width: width ?? "100%",
      type: "area",
      fontFamily: "Inter, sans-serif",
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
    },
    noData: {
      text: error ? error : "No data found",
      align: "center",
      verticalAlign: "middle",
      offsetX: 0,
      offsetY: 0,
      style: {
        color: "#000000",
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
        shade: "#5639CC",
        gradientToColors: ["#5639CC"],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 6,
    },
    grid: {
      show: false,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: 0,
      },
    },
    xaxis: {
      categories: xCategories.length > 0 ? xCategories : [],
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
  };

  return (
    <ReactApexChart type="area" options={defaultOptions} series={chartSeries} />
  );
}
