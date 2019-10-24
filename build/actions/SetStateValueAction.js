"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SetStateValueAction {
    constructor(id, trigger, idOfStateToSet, valueToSet, stateService) {
        if (id == null || id == undefined || id.length == 0) {
            throw new Error('Id may not be null or empty.');
        }
        if (trigger == null || trigger == undefined) {
            throw new Error('Trigger may not be null or undefined.');
        }
        if (idOfStateToSet == null || idOfStateToSet == undefined || idOfStateToSet.length == 0) {
            throw new Error('IdOfStateToSet may not be null or empty.');
        }
        if (valueToSet == undefined) {
            throw new Error('ValueToSet may not be undefined.');
        }
        if (stateService == null || stateService == undefined) {
            throw new Error('StateService may not be null or undefined.');
        }
        this.id = id;
        this.trigger = trigger;
        this.idOfStateToSet = idOfStateToSet;
        this.valueToSet = valueToSet;
        this.stateService = stateService;
    }
    getId() {
        return this.id;
    }
    getTrigger() {
        return this.trigger;
    }
    getIdOfStateToSet() {
        return this.idOfStateToSet;
    }
    getValueToSet() {
        return this.valueToSet;
    }
    execute() {
        this.stateService.setState(this.getIdOfStateToSet(), this.getValueToSet());
    }
}
exports.SetStateValueAction = SetStateValueAction;
