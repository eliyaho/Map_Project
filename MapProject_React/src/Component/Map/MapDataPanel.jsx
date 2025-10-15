import React from "react";

export default function MapDataPanel({ objects, polygons, selectedObjectId, selectedPolygonId, onSelectObject, onSelectPolygon }) {
  const objectsWithLatLng = objects.map(o => ({
    ...o,
    lat: o.location?.coordinates ? o.location.coordinates[1] : null,
    lng: o.location?.coordinates ? o.location.coordinates[0] : null,
  }));
  const polygonsWithCenter = polygons.map((p, idx) => {
    const vertices = p.vertices || [];
    if (vertices.length === 0) return { ...p, lat: null, lng: null };
    const sum = vertices.reduce((acc, v) => [acc[0] + v[0], acc[1] + v[1]], [0, 0]);
    const center = [sum[0] / vertices.length, sum[1] / vertices.length];
    return { ...p, lat: center[0], lng: center[1], id: p._id || `local-${idx}` };
  });

  return (
    <section style={{ border: "4px solid #363434ff", padding: 8 }}>
      <h3>Map Data</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "4px" }}>Type</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "4px" }}>Lat</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "4px" }}>Lon</th>
          </tr>
        </thead>
        <tbody>
          {objectsWithLatLng.map(o => (
            <tr
              key={o._id || o.id}
              onClick={() => onSelectObject(o)}
              style={{
                background: selectedObjectId === (o._id || o.id) ? "#eef" : "transparent",
                cursor: "pointer"
              }}
            >
              <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>{o.type}</td>
              <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>{o.lat !== null ? o.lat.toFixed(6) : "-"}</td>
              <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>{o.lng !== null ? o.lng.toFixed(6) : "-"}</td>
            </tr>
          ))}

          {polygonsWithCenter.map(p => (
            <tr
              key={p._id || p.id}
              onClick={() => onSelectPolygon(p)}
              style={{
                background: selectedPolygonId === (p._id || p.id) ? "#eef" : "transparent",
                cursor: "pointer"
              }}
            >
              <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>Polygon</td>
              <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>{p.lat !== null ? p.lat.toFixed(6) : "-"}</td>
              <td style={{ padding: "4px", borderBottom: "1px solid #eee" }}>{p.lng !== null ? p.lng.toFixed(6) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
