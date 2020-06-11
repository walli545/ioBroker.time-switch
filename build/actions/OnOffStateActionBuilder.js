"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnOffStateActionBuilder = void 0;
const BaseStateActionBuilder_1 = require("./BaseStateActionBuilder");
const OnOffStateAction_1 = require("./OnOffStateAction");
class OnOffStateActionBuilder extends BaseStateActionBuilder_1.BaseStateActionBuilder {
    constructor() {
        super(...arguments);
        this.idsOfStatesToSet = [];
        this.onValue = null;
        this.offValue = null;
        this.booleanValue = true;
    }
    setIdsOfStatesToSet(idsOfStatesToSet) {
        this.idsOfStatesToSet = idsOfStatesToSet;
        return this;
    }
    setOnValue(onValue) {
        this.onValue = onValue;
        return this;
    }
    setOffValue(offValue) {
        this.offValue = offValue;
        return this;
    }
    setBooleanValue(booleanValue) {
        this.booleanValue = booleanValue;
        return this;
    }
    setStateService(stateService) {
        super.setStateService(stateService);
        return this;
    }
    build() {
        return new OnOffStateAction_1.OnOffStateAction(this.idsOfStatesToSet, this.onValue, this.offValue, this.booleanValue, this.stateService);
    }
}
exports.OnOffStateActionBuilder = OnOffStateActionBuilder;
