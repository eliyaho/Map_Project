import React, { useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from "react-leaflet";
import useApi from "../hooks/useApi";
import PolygonPanel from "./PolygonPanel";
import ObjectsPanel from "./ObjectPanel";
import MapDataPanel from "./MapDataPanel";
import "./style.css";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import jeepPng from "../Png/jeep.png";
import markerPng from "../Png/marker.png";
import "leaflet/dist/leaflet.css";

import { useSelector, useDispatch } from "react-redux";
import {
  setObjects,
  addObject,
  removeObject,
  setSelectedObjectId,
} from "../../redax/objectsSlice";
import {
  setPolygons,
  addPolygon,
  removePolygon,
  setDrawingMode,
  setTempVertices,
  setSelectedPolygonId,
} from "../../redax/polygonsSlice";
import { setPlacingObjectType } from "../../redax/uiSlice";

// תיקון לאייקונים של leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

export const jeepIcon = new L.Icon({
  iconUrl: jeepPng,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export const MarkerIcon = new L.Icon({
  iconUrl: markerPng,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function MapClickHandler({ drawingMode, placingObjectType, onMapClick }) {
  const dispatch = useDispatch();

  useMapEvents({
    click(e) {
      if (drawingMode) {
        onMapClick(e.latlng);
      } else if (placingObjectType) {
        const newObj = {
          _id: null,
          id: `local-${Date.now()}`,
          location: { coordinates: [e.latlng.lng, e.latlng.lat] },
          type: placingObjectType,
        };
        dispatch(addObject(newObj));
        dispatch(setPlacingObjectType(null));
      }
    },
  });

  return null;
}


export default function MapPage() {
  const api = useApi("http://localhost:5297/api");
  const dispatch = useDispatch();

  // --- Redux selectors ---
  const polygons = useSelector((state) => state.polygons.list);
  const drawingMode = useSelector((state) => state.polygons.drawingMode);
  const tempVertices = useSelector((state) => state.polygons.tempVertices);
  const selectedPolygonId = useSelector((state) => state.polygons.selectedPolygonId);
  const objects = useSelector((state) => state.objects.list);
  const selectedObjectId = useSelector((state) => state.objects.selectedObjectId);
  const placingObjectType = useSelector((state) => state.ui.placingObjectType);

  // --- Load data from API ---
 useEffect(() => {
  async function loadPolygons() {
    try {
      const data = await api.list("polygon");
      const dataob = await api.list("objects");
      dispatch(setObjects(dataob));
      dispatch(setPolygons(data));
    } catch (err) {
      console.error("❌ שגיאה בטעינת פוליגונים:", err);
    }
  }
  loadPolygons();
}, [dispatch]);


  // --- Polygon handlers ---
  const handleMapClickWhileDrawing = (latlng) => {
    if (tempVertices.length === 0) {
      dispatch(setTempVertices([[latlng.lat, latlng.lng]]));
      return;
    }
    const first = L.latLng(tempVertices[0][0], tempVertices[0][1]);
    const clicked = L.latLng(latlng.lat, latlng.lng);
    if (first.distanceTo(clicked) < 10 && tempVertices.length >= 3) {
      const closedVertices = [...tempVertices, [tempVertices[0][0], tempVertices[0][1]]];
      dispatch(addPolygon({ _id: null, vertices: closedVertices }));
      dispatch(setTempVertices([]));
      dispatch(setDrawingMode(false));
      return;
    }
    dispatch(setTempVertices([...tempVertices, [latlng.lat, latlng.lng]]));
  };

  const onPolygonClick = (idx, p) => {
    dispatch(setSelectedPolygonId(p._id || `local-${idx}`));
    dispatch(setSelectedObjectId(null));
  };
  
  const polygonPositionsFromGeo = (polygon) => polygon.vertices || [];
  const getObjectPosition = (obj) =>
    obj.location?.coordinates ? [obj.location.coordinates[1], obj.location.coordinates[0]] : [obj.lat, obj.lng];
  const getObjectType = (obj) => obj.type || "marker";

  const onObjectClick = (obj) => {
  dispatch(setSelectedObjectId(obj._id || obj.id));
  dispatch(setSelectedPolygonId(null));
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
          {objects.map((o) => (
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
        />
        <ObjectsPanel onAddObjectType={(type) => {
          dispatch(setPlacingObjectType(type));
          dispatch(setDrawingMode(false));
        }} />
        <MapDataPanel
          objects={objects}
          polygons={polygons}
          selectedObjectId={selectedObjectId}
          selectedPolygonId={selectedPolygonId}
          onSelectObject={onObjectClick}
          onSelectPolygon={(p) => dispatch(setSelectedPolygonId(p._id || p.id))}
        />

      </div>
    </div>
  );
}
