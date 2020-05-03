"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IoBrokerStateService {
    constructor(adapter, logger) {
        this.logger = logger;
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
        var _a;
        if (id == null || id.length === 0) {
            throw new Error('id may not be null or empty.');
        }
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.logDebug(`Setting state ${id} with value ${value === null || value === void 0 ? void 0 : value.toString()}`);
        this.adapter.setForeignState(id, value, false);
    }
}
exports.IoBrokerStateService = IoBrokerStateService;
