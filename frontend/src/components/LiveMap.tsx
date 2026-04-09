"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom medical icon
const MedicalIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063167.png', // Red cross / Hospital icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface Facility {
  id: number | string;
  name: string;
  position: [number, number];
  type: string;
  address?: string;
}

function LocationMarker({ userPos }: { userPos: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (userPos) {
      map.flyTo(userPos, 14, { duration: 1.5 });
    }
  }, [userPos, map]);

  return userPos === null ? null : (
    <Marker position={userPos}>
      <Popup>
        <div className="p-1">
          <p className="font-bold text-slate-900">Your Location</p>
          <p className="text-xs text-slate-500">Live position active</p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function LiveMap() {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchStatus, setSearchStatus] = useState("Locating...");
  const [routeData, setRouteData] = useState<[number, number][] | null>(null);

  const fetchRoute = async (targetPos: [number, number]) => {
    if (!userPos) return;
    setSearchStatus("Calculating route...");
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userPos[1]},${userPos[0]};${targetPos[1]},${targetPos[0]}?overview=full&geometries=geojson`
      );
      if (response.ok) {
        const data = await response.json();
        const coordinates = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        setRouteData(coordinates);
        setSearchStatus(`Route to ${targetPos[0].toFixed(4)}, ${targetPos[1].toFixed(4)} generated`);
      }
    } catch (e) {
      console.error("Routing error:", e);
      setSearchStatus("Routing service unavailable");
    }
  };

  const fetchNearbyPlaces = useCallback(async (lat: number, lon: number) => {
    setSearchStatus("Scanning for medical facilities...");
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:5000,${lat},${lon});
          node["amenity"="pharmacy"](around:5000,${lat},${lon});
          way["amenity"="hospital"](around:5000,${lat},${lon});
          way["amenity"="pharmacy"](around:5000,${lat},${lon});
        );
        out body;
        >;
        out skel qt;
      `;
      
      const mirrors = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.osm.ch/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter"
      ];

      let data = null;
      let lastError = "";

      for (const mirror of mirrors) {
        try {
          const response = await fetch(`${mirror}?data=${encodeURIComponent(query)}`);
          if (response.ok) {
            data = await response.json();
            break; 
          }
        } catch (e: any) {
          lastError = e.message;
          continue; 
        }
      }

      if (!data) throw new Error(`Overpass mirrors down: ${lastError}`);
      
      const results: Facility[] = data.elements
        .filter((el: any) => el.lat && el.lon && el.tags && el.tags.name)
        .map((el: any) => ({
          id: el.id,
          name: el.tags.name,
          position: [el.lat, el.lon],
          type: el.tags.amenity === 'hospital' ? 'Hospital' : 'Pharmacy',
          address: el.tags["addr:street"] || "Unknown address"
        }));

      setFacilities(results);
      setSearchStatus(results.length > 0 ? `Found ${results.length} facilities` : "No facilities found nearby");
    } catch (error) {
      console.error("Fetch error:", error);
      setSearchStatus("Nearby search unavailable");
      setFacilities([]);
    }
  }, []);

  useEffect(() => {
    const handleLocation = (lat: number, lon: number) => {
      setUserPos([lat, lon]);
      setLoading(false);
      fetchNearbyPlaces(lat, lon);
    };

    let watchId: number;

    if ("geolocation" in navigator) {
      setSearchStatus("Requesting real-time GPS...");
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocation(latitude, longitude);
        },
        (error) => {
          console.warn("Geolocation watch error:", error.message);
          setSearchStatus("GPS Signal Lost. Using fallback.");
          if (!userPos) handleLocation(13.0827, 80.2707);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setSearchStatus("GPS not supported.");
      handleLocation(13.0827, 80.2707);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [fetchNearbyPlaces]);


  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-slate-100 rounded-3xl flex items-center justify-center border-4 border-white shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{searchStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 h-[600px] rounded-3xl overflow-hidden border-4 border-white shadow-2xl relative">
        <MapContainer
          center={userPos || [13.0827, 80.2707]}
          zoom={14}
          className="w-full h-full"
        >
          <TileLayer
            attribution={attribution}
            url={tileUrl}
          />
          
          <LocationMarker userPos={userPos} />

          {routeData && (
            <Polyline positions={routeData} color="#10b981" weight={6} opacity={0.8} />
          )}

          {facilities.map((facility) => (
            <Marker 
              key={facility.id} 
              position={facility.position}
              icon={MedicalIcon}
            >
              <Popup>
                <div className="p-2 min-w-[180px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{facility.type === 'Hospital' ? '🏥' : '💊'}</span>
                    <p className="font-black text-slate-900 leading-tight">{facility.name}</p>
                  </div>
                  <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider mb-2">{facility.type}</p>
                  <p className="text-[11px] text-slate-500 font-medium truncate">{facility.address}</p>
                  <button 
                    onClick={() => fetchRoute(facility.position)}
                    className="w-full mt-3 py-2 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-slate-700 transition-colors"
                  >
                    View Route
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 max-w-[220px]">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Live Search
          </h4>
          <p className="text-[10px] text-slate-500 font-bold mb-3">
            {searchStatus}
          </p>
          <button 
            onClick={() => userPos && fetchNearbyPlaces(userPos[0], userPos[1])}
            className="w-full py-2 bg-slate-50 border border-slate-100 text-[9px] font-black uppercase text-slate-600 rounded-xl hover:bg-white hover:shadow-sm transition-all"
          >
            🔄 Refresh Nearby
          </button>
        </div>
      </div>

      <div className="w-full lg:w-80 enterprise-card p-6 flex flex-col h-[600px]">
        <div className="pb-4 border-b border-slate-100 flex justify-between items-center mb-6">
           <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Detected Nearby</h3>
           <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-md">{facilities.length}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
           {facilities.length === 0 ? (
             <div className="text-center py-20 opacity-30">
                <span className="text-3xl">📡</span>
                <p className="text-[10px] font-black uppercase tracking-widest mt-4">Scanning Area...</p>
             </div>
           ) : (
             facilities.map((facility) => (
               <div key={facility.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-lg transition-all border-l-4 border-l-emerald-500">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-lg">{facility.type === 'Hospital' ? '🏥' : '💊'}</span>
                    <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded italic">nearby</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1 line-clamp-1">{facility.name}</h4>
                  <p className="text-[10px] text-slate-500 truncate mb-3">{facility.address}</p>
                  <button 
                    onClick={() => fetchRoute(facility.position)}
                    className="w-full py-2 bg-white border border-slate-200 text-[9px] font-black uppercase tracking-widest rounded-lg hover:border-slate-900 transition-colors"
                  >
                    Find Route
                  </button>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
