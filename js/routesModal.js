export default class RoutesModal {
    constructor(shapesLayer) {
        this.shapesLayer = shapesLayer;
        this.modal = null;
    }

    open() {
        if (this.modal) return; // Модал уже открыт
        
        const routes = this.shapesLayer.getSortedRoutes();
        
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
                        <span>Скрыть все маршруты</span>
                    </li>
                    ${routes.map(route => `
                        <li class="routes-modal-item" data-route-id="${route.id}">
                            <span class="routes-modal-code">№ ${route.code}</span>
                            <span class="routes-modal-name">${route.name}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        
        // Обработчик закрытия
        this.modal.querySelector('.routes-modal-close').addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
        
        // Обработчик "Скрыть все маршруты"
        this.modal.querySelector('.routes-modal-hide-all').addEventListener('click', () => {
            this.shapesLayer.hideAll();
            this.close();
        });
        
        // Обработчики клика на маршруты
        this.modal.querySelectorAll('.routes-modal-item[data-route-id]').forEach(item => {
            item.addEventListener('click', () => {
                const routeId = parseInt(item.dataset.routeId);
                this.shapesLayer.showRoute(routeId);
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
