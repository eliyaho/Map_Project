import React from "react";

export default function MapDataPanel({ objects, selectedObjectId, onSelect }) {
  return (
    <section style={{ border: "4px solid #363434ff", padding: 8 }}>
      <h3>Map Data</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "4px" }}>Object</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "4px" }}>Lat</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "4px" }}>Lon</th>
          </tr>
        </thead>
        <tbody>
          {objects.map((o, idx) => (
            <tr
              key={o._id || o.id}
              onClick={() => onSelect(o)}
              style={{ background: selectedObjectId === (o._id || o.id) ? "#eef" : "transparent", cursor: "pointer" }}
            >
              <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>{o.type}</td>
              <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>{Number(o.lat).toFixed(6)}</td>
              <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>{Number(o.lng).toFixed(6)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
