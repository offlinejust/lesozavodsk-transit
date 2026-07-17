export default class RoutesModal {
    constructor(shapesLayer, vehiclesLayer) {
        this.shapesLayer = shapesLayer;
        this.vehiclesLayer = vehiclesLayer;
        this.modal = null;
    }

    /**
     * Программно выделяет маршрут по его коду (route_code).
     * Используется при открытии приложения через диплинк с start_param=route_<код>.
     * Модалка при этом НЕ открывается — пользователь сразу видит карту с выделенным маршрутом.
     */
    selectRouteByCode(routeCode) {
        if (!routeCode) return;

        const routeInShapes = this.shapesLayer.routes.find(r => r.code === routeCode);
        if (!routeInShapes) {
            console.warn(`[RoutesModal] Маршрут с кодом "${routeCode}" не найден в shapesLayer`);
            return;
        }

        const focusLatLng = this.vehiclesLayer.getFirstVehicleForRoute(routeCode);
        this.shapesLayer.showRoute(routeInShapes.id, focusLatLng);
        this.vehiclesLayer.filterByRouteCode(routeCode);

        console.log(`[RoutesModal] Выделен маршрут ${routeCode}, focusLatLng:`, focusLatLng);
    }

    selectVehicleById(vehicleId) {
        if (!vehicleId) return;
        const success = this.vehiclesLayer.highlightVehicle(vehicleId);
        if (!success) {
            console.warn(`[RoutesModal] Автобус с ID "${vehicleId}" не найден`);
        }
    }

    open() {
        if (this.modal) return;

        const routes = this.vehiclesLayer.getUniqueRoutesFromVehicles();

        this.modal = document.createElement('div');
        this.modal.className = 'routes-modal';
        this.modal.innerHTML = `
            <div class="routes-modal-content">
                <div class="routes-modal-header">
                    <h2>Маршруты</h2>
                    <button class="routes-modal-close">✕</button>
                </div>
                <ul class="routes-modal-list">
                    <li class="routes-modal-item routes-modal-hide-all">
                        <span>Показать все автобусы</span>
                    </li>
                    ${routes.map(route => {
                        const firstFleet = route.vehicles[0]?.fleet_number || '—';
                        return `
                            <li class="routes-modal-item" data-route-code="${route.code}">
                                <span class="routes-modal-code">№ ${route.code}</span>
                                <span class="routes-modal-name">${route.name}</span>
                                <span class="routes-modal-fleet">${firstFleet}</span>
                            </li>
                        `;
                    }).join('')}
                </ul>
            </div>
        `;
        document.body.appendChild(this.modal);

        this.modal.querySelector('.routes-modal-close').addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        this.modal.querySelector('.routes-modal-hide-all').addEventListener('click', () => {
            this.shapesLayer.hideAll();
            this.vehiclesLayer.showAllVehicles();
            this.close();
        });

        this.modal.querySelectorAll('.routes-modal-item[data-route-code]').forEach(item => {
            item.addEventListener('click', () => {
                const routeCode = item.dataset.routeCode;
                this.selectRouteByCode(routeCode);
                this.close();
            });
        });
    }

    close() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}