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
    
    window._LesoApp = { map, ui, shapes, vehicles, maskManager };
})();