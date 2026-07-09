import { ALLOWED_ADMIN_PHONES } from './adminConfig.js';

export default class AdminModal {
    constructor() {
        this.modal = null;
    }

    isAvailable() {
        if (typeof window === 'undefined') return false;

        const phone = this.getPhoneFromWebApp();
        if (!phone) return false;

        return ALLOWED_ADMIN_PHONES.includes(phone);
    }

    getPhoneFromWebApp() {
        const webApp = window.WebApp || window.TelegramWebApp || null;
        if (!webApp) return null;

        const user = webApp.initDataUnsafe && webApp.initDataUnsafe.user ? webApp.initDataUnsafe.user : null;
        if (!user || !user.phone_number) return null;

        return user.phone_number;
    }

    open() {
        if (this.modal) return;

        this.modal = document.createElement('div');
        this.modal.className = 'admin-modal';
        this.modal.innerHTML = `
            <div class="admin-modal-content">
                <div class="admin-modal-header">
                    <h2>Админ</h2>
                    <button class="admin-modal-close">✕</button>
                </div>
                <ul class="admin-modal-list">
                    <li class="admin-modal-item">
                        <span>Тестовый пункт</span>
                    </li>
                </ul>
            </div>
        `;

        document.body.appendChild(this.modal);

        this.modal.querySelector('.admin-modal-close').addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
    }

    close() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}
