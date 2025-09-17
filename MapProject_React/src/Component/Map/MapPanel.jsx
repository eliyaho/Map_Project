import React from "react";
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import jeepPng from "./jeep.png";
import 'leaflet/dist/leaflet.css'

const jeepIcon = new L.Icon({
  iconUrl: jeepPng,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

function MapClickHandler({ drawingMode, onMapClick, onObjectPlaceMode, placeObjectType }) {
  useMapEvents({
    click(e) {
      if (drawingMode) onMapClick(e.latlng);
      else if (onObjectPlaceMode) onObjectPlaceMode(e.latlng, placeObjectType);
    }
  });
  return null;
}

export default function MapPanel({
  polygons,
  tempVertices,
  objects,
  drawingMode,
  onMapClick,
  placingObjectType,
  onPlaceObject,
  onPolygonClick,
  onObjectClick
}) {
  const polygonPositionsFromGeo = (g) => g?.coordinates?.[0]?.map(c => [c[1], c[0]]) || [];

  return (
    <MapContainer center={[32.0853, 34.7818]} zoom={12} style={{ width: "100%", height: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler
        drawingMode={drawingMode}
        onMapClick={onMapClick}
        onObjectPlaceMode={onPlaceObject}
        placeObjectType={placingObjectType}
      />
      {polygons.map((p, idx) => {
        const positions = polygonPositionsFromGeo(p.geometry);
        const isSelected = p._id === p.selectedId || (!p._id && `local-${idx}` === p.selectedId);
        return (
          <Polygon
            key={p._id || `local-${idx}`}
            positions={positions}
            pathOptions={{ color: isSelected ? "orange" : "blue" }}
            eventHandlers={{ click: () => onPolygonClick(idx, p) }}
          />
        );
      })}
      {tempVertices.length > 0 && (
        <Polygon positions={tempVertices} pathOptions={{ color: "red", dashArray: "4" }} />
      )}
      {objects.map(o => (
        <Marker
          key={o._id || o.id}
          position={[o.lat, o.lng]}
          icon={o.type === "jeep" ? jeepIcon : undefined}
          eventHandlers={{ click: () => onObjectClick(o) }}
        >
          <Popup>
            {o._id ? `id: ${o._id}` : `local id: ${o.id}`}<br />
            type: {o.type}<br />
            lat: {Number(o.lat).toFixed(6)}<br />
            lng: {Number(o.lng).toFixed(6)}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
