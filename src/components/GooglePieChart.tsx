import React, { useMemo } from "react";
import { Chart } from "react-google-charts";

const GooglePieChart = ({ data }:{
  data: string[][]
}) => {
  const chartType = "PieChart";
  const chartData = useMemo(() => data, [data]);

  const legendItems = useMemo(
    () =>
      chartData.length > 1 ? chartData.slice(1).map((item) => item[0]) : [],
    [chartData]
  );

  const chartOptions = {
    colors: ["#787878", "#A0A0A0", "#DCDCDC", "#4E4E4E"],
    legend: "none",
    is3D: false,
    height: 300,
    chartArea: { top: "5%", width: "100%", height: 300 },
    pieSliceText: "percentage",
  };

  const isDataEmpty = chartData.length <= 1;

  return (
    <div className="mt-2">
      {!isDataEmpty ? (
        <>
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
            <div className="pie-chart w-full max-w-[250px]">
              <Chart
                chartType={chartType}
                data={chartData}
                options={chartOptions}
                width="100%"
                height="300px"
              />
            </div>

            <div className="custom-legend">
              {legendItems.map((item, index) => (
                <div key={index} className="legend-item">
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: chartOptions.colors[index] }}
                  ></span>
                  <span className="legend-label">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div>No data available</div>
      )}
    </div>
  );
};

export default GooglePieChart;
