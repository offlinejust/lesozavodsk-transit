export default class ShapesLayer {
    constructor(map, apiBase) {
        this.map = map;
        this.apiBase = apiBase;
        this.routes = [];
        this.shapesByRouteId = new Map();
        this.shapeGeometries = new Map();
        this.currentVisibleRouteId = null;
    }

    async init() {
        await this.loadRoutesAndShapes();
        this.addDepotMarker();
    }

    async loadRoutesAndShapes() {
        try {
            const routes = await fetch(`${this.apiBase}/routes`).then(r => r.json());
            for (const route of routes) {
                if (!route.code) continue;
                try {
                    const shapes = await fetch(`${this.apiBase}/routes/${route.id}/shape?format=geojson`).then(r => r.json());
                    shapes.forEach(shapeItem => {
                        if (shapeItem.geojson && shapeItem.geojson.type === 'LineString') {
                            const layer = L.geoJSON(shapeItem.geojson, {
                                style: {
                                    color: '#00FF00',
                                    weight: 4,
                                    opacity: 0.95
                                }
                            });

                            this.shapesByRouteId.set(route.id, layer);
                            this.shapeGeometries.set(route.id, shapeItem.geojson);
                            this.routes.push({
                                id: route.id,
                                code: route.code,
                                name: route.name || ''
                            });
                        }
                    });
                } catch (e) {
                    console.warn(`Не удалось загрузить шейп для маршрута ${route.code}`, e);
                }
            }
        } catch (e) {
            console.error('Ошибка загрузки маршрутов', e);
        }
    }

    addDepotMarker() {
        const depotIcon = L.divIcon({
            className: 'depot-marker',
            html: '<div class="depot-icon">🏢</div>',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
        L.marker([45.450129, 133.386329], { icon: depotIcon })
            .bindPopup('Автобусный парк')
            .addTo(this.map);
    }

    showRoute(routeId, focusLatLng = null) {
        if (this.currentVisibleRouteId !== null) {
            const currentLayer = this.shapesByRouteId.get(this.currentVisibleRouteId);
            if (currentLayer) this.map.removeLayer(currentLayer);
        }

        const layer = this.shapesByRouteId.get(routeId);
        if (layer) {
            layer.addTo(this.map);
            this.currentVisibleRouteId = routeId;

            if (focusLatLng) {
                this.map.flyTo(focusLatLng, Math.max(this.map.getZoom() || 13, 15), { duration: 0.7 });
            } else {
                this.fitRouteToView(routeId);
            }
        }
    }

    fitRouteToView(routeId) {
        const geojson = this.shapeGeometries.get(routeId);
        if (!geojson || geojson.type !== 'LineString') return;

        const coords = geojson.coordinates;
        if (coords.length === 0) return;

        let minLat = coords[0][1], maxLat = coords[0][1];
        let minLon = coords[0][0], maxLon = coords[0][0];

        coords.forEach(coord => {
            minLat = Math.min(minLat, coord[1]);
            maxLat = Math.max(maxLat, coord[1]);
            minLon = Math.min(minLon, coord[0]);
            maxLon = Math.max(maxLon, coord[0]);
        });

        const bounds = L.latLngBounds(
            L.latLng(minLat, minLon),
            L.latLng(maxLat, maxLon)
        );

        this.map.fitBounds(bounds, { padding: [50, 50] });
    }

    hideAll() {
        if (this.currentVisibleRouteId !== null) {
            const layer = this.shapesByRouteId.get(this.currentVisibleRouteId);
            if (layer) this.map.removeLayer(layer);
            this.currentVisibleRouteId = null;
        }
    }

    getSortedRoutes() {
        return [...this.routes].sort((a, b) => {
            const numA = parseInt(a.code) || Infinity;
            const numB = parseInt(b.code) || Infinity;
            return numA - numB;
        });
    }
}
