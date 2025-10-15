import React from "react";
import './style.css';
import { useSelector, useDispatch } from "react-redux";
import { 
  setPolygons, 
  addPolygon, 
  removePolygon, 
  setDrawingMode, 
  setTempVertices, 
  setSelectedPolygonId 
} from "../../redax/polygonsSlice";
import { setPlacingObjectType } from "../../redax/uiSlice";
import useApi from "../hooks/useApi"; // ודא שיש לך hook כזה

export default function PolygonPanel({ drawingMode, tempVertices, selectedPolygonId }) {
  const dispatch = useDispatch();
  const api = useApi("http://localhost:5297/api");

  const onStartAddPolygon = () => {
    dispatch(setDrawingMode(true));
    dispatch(setTempVertices([]));
    dispatch(setSelectedPolygonId(null));
    dispatch(setPlacingObjectType(null));
  };

  const onCancelDrawing = () => {
    dispatch(setDrawingMode(false));
    dispatch(setTempVertices([]));
  };

  const onSavePolygon = async () => {
    if (tempVertices.length < 3) {
      return alert("צריך לפחות 3 נקודות כדי ליצור פוליגון");
    }

    let closedVertices = [...tempVertices];
    if (
      closedVertices.length > 0 &&
      (closedVertices[0][0] !== closedVertices[closedVertices.length - 1][0] ||
       closedVertices[0][1] !== closedVertices[closedVertices.length - 1][1])
    ) {
      closedVertices.push([closedVertices[0][0], closedVertices[0][1]]);
    }

    const polygonDoc = { vertices: closedVertices, properties: {} };

    try {
      const saved = await api.create("polygon", polygonDoc);
      dispatch(addPolygon(saved));
      dispatch(setTempVertices([]));
      dispatch(setDrawingMode(false));
    } catch (err) {
      console.error("שגיאה בשמירה:", err);
      alert("שגיאה בשמירת הפוליגון. בדוק אם השרת פעיל.");
    }
  };

  const onDeletePolygon = async () => {
    if (!selectedPolygonId) return alert("בחר פוליגון למחיקה");

    try {
      await api.remove("polygon", selectedPolygonId);
      dispatch(removePolygon(selectedPolygonId));
      dispatch(setSelectedPolygonId(null));
    } catch (err) {
      console.error(err);
      alert("שגיאה במחיקה");
    }
  };

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
        {drawingMode
          ? "מצב ציור פעיל — לחץ על המפה להוספת קודקודים. לחץ שוב על הנקודה הראשונה לסגירה."
          : "מצב ציור כבוי"}
        <div>נקודות זמניות: {tempVertices.length}</div>
      </div>
    </section>
  );
}
