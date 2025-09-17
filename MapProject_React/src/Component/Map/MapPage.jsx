import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from "react-leaflet";

import useApi from "../hooks/useApi";
import PolygonPanel from "./PolygonPanel";
import ObjectsPanel from "./ObjectPanel";
import MapDataPanel from "./MapDataPanel";
import "./style.css";

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import jeepPng from "../Png/jeep.png";
import markerPng from "../Png/marker.png";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});
export const jeepIcon = new L.Icon({ iconUrl: jeepPng, iconSize: [36, 36], iconAnchor: [18, 18] });
export const MarkerIcon = new L.Icon({ iconUrl: markerPng, iconSize: [36, 36], iconAnchor: [18, 18] });
function MapClickHandler({ drawingMode, onMapClick, placingObjectType, onPlaceObject }) {
  useMapEvents({
    click(e) {
      if (drawingMode) onMapClick(e.latlng);
      else if (placingObjectType) onPlaceObject(e.latlng, placingObjectType);
    },
  });
  return null;
}

export default function MapPage() {
  const api = useApi("http://localhost:5297/api");
  const [polygons, setPolygons] = useState([]);
  const [objects, setObjects] = useState([]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [tempVertices, setTempVertices] = useState([]);
  const [selectedPolygonId, setSelectedPolygonId] = useState(null);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [placingObjectType, setPlacingObjectType] = useState(null);

  useEffect(() => {
    async function loadAll() {
      try {
        const [polys, objs] = await Promise.all([api.list("polygons"), api.list("objects")]);
        setPolygons(polys || []);
        setObjects(objs || []);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    }
    loadAll();
  }, []);

  const handleMapClickWhileDrawing = (latlng) => {
    if (tempVertices.length === 0) {
      setTempVertices([[latlng.lat, latlng.lng]]);
      return;
    }
    
    const first = L.latLng(tempVertices[0][0], tempVertices[0][1]);
    const clicked = L.latLng(latlng.lat, latlng.lng);
    
    if (first.distanceTo(clicked) < 10 && tempVertices.length >= 3) {
      const closedVertices = [...tempVertices, [tempVertices[0][0], tempVertices[0][1]]];
      const newPolygon = { _id: null, vertices: closedVertices };
      setPolygons(prev => [...prev, newPolygon]);
      setTempVertices([]);
      setDrawingMode(false);
      return;
    }
    
    setTempVertices(prev => [...prev, [latlng.lat, latlng.lng]]);
  };

  const onStartAddPolygon = () => {
    setDrawingMode(true);
    setTempVertices([]);
    setSelectedPolygonId(null);
    setPlacingObjectType(null);
  };

  const onCancelDrawing = () => {
    setDrawingMode(false);
    setTempVertices([]);
  };

  const onSavePolygon = async () => {
    if (tempVertices.length < 3) return alert("צריך לפחות 3 נקודות כדי ליצור פוליגון");

    // וודא שהפוליגון סגור - הוסף את הנקודה הראשונה כנקודה האחרונה אם חסר
    let closedVertices = [...tempVertices];
    if (closedVertices.length > 0 && 
        (closedVertices[0][0] !== closedVertices[closedVertices.length - 1][0] ||
         closedVertices[0][1] !== closedVertices[closedVertices.length - 1][1])) {
      closedVertices.push([closedVertices[0][0], closedVertices[0][1]]);
    }

    const polygonDoc = {
      polygon: { 
        type: "Polygon", 
        coordinates: [closedVertices.map(c => [c[1], c[0]])] // [lng, lat]
      },
      properties: {},
    };

    try {
      const saved = await api.create("polygons", polygonDoc);
      setPolygons(prev => [...prev, saved]);
      setTempVertices([]);
      setDrawingMode(false);
    } catch (err) {
      console.error("שגיאה בשמירה:", err);
      alert("שגיאה בשמירה");
    }
  };

  const onDeletePolygon = async () => {
    if (!selectedPolygonId) return alert("בחר פוליגון למחיקה");
    try {
      await api.remove("polygons", selectedPolygonId);
      setPolygons(prev => prev.filter(p => String(p._id) !== String(selectedPolygonId)));
      setSelectedPolygonId(null);
    } catch (err) {
      console.error(err);
      alert("שגיאה במחיקה");
    }
  };

  const onPolygonClick = (idx, p) => {
    setSelectedPolygonId(p._id || `local-${idx}`);
    setSelectedObjectId(null);
  };

  const polygonPositionsFromGeo = (polygon) => {
    let coordinates = [];
    
    if (polygon.geometry && polygon.geometry.coordinates) {
      coordinates = polygon.geometry.coordinates[0];
    } else if (polygon.polygon && polygon.polygon.coordinates) {
      coordinates = polygon.polygon.coordinates[0];
    } else if (polygon.vertices) {
      return polygon.vertices;
    } else {
      return [];
    }
    
    const positions = coordinates.map(c => [c[1], c[0]]);
    if (positions.length > 1 && 
        positions[0][0] === positions[positions.length - 1][0] &&
        positions[0][1] === positions[positions.length - 1][1]) {
      return positions.slice(0, -1);
    }
    
    return positions;
  };

  // --- OBJECTS ---
  const onAddMarker = () => {
    setPlacingObjectType("marker");
    setDrawingMode(false);
    setSelectedObjectId(null);
    setSelectedPolygonId(null);
  };

  const onAddJeep = () => {
    setPlacingObjectType("jeep");
    setDrawingMode(false);
    setSelectedObjectId(null);
    setSelectedPolygonId(null);
  };

  const onPlaceObject = (latlng, type) => {
    const newObj = { 
      _id: null, 
      id: `local-${Date.now()}`, 
      location: {
        coordinates: [latlng.lng, latlng.lat] // [lng, lat]
      },
      type 
    };
    setObjects(prev => [...prev, newObj]);
    setPlacingObjectType(null);
  };

  const onSaveObjects = async () => {
    try {
      const objectsToSave = objects.filter(o => !o._id); 
      
      if (objectsToSave.length === 0) {
        alert("אין אובייקטים חדשים לשמירה");
        return;
      }

      const payload = {
        features: objectsToSave.map(o => ({
          type: "Feature",
          geometry: { 
            type: "Point", 
            coordinates: o.location.coordinates
          },
          properties: { 
            type: o.type, 
            localId: o.id 
          },
        }))
      };
      
      const result = await api.create("objects/bulk", payload);
      setObjects(result || []);
      alert("אובייקטים נשמרו בהצלחה");
    } catch (err) {
      console.error(err);
      alert("שגיאה בשמירת אובייקטים");
    }
  };

  const onDeleteObject = async () => {
    if (!selectedObjectId) return alert("בחר אובייקט למחיקה");
    
    // אם זה אובייקט מקומי (לא נשמר עוד)
    if (selectedObjectId.startsWith("local-")) {
      setObjects(prev => prev.filter(o => o.id !== selectedObjectId));
      setSelectedObjectId(null);
      return;
    }
    
    try {
      await api.remove("objects", selectedObjectId);
      setObjects(prev => prev.filter(o => String(o._id) !== String(selectedObjectId)));
      setSelectedObjectId(null);
    } catch (err) {
      console.error(err);
      alert("שגיאה במחיקת אובייקט");
    }
  };

  const onObjectClick = (o) => {
    setSelectedObjectId(o._id || o.id);
    setSelectedPolygonId(null);
  };

  const getObjectPosition = (obj) => {
    if (obj.location && obj.location.coordinates) {
      return [obj.location.coordinates[1], obj.location.coordinates[0]]; 
    }
    return [obj.lat, obj.lng];
  };

  const getObjectType = (obj) => {
    return obj.type || "marker";
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "70%" }}>
        <MapContainer center={[32.0853, 34.7818]} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler
            drawingMode={drawingMode}
            onMapClick={handleMapClickWhileDrawing}
            placingObjectType={placingObjectType}
            onPlaceObject={onPlaceObject}
          />
          {polygons.map((p, idx) => (
            <Polygon
              key={p._id || `local-${idx}`}
              positions={polygonPositionsFromGeo(p)}
              pathOptions={{ color: p._id === selectedPolygonId ? "red" : "blue" }}
              eventHandlers={{ click: () => onPolygonClick(idx, p) }}
            />
          ))}
          {drawingMode && tempVertices.length > 0 && (
            <Polygon positions={tempVertices} pathOptions={{ color: "green", dashArray: "5,5" }} />
          )}
          {objects.map(o => (
            <Marker
              key={o._id || o.id}
              position={getObjectPosition(o)}
              icon={getObjectType(o) === "marker" ? MarkerIcon : jeepIcon}
              eventHandlers={{ click: () => onObjectClick(o) }}
            />
          ))}
        </MapContainer>
      </div>

      <div style={{ width: "30%", padding: 12, boxSizing: "border-box", background: "#fafafa", overflowY: "auto" }}>
        <PolygonPanel
          drawingMode={drawingMode}
          tempVertices={tempVertices}
          onStartAddPolygon={onStartAddPolygon}
          onCancelDrawing={onCancelDrawing}
          onSavePolygon={onSavePolygon}
          onDeletePolygon={onDeletePolygon}
        />
        <ObjectsPanel
          placingObjectType={placingObjectType}
          onAddMarker={onAddMarker}
          onAddJeep={onAddJeep}
          onSaveObjects={onSaveObjects}
          onDeleteObject={onDeleteObject}
        />
        <MapDataPanel 
          objects={objects} 
          selectedObjectId={selectedObjectId} 
          onSelect={onObjectClick} 
        />
      </div>
    </div>
  );
}