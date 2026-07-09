export default class VehiclesLayer {
    constructor(map, apiBase, ui = null, updateInterval = 5000) {
        this.map = map;
        this.apiBase = apiBase;
        this.ui = ui;
        this.vehicles = new Map();
        this._interval = null;
        this.updateInterval = updateInterval;
        this.filteredRouteCode = null; // Текущий отфильтрованный маршрут
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

        const label = `
            <div class="bus-label">
                <span class="route-code">№ ${routeCode}</span>
                <span class="route-name">${routeName}</span>
                <span class="fleet">${fleet}</span>
            </div>
        `;
        const arrowSvg = `
            <svg class="bus-arrow" viewBox="0 0 24 24" style="transform: rotate(${course}deg);">
                <path d="M12 2 L20 20 L12 15 L4 20 Z" fill="#1976d2" stroke="#fff" stroke-width="1.5"/>
            </svg>
        `;

        return L.divIcon({
            className: 'bus-marker',
            html: label + arrowSvg,
            iconSize: [120, 80],
            iconAnchor: [60, 60]
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

                // Если установлен фильтр маршрута, показываем только автобусы этого маршрута
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

    // Фильтровать по маршруту по коду маршрута
    filterByRouteCode(routeCode) {
        this.filteredRouteCode = routeCode;
        this.updateVehiclesVisibility();
    }

    // Показать все автобусы (убрать фильтр)
    showAllVehicles() {
        this.filteredRouteCode = null;
        this.updateVehiclesVisibility();
    }

    // Обновить видимость автобусов в соответствии с текущим фильтром
    updateVehiclesVisibility() {
        for (const [id, entry] of this.vehicles) {
            const shouldShow = !this.filteredRouteCode || entry.data.route_code === this.filteredRouteCode;
            if (shouldShow) {
                if (!this.map.hasLayer(entry.marker)) this.map.addLayer(entry.marker);
            } else {
                if (this.map.hasLayer(entry.marker)) this.map.removeLayer(entry.marker);
            }
        }
    }

    // Получить список уникальных маршрутов из текущих автобусов, отсортированный
    getUniqueRoutesFromVehicles() {
        const routes = new Map(); // routeCode -> { code, name, fleetCount }
        for (const [, entry] of this.vehicles) {
            const { route_code, route_name } = entry.data;
            if (!route_code) continue;
            if (!routes.has(route_code)) {
                routes.set(route_code, { code: route_code, name: route_name || '', vehicles: [] });
            }
            routes.get(route_code).vehicles.push(entry.data);
        }

        // Сортируем по числовому коду
        return Array.from(routes.values()).sort((a, b) => {
            const numA = parseInt(a.code) || Infinity;
            const numB = parseInt(b.code) || Infinity;
            return numA - numB;
        });
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
