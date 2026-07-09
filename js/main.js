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
injectStyles();
const baseMap = new BaseMap('map', LESOZAVODSK_CENTER, 13);
const map = baseMap.getMap();

const ui = new UILayer(map);
map.invalidateSize();

const shapes = new ShapesLayer(map, API_BASE);
shapes.init();

const vehicles = new VehiclesLayer(map, API_BASE, ui, UPDATE_INTERVAL);
vehicles.start();

// Экспортируем для отладки
window._LesoApp = { map, ui, shapes, vehicles };
