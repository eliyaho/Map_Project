import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setObjects, addObject, removeObject, setSelectedObjectId } from "../../redax/objectsSlice";
import { setPlacingObjectType } from "../../redax/uiSlice";
import { setDrawingMode } from "../../redax/polygonsSlice";
import "./style.css";
import useApi from "../hooks/useApi";

export default function ObjectsPanel() {
  const api = useApi("http://localhost:5297/api");
  const dispatch = useDispatch();
  const objects = useSelector((state) => state.objects.list);
  const selectedObjectId = useSelector((state) => state.objects.selectedObjectId);
  const placingObjectType = useSelector((state) => state.ui.placingObjectType);

  // --- Object handlers ---
  const onAddMarker = () => {
    dispatch(setPlacingObjectType("marker"));
    dispatch(setDrawingMode(false));
    dispatch(setSelectedObjectId(null));
  };

  const onAddJeep = () => {
    dispatch(setPlacingObjectType("jeep"));
    dispatch(setDrawingMode(false));
    dispatch(setSelectedObjectId(null));
  };

  const onSaveObjects = async () => {
    try {
      const objectsToSave = objects.filter((o) => !o._id);
      if (objectsToSave.length === 0) {
        alert("אין אובייקטים חדשים לשמירה");
        return;
      }

      const payload = {
        features: objectsToSave.map((o) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: o.location.coordinates },
          properties: { type: o.type, localId: o.id },
        })),
      };

      const result = await api.create("objects/bulk", payload);

      dispatch(setObjects([...objects.filter((o) => o._id), ...result]));
      alert("אובייקטים נשמרו בהצלחה");
    } catch (err) {
      console.error(err);
      alert("שגיאה בשמירת אובייקטים");
    }
  };

  const onDeleteObject = async () => {
    if (!selectedObjectId) return alert("בחר אובייקט למחיקה");

    if (selectedObjectId.startsWith("local-")) {
      dispatch(removeObject(selectedObjectId));
      dispatch(setSelectedObjectId(null));
      return;
    }

    try {
      const api = useApi("http://localhost:5297/api");
      await api.remove("objects", selectedObjectId);
      dispatch(removeObject(selectedObjectId));
      dispatch(setSelectedObjectId(null));
    } catch (err) {
      console.error(err);
      alert("שגיאה במחיקת אובייקט");
    }
  };

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
