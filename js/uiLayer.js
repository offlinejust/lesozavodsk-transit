import { injectStyles, createHeader } from './graphics.js';
import RoutesModal from './routesModal.js';

export default class UILayer {
    constructor(map, shapesLayer = null) {
        this.map = map;
        this.shapesLayer = shapesLayer;
        injectStyles();
        this.header = createHeader();
        document.body.appendChild(this.header);
        this.statusEl = this.header.querySelector('#status');
        
        // Добавляем кнопки зума
        L.control.zoom({ position: 'bottomright' }).addTo(this.map);
        
        // Добавляем кнопку маршрутов
        if (shapesLayer) {
            this.routesModal = new RoutesModal(shapesLayer);
            this.addRoutesButton();
        }
    }

    addRoutesButton() {
        // Создаём кастомный контрол для кнопки маршрутов
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
