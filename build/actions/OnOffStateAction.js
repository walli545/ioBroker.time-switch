"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseStateAction_1 = require("./BaseStateAction");
class OnOffStateAction extends BaseStateAction_1.BaseStateAction {
    constructor(idsOfStatesToSet, onValue, offValue, booleanValue, stateService) {
        super(stateService);
        this.checkIdsOfStates(idsOfStatesToSet);
        if (onValue == undefined) {
            throw new Error('OnValue may not be undefined.');
        }
        if (offValue == undefined) {
            throw new Error('OffValue may not be undefined.');
        }
        if (booleanValue == null) {
            throw new Error('ValueToSet may not be null or undefined.');
        }
        this.idsOfStatesToSet = idsOfStatesToSet;
        this.onValue = onValue;
        this.offValue = offValue;
        this.booleanValue = booleanValue;
    }
    getIdsOfStatesToSet() {
        return this.idsOfStatesToSet;
    }
    setIdsOfStatesToSet(idsOfStatesToSet) {
        this.checkIdsOfStates(idsOfStatesToSet);
        this.idsOfStatesToSet = idsOfStatesToSet;
    }
    getOnValue() {
        return this.onValue;
    }
    setOnValue(onValue) {
        if (onValue == undefined) {
            throw new Error('OnValue may not be undefined.');
        }
        this.onValue = onValue;
    }
    getOffValue() {
        return this.offValue;
    }
    setOffValue(offValue) {
        if (offValue == undefined) {
            throw new Error('OffValue may not be undefined.');
        }
        this.offValue = offValue;
    }
    getBooleanValue() {
        return this.booleanValue;
    }
    setBooleanValue(booleanValue) {
        if (booleanValue == null) {
            throw new Error('ValueToSet may not be null or undefined.');
        }
        this.booleanValue = booleanValue;
    }
    execute() {
        const valueToUse = this.getBooleanValue() ? this.getOnValue() : this.getOffValue();
        this.getIdsOfStatesToSet().forEach(id => {
            this.getStateService().setForeignState(id, valueToUse);
        });
    }
    toBooleanValueType() {
        return new OnOffStateAction(this.getIdsOfStatesToSet(), true, false, this.getBooleanValue(), this.getStateService());
    }
    toStringValueType(onValue, offValue) {
        return new OnOffStateAction(this.getIdsOfStatesToSet(), onValue, offValue, this.getBooleanValue(), this.getStateService());
    }
    toNumberValueType(onValue, offValue) {
        return new OnOffStateAction(this.getIdsOfStatesToSet(), onValue, offValue, this.getBooleanValue(), this.getStateService());
    }
    checkIdsOfStates(ids) {
        if (ids == null || ids.length == 0 || ids.includes('')) {
            throw new Error('IdsOfStatesToSet may not be null or empty.');
        }
    }
}
exports.OnOffStateAction = OnOffStateAction;
