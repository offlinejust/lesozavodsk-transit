import { injectStyles } from './graphics.js';
import RoutesModal from './routesModal.js';
import AdminModal from './adminModal.js';

export default class UILayer {
    constructor(map, shapesLayer = null, vehiclesLayer = null) {
        this.map = map;
        this.shapesLayer = shapesLayer;
        this.vehiclesLayer = vehiclesLayer;
        injectStyles();

        // Убираем верхнюю панель (хедер) — не создаём и не добавляем

        // Стандартные кнопки зума
        L.control.zoom({ position: 'bottomright' }).addTo(this.map);

        if (shapesLayer && vehiclesLayer) {
            this.routesModal = new RoutesModal(shapesLayer, vehiclesLayer);
            this.adminModal = new AdminModal();
            // Кастомные кнопки (маршруты, админ, скрыть всё) больше не добавляются
            // this.addHideRoutesButton();
            // this.addAdminButton();
            // this.addRoutesButton();
        }
    }

    // Метод setStatus может быть нужен для обновления статуса, но хедера нет,
    // поэтому оставляем заглушку, чтобы vehiclesLayer не падал.
    setStatus(text) {
        // Ничего не делаем
    }
}