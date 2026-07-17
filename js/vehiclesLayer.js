export default class VehiclesLayer {
    constructor(map, apiBase, ui = null, updateInterval = 5000, defaultViewCenter = null, defaultViewZoom = 13, maskManager = null) {
        this.map = map;
        this.apiBase = apiBase;
        this.ui = ui;
        this.vehicles = new Map();
        this._interval = null;
        this.updateInterval = updateInterval;
        this.filteredRouteCode = null;
        this.filteredVehicleId = null; // <-- новая строка
        this.defaultViewCenter = defaultViewCenter;
        this.defaultViewZoom = defaultViewZoom;
        this.maskManager = maskManager;
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

    /**
     * Разбивает текст на строки, каждая не длиннее maxLen символов (приблизительно).
     * Возвращает массив строк (максимум 3).
     */
    splitTextIntoLines(text, maxLen = 18) {
        if (!text) return [''];
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const lines = [];
        let currentLine = '';
        for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            if (testLine.length <= maxLen) {
                currentLine = testLine;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        }
        if (currentLine) lines.push(currentLine);
        while (lines.length < 3) lines.push('');
        return lines.slice(0, 3);
    }

    /**
     * Вычисляет высоту прямоугольника в зависимости от количества непустых строк.
     */
    getRectHeight(lines) {
        const nonEmpty = lines.filter(l => l.length > 0).length;
        return 45 + (nonEmpty - 1) * 13;
    }

    createBusIconElements(data) {
        const d = this.normalizeData(data);
        const routeCode = d.route_code || '?';
        const routeName = d.route_name || '';
        const course = d.course_deg || 0;

        const lines = this.splitTextIntoLines(routeName, 18);
        const rectHeight = this.getRectHeight(lines);

        const container = document.createElement('div');
        container.className = 'bus-marker-svg';

        let nameTexts = '';
        const yPositions = [43, 56, 69];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i]) {
                nameTexts += `<text x="90" y="${yPositions[i]}" font-size="11" font-weight="500" fill="#555" text-anchor="middle" font-family="Arial,sans-serif" class="bus-name-${i}">${lines[i]}</text>`;
            }
        }

        container.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
    <rect x="22" y="9" width="136" height="${rectHeight}" rx="4" fill="rgba(255, 255, 255, 0.95)" stroke="#1976d2" stroke-width="1.2" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))"/>
    <text x="90" y="28" font-size="15" font-weight="700" fill="#0d47a1" text-anchor="middle" font-family="Arial,sans-serif" class="bus-route">№ ${routeCode}</text>
    ${nameTexts}
    <g class="bus-arrow" transform="translate(90, 90) rotate(${course}) translate(-90, -90)">
        <path d="M 90 72 L 102 108 L 90 99 L 78 108 Z" fill="#1976d2" stroke="#fff" stroke-width="2" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.5))"/>
    </g>
</svg>
        `;

        const svg = container.querySelector('svg');
        const rectEl = svg.querySelector('rect');
        const routeEl = svg.querySelector('.bus-route');
        const nameEls = [
            svg.querySelector('.bus-name-0'),
            svg.querySelector('.bus-name-1'),
            svg.querySelector('.bus-name-2')
        ].filter(el => el !== null);
        const arrowEl = svg.querySelector('.bus-arrow');

        return {
            container,
            rectEl,
            routeEl,
            nameEls,
            arrowEl,
            lastData: { routeCode, routeName, course }
        };
    }

    updateBusIconElements(elements, data) {
        const d = this.normalizeData(data);
        const newRoute = d.route_code || '?';
        const newName = d.route_name || '';
        const newCourse = d.course_deg || 0;

        if (elements.routeEl.textContent !== `№ ${newRoute}`) {
            elements.routeEl.textContent = `№ ${newRoute}`;
        }

        const lines = this.splitTextIntoLines(newName, 18);
        const newRectHeight = this.getRectHeight(lines);
        if (elements.rectEl.getAttribute('height') !== String(newRectHeight)) {
            elements.rectEl.setAttribute('height', newRectHeight);
        }

        for (let i = 0; i < 3; i++) {
            const el = elements.nameEls[i];
            if (el) {
                const newText = lines[i] || '';
                if (el.textContent !== newText) {
                    el.textContent = newText;
                }
            }
        }

        elements.arrowEl.setAttribute('transform', `translate(90, 90) rotate(${newCourse}) translate(-90, -90)`);
        elements.lastData = { routeCode: newRoute, routeName: newName, course: newCourse };
    }

    createMarker(data) {
        const elements = this.createBusIconElements(data);
        const icon = L.divIcon({
            className: 'bus-marker-svg',
            html: elements.container.innerHTML,
            iconSize: [180, 180],
            iconAnchor: [90, 90]
        });
        const marker = L.marker([data.lat, data.lon], { icon });
        marker._busElements = elements;
        return marker;
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

                const maskedItem = this.maskManager
                    ? this.maskManager.applyAllMasks(item)
                    : item;

                const id = maskedItem.vehicle_id;
                seenIds.add(id);
                let shouldShow = true;
                if (this.filteredVehicleId) {
                    shouldShow = (id === this.filteredVehicleId);
                } else if (this.filteredRouteCode) {
                    shouldShow = (maskedItem.route_code === this.filteredRouteCode);
                }

                if (this.vehicles.has(id)) {
                    const entry = this.vehicles.get(id);
                    entry.marker.setLatLng([maskedItem.lat, maskedItem.lon]);
                    this.updateBusIconElements(entry.marker._busElements, maskedItem);

                    if (shouldShow) {
                        if (!this.map.hasLayer(entry.marker)) this.map.addLayer(entry.marker);
                    } else {
                        if (this.map.hasLayer(entry.marker)) this.map.removeLayer(entry.marker);
                    }
                } else {
                    const marker = this.createMarker(maskedItem);
                    if (shouldShow) marker.addTo(this.map);
                    this.vehicles.set(id, { marker, data: maskedItem });
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
            if (this.ui && typeof this.ui.setStatus === 'function') this.ui.setStatus('ошибка загрузки');
        }
    }

    filterByRouteCode(routeCode) {
        this.filteredRouteCode = routeCode;
        this.filteredVehicleId = null; // сбрасываем фильтр по ТС
        this.updateVehiclesVisibility();
    }

    filterByVehicleId(vehicleId) {
        this.filteredVehicleId = vehicleId;
        this.filteredRouteCode = null; // сбрасываем фильтр по маршруту
        this.updateVehiclesVisibility();
    }

    showAllVehicles() {
        this.filteredRouteCode = null;
        this.filteredVehicleId = null;
        this.updateVehiclesVisibility();
        if (this.defaultViewCenter) {
            this.map.setView(this.defaultViewCenter, this.defaultViewZoom);
        }
    }

    updateVehiclesVisibility() {
        for (const [id, entry] of this.vehicles) {
            let shouldShow = true;
            if (this.filteredVehicleId) {
                shouldShow = (id === this.filteredVehicleId);
            } else if (this.filteredRouteCode) {
                shouldShow = (entry.data.route_code === this.filteredRouteCode);
            }
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

    getVehicleById(vehicleId) {
        return this.vehicles.get(vehicleId) || null;
    }

    highlightVehicle(vehicleId) {
        const entry = this.getVehicleById(vehicleId);
        if (!entry) return false;

        const data = entry.data;
        const latlng = [data.lat, data.lon];

        // Фильтруем, чтобы показывать только этот автобус
        this.filterByVehicleId(vehicleId);

        // Показываем шейп маршрута, если есть
        if (data.route_id && this.ui && this.ui.shapesLayer) {
            // Сначала показываем шейп, он делает fitBounds по всему маршруту
            this.ui.shapesLayer.showRoute(data.route_id, latlng);
            // Затем увеличиваем зум на 2 уровня, чтобы шейп был виден частично
            setTimeout(() => {
                const currentZoom = this.map.getZoom();
                this.map.flyTo(latlng, Math.min(currentZoom + 2, 18), { duration: 0.7 });
            }, 300); // небольшая задержка, чтобы fitBounds успел отработать
        } else {
            // Если шейпа нет – просто центрируем на автобусе с умеренным зумом
            this.map.flyTo(latlng, 15, { duration: 0.7 });
        }

        return true;
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