export class UiText {

    static draw(context, text, x, y, options = {}) {
        if (!context || typeof context.fillText !== 'function') throw new TypeError('A Canvas 2D context is required');
        if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError('Text position must be finite');

        const { color = '#ffffff', font = '16px sans-serif', align = 'left', baseline = 'alphabetic' } = options;
        context.save();
        context.fillStyle = color;
        context.font = font;
        context.textAlign = align;
        context.textBaseline = baseline;
        context.fillText(String(text), x, y);
        context.restore();
    }
}