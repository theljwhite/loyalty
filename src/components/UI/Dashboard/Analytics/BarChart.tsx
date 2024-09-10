import dynamic from "next/dynamic";
import { type XTitleYData } from "~/utils/programAnalytics";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface BarChartProps {
  series: BarChartSeries;
  error: string;
}

export type BarChartSeries = {
  name: string;
  color: string;
  data: XTitleYData[];
}[];

export default function BarChart({ series, error }: BarChartProps) {
  const defaultOptions = {
    colors: ["#5639CC", "#9F39CC", "#704cfc"],
    chart: {
      height: "100%",
      width: "100%",
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 10,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      style: {
        fontFamily: "Inter, sans-serif",
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
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 1,
        },
      },
    },
    stroke: {
      show: true,
      width: 0,
      colors: ["transparent"],
    },
    grid: {
      show: false,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: -14,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    xaxis: {
      floating: false,
      labels: {
        show: series.length > 0,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500",
        },
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
    fill: {
      opacity: 1,
    },
  };

  return (
    <ReactApexChart
      options={defaultOptions as ApexCharts.ApexOptions}
      series={series}
      type="bar"
    />
  );
}
