"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseStateAction {
    constructor(stateService) {
        if (stateService == null) {
            throw new Error('StateService may not be null or undefined.');
        }
        this.stateService = stateService;
    }
    getStateService() {
        return this.stateService;
    }
}
exports.BaseStateAction = BaseStateAction;
