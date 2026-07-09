import BaseMap from './baseMap.js';
import ShapesLayer from './shapesLayer.js';
import VehiclesLayer from './vehiclesLayer.js';
import UILayer from './uiLayer.js';
import { injectStyles } from './graphics.js';

// Константы
const API_BASE = 'https://диспетчер-автобусов.рф/api/public';
const LESOZAVODSK_CENTER = [45.4556, 133.4056];
const UPDATE_INTERVAL = 5000;

// Поддержка WebApp из MAX
if (window.WebApp) {
    window.WebApp.ready();
    if (window.WebApp.expandViewport) window.WebApp.expandViewport();
}

// Инициализация
(async () => {
    injectStyles();
    const baseMap = new BaseMap('map', LESOZAVODSK_CENTER, 13);
    const map = baseMap.getMap();

    const shapes = new ShapesLayer(map, API_BASE);
    await shapes.init();

    // Первый запрос данных, чтобы UILayer мог показать маршруты из активных автобусов
    const vehiclesInit = new VehiclesLayer(map, API_BASE, null, UPDATE_INTERVAL);
    await vehiclesInit.updateVehicles();

    const ui = new UILayer(map, shapes, vehiclesInit);
    map.invalidateSize();

    const vehicles = vehiclesInit; // Используем уже инициализированный VehiclesLayer
    vehicles.ui = ui; // Обновляем ссылку на UI
    vehicles.start();

    // Экспортируем для отладки
    window._LesoApp = { map, ui, shapes, vehicles };
})();
