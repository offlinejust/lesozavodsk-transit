export default class MaskManager {
    constructor() {
        this.masks = null;
        this.loaded = false;
    }

    async load() {
        if (this.loaded) return;
        try {
            const response = await fetch('./title_mask.json');
            if (!response.ok) throw new Error('Не удалось загрузить маски');
            this.masks = await response.json();
            this.loaded = true;
        } catch (e) {
            this.masks = { masks: {} };
            this.loaded = true;
        }
    }

    applyMask(field, value) {
        if (!this.masks || !this.masks.masks || !this.masks.masks[field]) {
            return value;
        }
        const fieldMasks = this.masks.masks[field];
        let result = value;
        for (const mask of fieldMasks) {
            try {
                const regex = new RegExp(mask.pattern);
                result = result.replace(regex, mask.replacement);
            } catch (e) {
                // Игнорируем ошибки масок
            }
        }
        return result;
    }

    applyAllMasks(data) {
        if (!data || typeof data !== 'object') return data;
        const masked = { ...data };
        for (const field in this.masks.masks) {
            if (masked[field] !== undefined && masked[field] !== null) {
                masked[field] = this.applyMask(field, String(masked[field]));
            }
        }
        return masked;
    }
}