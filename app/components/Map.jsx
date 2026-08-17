"use client";

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const EMPTY_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: EMPTY_GIF,
    iconRetinaUrl: EMPTY_GIF,
    shadowUrl: EMPTY_GIF,
    iconSize: [0, 0],
    shadowSize: [0, 0],
});

function MapController({ bounds, region, zoomCommand, mapCommand }) {
    const map = useMap();
    const nationalCenterRef = useRef(null);

    useEffect(() => {
        if (!bounds || bounds.length !== 2) return;
        if (!region) {
            const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
            const centerLng = (bounds[0][1] + bounds[1][1]) / 2;
            nationalCenterRef.current = [centerLat, centerLng];
            map.flyTo([centerLat, centerLng], 9, { duration: 1.5, easeLinearity: 0.25 });
        } else {
            map.flyToBounds(bounds, { duration: 1.5, easeLinearity: 0.25 });
        }
    }, [bounds, region, map]);

    useEffect(() => {
        if (!zoomCommand) return;
        if (zoomCommand.type === 'in') map.zoomIn();
        else if (zoomCommand.type === 'out') map.zoomOut();
    }, [zoomCommand, map]);

    useEffect(() => {
        if (!mapCommand) return;
        if (mapCommand.type === 'reset') {
            const center = nationalCenterRef.current ?? [7.9, -1.2];
            map.flyTo(center, 9, { duration: 1.8, easeLinearity: 0.25 });
        } else if (mapCommand.type === 'flyTo') {
            map.flyTo([mapCommand.lat, mapCommand.lng], mapCommand.zoom ?? 13, { duration: 1.5, easeLinearity: 0.25 });
        }
    }, [mapCommand, map]);

    return null;
}

function HoverLayer({ data }) {
    const map = useMap();
    return (
        <GeoJSON
            data={data}
            style={() => ({ stroke: false, fillOpacity: 0.001 })}
            onEachFeature={(feature, layer) => {
                const name = feature.properties?.DISTRICTS || feature.properties?.REGIONS || '';
                if (!name) return;

                layer.bindTooltip(name, {
                    sticky: true,
                    permanent: false,
                    className: 'district-tooltip',
                    direction: 'top',
                    offset: [0, -4],
                });

                let idleTimer = null;

                const resetTimer = () => {
                    if (idleTimer) clearTimeout(idleTimer);
                    idleTimer = setTimeout(() => layer.closeTooltip(), 1200);
                };

                layer.on('mousemove', () => {
                    if (!layer.isTooltipOpen()) layer.openTooltip();
                    resetTimer();
                });

                layer.on('mouseout', () => {
                    if (idleTimer) clearTimeout(idleTimer);
                    layer.closeTooltip();
                });

                layer.on('click', () => {
                    map.flyToBounds(layer.getBounds(), { duration: 1.2, easeLinearity: 0.25, padding: [40, 40] });
                });
            }}
        />
    );
}

export default function MapComponent({
    year,
    region,
    district,
    activeLayers = [],
    zoomCommand,
    mapCommand,
    basemap = 'dark',
    ndviOpacity = 1,
    rehabilitationOpacity = 1,
}) {
    const [layers, setLayers] = useState({ ndvi: null, rehabilitation: null, region: null, district: null });
    const [prevLayers, setPrevLayers] = useState(null);
    const [fetchedFilters, setFetchedFilters] = useState({ year: null, region: null, district: null });
    const [bounds, setBounds] = useState(null);
    const [hoverGeoJSON, setHoverGeoJSON] = useState(null);
    const [loading, setLoading] = useState(false);
    const clearPrevLayersTimeoutRef = useRef(null);
    const latestLayersRef = useRef(layers);

    useEffect(() => {
        latestLayersRef.current = layers;
    }, [layers]);

    useEffect(() => {
        if (!year) {
            setLayers({ ndvi: null, rehabilitation: null, region: null, district: null });
            setPrevLayers(null);
            setFetchedFilters({ year: null, region: null, district: null });
            setBounds(null);
            setHoverGeoJSON(null);
            setLoading(false);
            return;
        }

        const abortController = new AbortController();

        const fetchLayers = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/gee/layers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ year, region, district }),
                    signal: abortController.signal,
                });

                if (!response.ok) throw new Error('Failed to fetch layers');

                const data = await response.json();

                if (clearPrevLayersTimeoutRef.current) {
                    clearTimeout(clearPrevLayersTimeoutRef.current);
                }

                setPrevLayers(latestLayersRef.current);
                setLayers(data.layers);
                setFetchedFilters({ year, region, district });
                setBounds(data.bounds);
                setHoverGeoJSON(data.hoverGeoJSON || null);

                clearPrevLayersTimeoutRef.current = setTimeout(() => setPrevLayers(null), 2000);
            } catch (err) {
                if (err.name === 'AbortError') return;
                console.error('Layer fetch error:', err);
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchLayers();

        return () => {
            abortController.abort();
            if (clearPrevLayersTimeoutRef.current) {
                clearTimeout(clearPrevLayersTimeoutRef.current);
                clearPrevLayersTimeoutRef.current = null;
            }
        };
    }, [year, region, district]);

    return (
        <div className="relative h-full w-full">
            {loading && (
                <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-brand-deep/30 backdrop-blur-[2px] pointer-events-none">
                    <div className="relative flex h-16 w-16 items-center justify-center">
                        <div className="canopy-ring" />
                        <div className="canopy-ring" />
                        <div className="canopy-ring" />
                        <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-brand-gold/30 bg-brand-deep/80">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(251,191,36,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 8c0-4-2.5-6-5-6S7 4 7 8c-2 0-4 1.5-4 4s2 4 4 4h10c2 0 4-1.5 4-4s-2-4-4-4z" />
                                <line x1="12" y1="16" x2="12" y2="21" />
                                <line x1="8" y1="21" x2="16" y2="21" />
                            </svg>
                        </div>
                    </div>
                    <p className="mt-4 text-[10px] font-semibold tracking-wider text-brand-gold/60">Refreshing map layers...</p>
                </div>
            )}
            <MapContainer
                center={[7.9, -1.2]}
                zoom={9}
                zoomSnap={0.5}
                className="h-full w-full bg-brand-deep"
                zoomControl={false}
            >
                <BasemapLayer type={basemap} />

                {layers.ndvi && activeLayers.includes('ndvi') && fetchedFilters.year === year && (
                    <TileLayer url={layers.ndvi} opacity={ndviOpacity} zIndex={10} />
                )}
                {layers.rehabilitation && activeLayers.includes('rehabilitation') && fetchedFilters.year === year && (
                    <TileLayer url={layers.rehabilitation} opacity={rehabilitationOpacity} zIndex={20} />
                )}
                {layers.region && activeLayers.includes('region') && fetchedFilters.region === region && (
                    <TileLayer url={layers.region} zIndex={30} />
                )}
                {layers.district && activeLayers.includes('district') && fetchedFilters.district === district && (
                    <TileLayer url={layers.district} zIndex={40} />
                )}

                {prevLayers && (
                    <>
                        {prevLayers.ndvi && activeLayers.includes('ndvi') && <TileLayer url={prevLayers.ndvi} opacity={0.3} zIndex={9} />}
                        {prevLayers.rehabilitation && activeLayers.includes('rehabilitation') && <TileLayer url={prevLayers.rehabilitation} opacity={0.3} zIndex={19} />}
                        {prevLayers.region && activeLayers.includes('region') && <TileLayer url={prevLayers.region} opacity={0.3} zIndex={29} />}
                        {prevLayers.district && activeLayers.includes('district') && <TileLayer url={prevLayers.district} opacity={0.3} zIndex={39} />}
                    </>
                )}

                {hoverGeoJSON && (
                    <HoverLayer
                        key={`${fetchedFilters.region}-${fetchedFilters.district}`}
                        data={hoverGeoJSON}
                    />
                )}

                <MapController bounds={bounds} region={region} zoomCommand={zoomCommand} mapCommand={mapCommand} />
            </MapContainer>
        </div>
    );
}

function BasemapLayer({ type }) {
    switch (type) {
        case 'satellite':
            return (
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                />
            );
        case 'osm':
            return (
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
            );
        case 'dark':
        default:
            return (
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
            );
    }
}
