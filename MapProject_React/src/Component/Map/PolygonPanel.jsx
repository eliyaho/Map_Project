import React from "react";
import './style.css'

export default function PolygonPanel({ drawingMode, tempVertices, onStartAddPolygon, onCancelDrawing, onSavePolygon, onDeletePolygon }) {
  
  return (
    <section style={{ marginBottom: 16, border: "4px solid #363434ff", padding: 8 }}>
      <h3>Polygon</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="button" onClick={onStartAddPolygon}>הוסף (צייר)</button>
        <button className="button" onClick={onCancelDrawing} disabled={!drawingMode}>ביטול ציור</button>
        <button className="button" onClick={onSavePolygon}>שמור פוליגון</button>
        <button className="button" onClick={onDeletePolygon}>מחק פוליגון</button>
      </div>
      <div style={{ marginTop: 8, fontSize: 13 }}>
        {drawingMode ? "מצב ציור פעיל — לחץ על המפה להוספת קודקודים. לחץ שוב על הנקודה הראשונה לסגירה." : "מצב ציור כבוי"}
        <div>נקודות זמניות: {tempVertices.length}</div>
        
      </div>
    </section>
  );
}
