import { injectStyles, createHeader } from './graphics.js';

export default class UILayer {
    constructor(map) {
        this.map = map;
        injectStyles();
        this.header = createHeader();
        document.body.appendChild(this.header);
        this.statusEl = this.header.querySelector('#status');
        // Добавляем кнопки зума, размещаем внизу справа
        L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    }

    setStatus(text) {
        if (this.statusEl) this.statusEl.textContent = text;
    }
}
