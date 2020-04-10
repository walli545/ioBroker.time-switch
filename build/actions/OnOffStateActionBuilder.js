"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseStateActionBuilder_1 = require("./BaseStateActionBuilder");
const OnOffStateAction_1 = require("./OnOffStateAction");
class OnOffStateActionBuilder extends BaseStateActionBuilder_1.BaseStateActionBuilder {
    constructor() {
        super(...arguments);
        this.idOfStateToSet = '';
        this.onValue = null;
        this.offValue = null;
        this.booleanValue = true;
    }
    setIdOfStateToSet(idOfStateToSet) {
        this.idOfStateToSet = idOfStateToSet;
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
        return new OnOffStateAction_1.OnOffStateAction(this.idOfStateToSet, this.onValue, this.offValue, this.booleanValue, this.stateService);
    }
}
exports.OnOffStateActionBuilder = OnOffStateActionBuilder;
