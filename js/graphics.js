export function injectStyles() {
    if (document.getElementById('leso-styles')) return;
    const css = `
:root {
    color-scheme: light dark;
    --app-bg: #ffffff;
    --app-surface: rgba(255, 255, 255, 0.92);
    --app-text: #111827;
    --app-muted: #6b7280;
    --app-border: rgba(0, 0, 0, 0.12);
    --app-button-bg: #ffffff;
    --app-button-hover: #f4f4f4;
    --app-modal-bg: #ffffff;
    --app-modal-border: #e5e7eb;
    --app-item-hover: #f9fafb;
    --app-item-active: #f3f4f6;
    --app-accent: #1976d2;
    --app-accent-soft: #60a5fa;
    --app-shadow: rgba(0, 0, 0, 0.15);
}

@media (prefers-color-scheme: dark) {
    :root {
        --app-bg: #0f172a;
        --app-surface: rgba(15, 23, 42, 0.94);
        --app-text: #f3f4f6;
        --app-muted: #94a3b8;
        --app-border: rgba(255, 255, 255, 0.14);
        --app-button-bg: #1f2937;
        --app-button-hover: #334155;
        --app-modal-bg: #111827;
        --app-modal-border: #374151;
        --app-item-hover: #1f2937;
        --app-item-active: #273449;
        --app-accent: #60a5fa;
        --app-accent-soft: #93c5fd;
        --app-shadow: rgba(0, 0, 0, 0.35);
    }
}

html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--app-bg);
    color: var(--app-text);
}

#map { position: absolute; top: 0; bottom: 0; left: 0; right: 0; z-index: 0; }
.leaflet-control-attribution { display: none !important; }

.header {
    position: absolute; top: 0; left: 0; right: 0; z-index: 1000;
    background: var(--app-surface); backdrop-filter: blur(8px);
    padding: 10px 14px; box-shadow: 0 2px 6px var(--app-shadow);
    display: flex; align-items: center; justify-content: space-between;
}
.header h1 { margin: 0; font-size: 15px; font-weight: 600; color: var(--app-text); }
.header .status { font-size: 12px; color: var(--app-muted); }

/* Стили для маркера автобуса (SVG) */
.bus-marker-svg { display: flex; align-items: center; justify-content: center; pointer-events: auto; }

/* Кнопки в стиле Leaflet */
.routes-button {
    background-color: var(--app-button-bg);
    color: var(--app-text);
    border: 2px solid var(--app-border);
    border-radius: 4px;
    width: 36px;
    height: 36px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 5px var(--app-shadow);
    transition: background-color 0.2s;
}
.routes-button:hover { background-color: var(--app-button-hover); }
.routes-button:active { border-color: var(--app-border); }

/* Модальное окно маршрутов */
.routes-modal, .admin-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.routes-modal-content, .admin-modal-content {
    background: var(--app-modal-bg);
    color: var(--app-text);
    border-radius: 8px;
    width: 90%;
    height: 90%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 25px var(--app-shadow);
}

@media (max-width: 600px) {
    .routes-modal-content, .admin-modal-content {
        width: 100%;
        height: 100%;
        border-radius: 0;
        max-width: none;
    }
}

.routes-modal-header, .admin-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--app-modal-border);
    flex-shrink: 0;
}

.routes-modal-header h2, .admin-modal-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}

.routes-modal-close, .admin-modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--app-muted);
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.routes-modal-close:hover, .admin-modal-close:hover { color: var(--app-text); }

.routes-modal-list, .admin-modal-list {
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1;
    overflow-y: auto;
}

.routes-modal-item, .admin-modal-item {
    padding: 12px 16px;
    border-bottom: 1px solid var(--app-modal-border);
    cursor: pointer;
    transition: background-color 0.15s;
    display: flex;
    gap: 12px;
    align-items: center;
}

.routes-modal-item:hover, .admin-modal-item:hover { background-color: var(--app-item-hover); }
.routes-modal-item:active, .admin-modal-item:active { background-color: var(--app-item-active); }

.routes-modal-hide-all {
    font-weight: 600;
    background-color: var(--app-item-hover);
}

.routes-modal-hide-all:hover { background-color: var(--app-item-active); }
.routes-modal-code { font-weight: 600; color: var(--app-accent); min-width: 50px; }
.routes-modal-name { color: var(--app-muted); font-size: 14px; flex: 1; }
.routes-modal-fleet { color: var(--app-accent); font-size: 12px; font-weight: 500; min-width: 40px; text-align: right; }

/* Стили для метки автопарка */
.depot-marker { background: transparent !important; border: none !important; pointer-events: auto; }
.depot-icon { font-size: 28px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); }
`;
    const style = document.createElement('style');
    style.id = 'leso-styles';
    style.innerHTML = css;
    document.head.appendChild(style);
}

export function createHeader() {
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = `
        <h1>🚌 Лесозаводск: транспорт</h1>
        <div class="status" id="status">загрузка...</div>
    `;
    return header;
}

