export class Scene {

    constructor(initialState = 'ready') {
        this.set(initialState);
    }

    set(state) {
        if (typeof state !== 'string' || state.length === 0) throw new TypeError('Scene state must be a non-empty string');

        this.state = state;
        return this;
    }

    is(...states) {
        return states.includes(this.state);
    }
}