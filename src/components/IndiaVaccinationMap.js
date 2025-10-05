import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import * as d3 from "d3";
import vaccinationData from "../data/indiaVaccination.json";
import Loader from "./Loader";

const normalizeName = (name) =>
  name?.toLowerCase().replace(/\s/g, "").replace(/\./g, "");

const IndiaVaccinationMap = () => {
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [indiaGeo, setIndiaGeo] = useState(null);
  const [worldGeo, setWorldGeo] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/india-states.geojson").then((res) => res.json()),
      fetch("/world-countries.geojson").then((res) => res.json()),
    ])
      .then(([indiaData, worldData]) => {
        setIndiaGeo(indiaData);
        setWorldGeo(worldData);
        setIsLoading(false);
      })
      .catch((err) => console.error("Error loading map data:", err));
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          background: "linear-gradient(to right, #0e5e86ff, #022b40)",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader message="Loading Map Data..." color="#fff" />
      </div>
    );
  }

  const maxVaccinated = Math.max(...vaccinationData.map((d) => d.vaccinated));
  const indiaColorScale = d3
    .scaleLinear()
    .domain([0, maxVaccinated])
    .range(["#d0f1c9ff", "#034a21ff"]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <svg
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <defs>
          <linearGradient id="leftTint" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(9, 9, 9, 0.6)" />{" "}
            <stop offset="50%" stopColor="rgba(157, 156, 156, 0.3)" />{" "}
            <stop offset="100%" stopColor="rgba(185, 184, 184, 0.52)" />{" "}
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="#0e5e86ff" />
        <rect width="100%" height="100%" fill="url(#leftTint)" />
      </svg>

      {/* 🏷️ Heading */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          color: "#034a21ff",
          backgroundColor: "#fff",
          padding: "10px",
          border: "2px solid #000",
          borderRadius: "10px",
          fontSize: "28px",
          fontWeight: "bold",
          boxShadow: "10px 10px 20px rgba(0,0,0,0.7)",
          zIndex: 10,
        }}
      >
        India Vaccination Dashboard
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 1600, center: [82, 23] }}
        width={1400}
        height={1400}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Geographies geography="/world-countries.geojson">
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryName =
                geo?.properties?.NAME || geo?.properties?.ADMIN;
              if (normalizeName(countryName) === "india") return null;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#d3d3d3"
                  stroke="#888"
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#b0b0b0", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        <Geographies geography="/india-states.geojson">
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties?.ST_NM || geo.properties?.NAME_1;
              if (!stateName) return null;

              const stateData = vaccinationData.find(
                (d) => normalizeName(d.state) === normalizeName(stateName)
              );

              const fillColor = stateData
                ? indiaColorScale(stateData.vaccinated)
                : "#eee";

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fillColor}
                  stroke="#000"
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    setTooltipData({
                      state: stateName,
                      vaccinated: stateData?.vaccinated || "No Data",
                      vaccination_rate: stateData?.vaccination_rate || "N/A",
                      top_vaccine: stateData?.top_vaccine || "N/A",
                      region: stateData?.region || "N/A",
                    });
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) =>
                    setTooltipPos({ x: e.clientX, y: e.clientY })
                  }
                  onMouseLeave={() => setTooltipData(null)}
                  style={{
                    default: {
                      outline: "none",
                      transition: "fill 0.4s ease, transform 0.3s ease",
                    },
                    hover: {
                      fill: "#5ea372",
                      outline: "none",
                    },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltipData && (
        <div
          style={{
            position: "absolute",
            top: tooltipPos.y + 10,
            left: tooltipPos.x + 10,
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            padding: "8px 10px",
            borderRadius: "5px",
            pointerEvents: "none",
            fontSize: "14px",
            minWidth: "130px",
            zIndex: 10,
            transition: "opacity 0.2s ease",
          }}
        >
          <strong>{tooltipData.state}</strong>
          <br />
          Vaccinated:{" "}
          {typeof tooltipData.vaccinated === "number"
            ? tooltipData.vaccinated.toLocaleString()
            : tooltipData.vaccinated}
          <br />
          Rate: {tooltipData.vaccination_rate}
          <br />
          Top Vaccine: {tooltipData.top_vaccine}
          <br />
          Region: {tooltipData.region}
        </div>
      )}
    </div>
  );
};

export default IndiaVaccinationMap;
