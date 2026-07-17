import BaseMap from './baseMap.js';
import ShapesLayer from './shapesLayer.js';
import VehiclesLayer from './vehiclesLayer.js';
import UILayer from './uiLayer.js';
import MaskManager from './maskManager.js';
import { injectStyles } from './graphics.js';

const API_BASE = 'https://диспетчер-автобусов.рф/api/public';
const LESOZAVODSK_CENTER = [45.4556, 133.4056];
const UPDATE_INTERVAL = 5000;

if (window.WebApp) {
    window.WebApp.ready();
    if (window.WebApp.expandViewport) window.WebApp.expandViewport();
}

(async () => {
    injectStyles();

    // Загрузка масок
    const maskManager = new MaskManager();
    await maskManager.load();

    const baseMap = new BaseMap('map', LESOZAVODSK_CENTER, 13);
    const map = baseMap.getMap();

    const shapes = new ShapesLayer(map, API_BASE);
    await shapes.init();

    // Передаём maskManager в VehiclesLayer
    const vehiclesInit = new VehiclesLayer(map, API_BASE, null, UPDATE_INTERVAL, LESOZAVODSK_CENTER, 13, maskManager);
    await vehiclesInit.updateVehicles();

    const ui = new UILayer(map, shapes, vehiclesInit);
    map.invalidateSize();

    const vehicles = vehiclesInit;
    vehicles.ui = ui;
    vehicles.start();

    // === Обработка start_param из URL или из WebApp ===
    try {
        const webApp = window.WebApp;
        const urlParams = new URLSearchParams(window.location.search);
        let startParam = urlParams.get('start_param');
        if (!startParam && webApp?.initDataUnsafe?.start_param) {
            startParam = webApp.initDataUnsafe.start_param;
        }
        if (startParam && typeof startParam === 'string') {
            if (startParam.startsWith('route_')) {
                const routeCode = startParam.substring('route_'.length).trim();
                if (routeCode) {
                    setTimeout(() => {
                        ui.routesModal.selectRouteByCode(routeCode);
                    }, 300);
                }
            } else if (startParam.startsWith('vehicle_')) {
                const vehicleId = startParam.substring('vehicle_'.length).trim();
                if (vehicleId) {
                    setTimeout(() => {
                        ui.routesModal.selectVehicleById(vehicleId);
                    }, 300);
                }
            }
        }
    } catch (e) {
        // Молча игнорируем ошибки
    }

    window._LesoApp = { map, ui, shapes, vehicles, maskManager };
})();