export function injectStyles() {
    if (document.getElementById('leso-styles')) return;
    const css = `
:root {
    color-scheme: light only;
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
html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #ffffff;
    color: #111827;
    color-scheme: light only;
    -webkit-color-scheme: light;
}
#map { position: absolute; top: 0; bottom: 0; left: 0; right: 0; z-index: 0; background: #ffffff; }
.leaflet-control-attribution { display: none !important; }
.header {
    position: absolute; top: 0; left: 0; right: 0; z-index: 1000;
    background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(8px);
    padding: 10px 14px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    display: flex; align-items: center; justify-content: space-between;
    color: #111827;
}
.header h1 { margin: 0; font-size: 15px; font-weight: 600; color: #111827; }
.header .status { font-size: 12px; color: #6b7280; }
/* Стили для маркера автобуса (SVG) */
.bus-marker-svg { display: flex; align-items: center; justify-content: center; pointer-events: auto; }
/* Кнопки в стиле Leaflet */
.routes-button {
    background-color: #ffffff;
    color: #111827;
    border: 2px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    width: 36px;
    height: 36px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
    transition: background-color 0.2s;
}
.routes-button:hover { background-color: #f4f4f4; }
.routes-button:active { border-color: rgba(0, 0, 0, 0.12); }
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
    background: #ffffff;
    color: #111827;
    border-radius: 8px;
    width: 90%;
    height: 90%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
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
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
}
.routes-modal-header h2, .admin-modal-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #111827;
}
.routes-modal-close, .admin-modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.routes-modal-close:hover, .admin-modal-close:hover { color: #111827; }
.routes-modal-list, .admin-modal-list {
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1;
    overflow-y: auto;
    background: #ffffff;
    color: #111827;
}
.routes-modal-item, .admin-modal-item {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    cursor: pointer;
    transition: background-color 0.15s;
    display: flex;
    gap: 12px;
    align-items: center;
    color: #111827;
    background: #ffffff;
}
.routes-modal-item:hover, .admin-modal-item:hover { background-color: #f9fafb; }
.routes-modal-item:active, .admin-modal-item:active { background-color: #f3f4f6; }
.routes-modal-hide-all {
    font-weight: 600;
    background-color: #f9fafb;
}
.routes-modal-hide-all:hover { background-color: #f3f4f6; }
.routes-modal-code { font-weight: 600; color: #1976d2; min-width: 50px; }
.routes-modal-name { color: #6b7280; font-size: 14px; flex: 1; }
.routes-modal-fleet { color: #1976d2; font-size: 12px; font-weight: 500; min-width: 40px; text-align: right; }
/* Стили для метки автопарка */
.depot-marker { background: transparent !important; border: none !important; pointer-events: auto; }
.depot-icon { font-size: 28px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); }
/* Жёсткий сброс тёмной темы от WebView МАКС */
@media (prefers-color-scheme: dark) {
    :root {
        color-scheme: light only;
    }
    html, body, #map, .header, .routes-modal-content, .admin-modal-content,
    .routes-modal-list, .admin-modal-list, .routes-modal-item, .admin-modal-item,
    .routes-button {
        background: #ffffff !important;
        color: #111827 !important;
    }
}
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