"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseStateActionBuilder {
    constructor() {
        this.stateService = null;
    }
    setStateService(stateService) {
        this.stateService = stateService;
        return this;
    }
}
exports.BaseStateActionBuilder = BaseStateActionBuilder;
