export default class ShapesLayer {
    constructor(map, apiBase) {
        this.map = map;
        this.apiBase = apiBase;
        this.routeLayers = [];
    }

    async init() {
        await this.loadRoutesAndShapes();
        await this.loadStops();
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
                                    color: this.getRouteColor(route.code),
                                    weight: 4,
                                    opacity: 0.6
                                }
                            }).addTo(this.map);
                            this.routeLayers.push(layer);
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

    // Пока остановки берём локально из stops.json (если есть)
    async loadStops() {
        try {
            const stops = await fetch('stops.json').then(r => r.json());
            stops.forEach(stop => {
                L.marker([stop.lat, stop.lon], {
                    icon: L.divIcon({
                        className: 'stop-marker',
                        html: '<div class="stop-icon">🚏</div>',
                        iconSize: [22, 22],
                        iconAnchor: [11, 11]
                    })
                }).bindPopup(`<b>Остановка:</b><br>${stop.name}`).addTo(this.map);
            });
        } catch (e) {
            console.log('stops.json не найден в репозитории, пропускаем отрисовку остановок.');
        }
    }

    getRouteColor(code) {
        let hash = 0;
        for (let i = 0; i < code.length; i++) {
            hash = code.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#' + ('000000' + (hash & 0xFFFFFF).toString(16)).slice(-6);
        return color;
    }
}
