export default class VehiclesLayer {
    constructor(map, apiBase, ui = null, updateInterval = 5000, defaultViewCenter = null, defaultViewZoom = 13) {
        this.map = map;
        this.apiBase = apiBase;
        this.ui = ui;
        this.vehicles = new Map();
        this._interval = null;
        this.updateInterval = updateInterval;
        this.filteredRouteCode = null;
        this.defaultViewCenter = defaultViewCenter;
        this.defaultViewZoom = defaultViewZoom;
    }

    normalizeData(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        const normalized = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const val = obj[key];
                normalized[key.trim()] = typeof val === 'string' ? val.trim() : val;
            }
        }
        return normalized;
    }

    createBusIcon(data) {
        const d = this.normalizeData(data);
        const fleet = d.fleet_number || '—';
        const routeCode = d.route_code || '?';
        const routeName = d.route_name || '';
        const course = d.course_deg || 0;
        const displayName = routeName.substring(0, 16);

        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
<defs>
    <style>
        .bus-text { overflow: hidden; text-overflow: ellipsis; }
    </style>
</defs>
<rect x="22" y="9" width="136" height="54" rx="4" fill="rgba(255, 255, 255, 0.95)" stroke="#1976d2" stroke-width="1.2" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))"/>
<text x="90" y="28" font-size="15" font-weight="700" fill="#0d47a1" text-anchor="middle" font-family="Arial,sans-serif" class="bus-text">№ ${routeCode}</text>
<text x="90" y="43" font-size="11" font-weight="500" fill="#555" text-anchor="middle" font-family="Arial,sans-serif" class="bus-text">${displayName}</text>
<text x="90" y="56" font-size="11" font-weight="500" fill="#333" text-anchor="middle" font-family="Arial,sans-serif" class="bus-text">${fleet}</text>
<g transform="translate(90, 90) rotate(${course}) translate(-90, -90)">
    <path d="M 90 72 L 102 108 L 90 99 L 78 108 Z" fill="#1976d2" stroke="#fff" stroke-width="2" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.5))"/>
</g>
</svg>
`;

        return L.divIcon({
            className: 'bus-marker-svg',
            html: svg,
            iconSize: [180, 180],
            iconAnchor: [90, 90]
        });
    }

    async updateVehicles() {
        try {
            const response = await fetch(`${this.apiBase}/vehicles`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const seenIds = new Set();
            for (const rawItem of data) {
                const item = this.normalizeData(rawItem);
                if (item.lat == null || item.lon == null) continue;
                if (!item.route_code || item.route_code.trim() === '') continue;
                const id = item.vehicle_id;
                seenIds.add(id);
                const shouldShow = !this.filteredRouteCode || item.route_code === this.filteredRouteCode;
                if (this.vehicles.has(id)) {
                    const entry = this.vehicles.get(id);
                    entry.marker.setLatLng([item.lat, item.lon]);
                    entry.marker.setIcon(this.createBusIcon(item));
                    entry.data = item;
                    if (shouldShow) {
                        if (!this.map.hasLayer(entry.marker)) this.map.addLayer(entry.marker);
                    } else {
                        if (this.map.hasLayer(entry.marker)) this.map.removeLayer(entry.marker);
                    }
                } else {
                    const marker = L.marker([item.lat, item.lon], { icon: this.createBusIcon(item) });
                    if (shouldShow) marker.addTo(this.map);
                    this.vehicles.set(id, { marker, data: item });
                }
            }
            for (const [id, entry] of this.vehicles) {
                if (!seenIds.has(id)) {
                    this.map.removeLayer(entry.marker);
                    this.vehicles.delete(id);
                }
            }
            const statusText = `онлайн: ${this.vehicles.size} ТС`;
            if (this.ui && typeof this.ui.setStatus === 'function') this.ui.setStatus(statusText);
        } catch (e) {
            console.error(e);
            if (this.ui && typeof this.ui.setStatus === 'function') this.ui.setStatus('ошибка загрузки');
        }
    }

    filterByRouteCode(routeCode) {
        this.filteredRouteCode = routeCode;
        this.updateVehiclesVisibility();
    }

    showAllVehicles() {
        this.filteredRouteCode = null;
        this.updateVehiclesVisibility();
        if (this.defaultViewCenter) {
            this.map.setView(this.defaultViewCenter, this.defaultViewZoom);
        }
    }

    updateVehiclesVisibility() {
        for (const [, entry] of this.vehicles) {
            const shouldShow = !this.filteredRouteCode || entry.data.route_code === this.filteredRouteCode;
            if (shouldShow) {
                if (!this.map.hasLayer(entry.marker)) this.map.addLayer(entry.marker);
            } else {
                if (this.map.hasLayer(entry.marker)) this.map.removeLayer(entry.marker);
            }
        }
    }

    getUniqueRoutesFromVehicles() {
        const routes = new Map();
        for (const [, entry] of this.vehicles) {
            const { route_code, route_name } = entry.data;
            if (!route_code) continue;
            if (!routes.has(route_code)) {
                routes.set(route_code, { code: route_code, name: route_name || '', vehicles: [] });
            }
            routes.get(route_code).vehicles.push(entry.data);
        }
        return Array.from(routes.values()).sort((a, b) => {
            const numA = parseInt(a.code) || Infinity;
            const numB = parseInt(b.code) || Infinity;
            return numA - numB;
        });
    }

    getFirstVehicleForRoute(routeCode) {
        for (const [, entry] of this.vehicles) {
            if (entry.data.route_code === routeCode && entry.data.lat != null && entry.data.lon != null) {
                return [entry.data.lat, entry.data.lon];
            }
        }
        return null;
    }

    start() {
        this.updateVehicles();
        this._interval = setInterval(() => this.updateVehicles(), this.updateInterval);
    }

    stop() {
        if (this._interval) clearInterval(this._interval);
        this._interval = null;
    }
}