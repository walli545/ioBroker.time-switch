"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IoBrokerStateService {
    constructor(adapter) {
        if (!adapter) {
            throw new Error('adapter may not be null.');
        }
        this.adapter = adapter;
    }
    setState(id, value) {
        if (id == null || id.length === 0) {
            throw new Error('id may not be null or empty.');
        }
        this.adapter.setState(id, value, false);
    }
    setForeignState(id, value) {
        if (id == null || id.length === 0) {
            throw new Error('id may not be null or empty.');
        }
        this.adapter.setForeignState(id, value, false);
    }
}
exports.IoBrokerStateService = IoBrokerStateService;
