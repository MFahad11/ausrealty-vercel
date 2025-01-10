import React, { useEffect, useState, useMemo } from "react";
import { Chart } from "react-google-charts";

// Helper function to format currency
const formatCurrency = (value:number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0, // No decimal places
  }).format(value);
};

const GoogleChart = ({ dataPoints }:{
  dataPoints: number[][]
}) => {
  const [data, setData] = useState(dataPoints || []); // Ensure it's initialized

  useEffect(() => {
    if (dataPoints) {
      setData(dataPoints);
    }
  }, [dataPoints]); // Update when dataPoints changes

  const isDataEmpty = useMemo(() => data.length <= 1, [data]); // Check if data is empty

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const formattedData = data.map((row, index) => {
      const price = formatCurrency(row[1]);
      const tooltipContent = `
        <div style="padding:5px;">
          <strong>Land Area:</strong> ${row[0]}<br/>
          <strong>Sales:</strong> ${price}<br/>
          <strong>Address:</strong> ${row[2]}<br/>
        </div>
      `;

      const style =
        index === 0
          ? "point { fill-color: red; }" // Source property style
          : "point { fill-color: #787878; }"; // Other sold properties

      return [row[0], row[1], tooltipContent, style];
    });

    return [
      [
        "Land Area",
        "Sales",
        { role: "tooltip", p: { html: true } },
        { role: "style" },
      ],
      ...formattedData,
    ];
  }, [data]);

  const maxLandArea = useMemo(() => {
    return Math.max(...data.map((row) => row[0]));
  }, [data]);

  const chartOptions = useMemo(
    () => ({
      title: "",
      curveType: "function",
      legend: "none",
      tooltip: { isHtml: true },
      width: "100%",
      height: 400,
      vAxis: {
        baselineColor: "#ffffff",
        title: "Sale Price in $",
        format: "short",
        minValue: 0,
        titleTextStyle: { italic: false },
        textStyle: { fontSize: 8 },
      },
      hAxis: {
        title: "Land Area (m²)",
        format: "# 'm²'",
        titleTextStyle: { italic: false },
        textStyle: { fontSize: 8 },
        viewWindow: {
          min: 0,
          max: maxLandArea + 100, // Dynamic maximum
        },
      },
      annotations: {
        textStyle: {
          fontSize: 8,
          color: "#ffffff",
          cursor: "pointer",
        },
        pointSize: 9,
        alwaysOutside: true,
      },
    }),
    [maxLandArea] // Ensure that this updates when data changes
  );

  return (
    <div className="w-full">
      {!isDataEmpty && chartData.length > 1 ? (
        <div>
          <p className="text-center">Sale Price vs Land Area</p>
          <div className="w-full min-w-[350px]">
            <Chart
              chartType="ScatterChart"
              data={chartData}
              // @ts-ignore
              options={chartOptions}
              width="100%"
              height="350px"
            />
          </div>
        </div>
      ) : (
        <div>No data available</div>
      )}
    </div>
  );
};

export default GoogleChart;
