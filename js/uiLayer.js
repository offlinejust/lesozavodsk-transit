import { injectStyles, createHeader } from './graphics.js';
import RoutesModal from './routesModal.js';

export default class UILayer {
    constructor(map, shapesLayer = null, vehiclesLayer = null) {
        this.map = map;
        this.shapesLayer = shapesLayer;
        this.vehiclesLayer = vehiclesLayer;
        injectStyles();
        this.header = createHeader();
        document.body.appendChild(this.header);
        this.statusEl = this.header.querySelector('#status');
        
        // Добавляем кнопки зума
        L.control.zoom({ position: 'bottomright' }).addTo(this.map);
        
        // Добавляем контрольные кнопки (скрыть маршруты + маршруты)
        if (shapesLayer && vehiclesLayer) {
            this.routesModal = new RoutesModal(shapesLayer, vehiclesLayer);
            this.addHideRoutesButton();
            this.addRoutesButton();
        }
    }

    addHideRoutesButton() {
        const HideRoutesControl = L.Control.extend({
            options: {
                position: 'bottomright'
            },
            onAdd: (map) => {
                const container = L.DomUtil.create('div', 'leaflet-bar');
                const button = L.DomUtil.create('button', 'routes-button', container);
                button.textContent = '✕';
                button.title = 'Показать все автобусы';
                
                L.DomEvent.on(button, 'click', (e) => {
                    L.DomEvent.stopPropagation(e);
                    this.shapesLayer.hideAll();
                    this.vehiclesLayer.showAllVehicles();
                });
                
                return container;
            }
        });
        
        new HideRoutesControl().addTo(this.map);
    }

    addRoutesButton() {
        const RoutesControl = L.Control.extend({
            options: {
                position: 'bottomright'
            },
            onAdd: (map) => {
                const container = L.DomUtil.create('div', 'leaflet-bar');
                const button = L.DomUtil.create('button', 'routes-button', container);
                button.textContent = '🛣️';
                button.title = 'Маршруты';
                
                L.DomEvent.on(button, 'click', (e) => {
                    L.DomEvent.stopPropagation(e);
                    this.routesModal.open();
                });
                
                return container;
            }
        });
        
        new RoutesControl().addTo(this.map);
    }

    setStatus(text) {
        if (this.statusEl) this.statusEl.textContent = text;
    }
}
