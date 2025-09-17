import React from "react";
import './style.css'

export default function ObjectsPanel({ placingObjectType, onAddMarker, onAddJeep, onSaveObjects, onDeleteObject }) {
  return (
    <section style={{ marginBottom: 16, border: "4px solid #363434ff", padding: 8 }}>
      <h3>Objects</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button className="button" onClick={onAddMarker}>הוסף Marker</button>
        <button className="button" onClick={onAddJeep}>הוסף Jeep</button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="button" onClick={onSaveObjects}>שמור כל האובייקטים</button>
        <button className="button" onClick={onDeleteObject}>מחק אובייקט נבחר</button>
      </div>
      <div style={{ marginTop: 8, fontSize: 13 }}>
        מצב הוספה: {placingObjectType ? `הקלק על המפה להוספת ${placingObjectType}` : "לא פעיל"}
      </div>
    </section>
  );
}
