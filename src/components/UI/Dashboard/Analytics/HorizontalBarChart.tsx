import dynamic from "next/dynamic";
import { type HorizontalBarSeries } from "~/utils/programAnalytics";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface HorizontalBarChartProps {
  width?: number;
  height?: number;
  series: HorizontalBarSeries[];
  xCategories: string[];
  error: string;
}

export default function HorizontalBarChart({
  width,
  height,
  series,
  xCategories,
  error,
}: HorizontalBarChartProps) {
  const defaultOptions = {
    chart: {
      sparkline: {
        enabled: false,
      },
      type: "bar",
      width: width ?? "100%",
      height: height ?? "100%", //400
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: "100%",
        borderRadiusApplication: "end",
        borderRadius: 6,
        dataLabels: {
          position: "top",
        },
      },
    },
    legend: {
      show: true,
      position: "bottom",
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      shared: true,
      intersect: false,
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
    xaxis: {
      labels: {
        show: true,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
      categories: xCategories,
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
    },
    grid: {
      show: true,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: -20,
      },
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
