export default class BaseMap {
    constructor(containerId, center = [45.4556, 133.4056], zoom = 13) {
        this.map = L.map(containerId, {
            center,
            zoom,
            zoomControl: false,
            attributionControl: false
        });

        // CARTO Voyager — детализированная подложка с номерами домов
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 19,
            attribution: '© OSM © CARTO'
        }).addTo(this.map);
    }

    getMap() {
        return this.map;
    }
}