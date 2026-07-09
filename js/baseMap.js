export default class BaseMap {
    constructor(containerId, center = [45.4556, 133.4056], zoom = 13) {
        this.map = L.map(containerId, { center, zoom, zoomControl: false, attributionControl: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);
    }

    getMap() {
        return this.map;
    }
}
