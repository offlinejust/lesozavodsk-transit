export function injectStyles() {
    if (document.getElementById('leso-styles')) return;
    const css = `
html, body { margin: 0; padding: 0; height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
#map { position: absolute; top: 0; bottom: 0; left: 0; right: 0; z-index: 0; }

.leaflet-control-attribution { display: none !important; }

.header {
    position: absolute; top: 0; left: 0; right: 0; z-index: 1000;
    background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(8px);
    padding: 10px 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    display: flex; align-items: center; justify-content: space-between;
}
.header h1 { margin: 0; font-size: 15px; font-weight: 600; }
.header .status { font-size: 12px; color: #666; }

/* Стили для маркера автобуса */
.bus-marker { display: flex; flex-direction: column; align-items: center; pointer-events: auto; }
.bus-label {
    background: rgba(255, 255, 255, 0.95); border: 1px solid #1976d2; border-radius: 6px;
    padding: 3px 6px; font-size: 10px; font-weight: 600; color: #0d47a1;
    margin-bottom: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    text-align: center; line-height: 1.2; max-width: 140px; word-wrap: break-word;
}
.bus-label .route-code { display: block; font-size: 12px; color: #1976d2; font-weight: bold; }
.bus-label .route-name { display: block; font-size: 9px; color: #555; font-weight: 500; }
.bus-label .fleet { display: block; font-size: 9px; color: #333; font-weight: 500; }
.bus-arrow {
    width: 24px; height: 24px;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
    transition: transform 1.5s linear;
}

/* Кнопка маршрутов в стиле Leaflet */
.routes-button {
    background-color: white;
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    width: 36px;
    height: 36px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
    transition: background-color 0.2s;
}
.routes-button:hover {
    background-color: #f4f4f4;
}
.routes-button:active {
    border-color: rgba(0, 0, 0, 0.3);
}

/* Модальное окно маршрутов */
.routes-modal {
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

.routes-modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    height: 90%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
}

@media (max-width: 600px) {
    .routes-modal-content {
        width: 100%;
        height: 100%;
        border-radius: 0;
        max-width: none;
    }
}

.routes-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;
    flex-shrink: 0;
}

.routes-modal-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}

.routes-modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.routes-modal-close:hover {
    color: #000;
}

.routes-modal-list {
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1;
    overflow-y: auto;
}

.routes-modal-item {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.15s;
    display: flex;
    gap: 12px;
    align-items: center;
}

.routes-modal-item:hover {
    background-color: #f9f9f9;
}

.routes-modal-item:active {
    background-color: #f0f0f0;
}

.routes-modal-hide-all {
    font-weight: 600;
    background-color: #f5f5f5;
}

.routes-modal-hide-all:hover {
    background-color: #efefef;
}

.routes-modal-code {
    font-weight: 600;
    color: #1976d2;
    min-width: 50px;
}

.routes-modal-name {
    color: #555;
    font-size: 14px;
    flex: 1;
}

.routes-modal-count {
    color: #999;
    font-size: 12px;
    min-width: 30px;
    text-align: right;
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

