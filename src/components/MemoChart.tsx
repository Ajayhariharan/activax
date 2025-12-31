import React from "react";
import { Chart } from "primereact/chart";

type MemoChartProps = {
  type: "line" | "bar" | "pie";
  data: any;
  options?: any;
  style?: React.CSSProperties;
};

export const MemoChart = React.memo(function MemoChart({
  type,
  data,
  options,
  style,
}: MemoChartProps) {
  return <Chart type={type} data={data} options={options} style={style} />;
});
