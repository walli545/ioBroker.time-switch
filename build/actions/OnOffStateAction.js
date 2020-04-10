"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseStateAction_1 = require("./BaseStateAction");
class OnOffStateAction extends BaseStateAction_1.BaseStateAction {
    constructor(idOfStateToSet, onValue, offValue, booleanValue, stateService) {
        super(stateService);
        if (idOfStateToSet == null || idOfStateToSet.length == 0) {
            throw new Error('IdOfStateToSet may not be null or empty.');
        }
        if (onValue == undefined) {
            throw new Error('OnValue may not be undefined.');
        }
        if (offValue == undefined) {
            throw new Error('OffValue may not be undefined.');
        }
        if (booleanValue == null) {
            throw new Error('ValueToSet may not be null or undefined.');
        }
        this.idOfStateToSet = idOfStateToSet;
        this.onValue = onValue;
        this.offValue = offValue;
        this.booleanValue = booleanValue;
    }
    getIdOfStateToSet() {
        return this.idOfStateToSet;
    }
    getOnValue() {
        return this.onValue;
    }
    getOffValue() {
        return this.offValue;
    }
    getBooleanValue() {
        return this.booleanValue;
    }
    execute() {
        const valueToUse = this.getBooleanValue() ? this.getOnValue() : this.getOffValue();
        this.getStateService().setForeignState(this.getIdOfStateToSet(), valueToUse);
    }
}
exports.OnOffStateAction = OnOffStateAction;
