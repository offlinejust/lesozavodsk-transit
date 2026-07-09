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

/* Стили для маркера остановки */
.stop-marker { background: transparent !important; border: none !important; }
.stop-icon {
    background: #fff; border: 2px solid #1976d2; border-radius: 50%;
    width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
    font-size: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
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
