"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OnOffStateActionBuilder_1 = require("../actions/OnOffStateActionBuilder");
const OnOffStateAction_1 = require("../actions/OnOffStateAction");
class OnOffStateActionSerializer {
    constructor(stateService) {
        this.builder = new OnOffStateActionBuilder_1.OnOffStateActionBuilder();
        this.builder.setStateService(stateService);
    }
    deserialize(stringToDeserialize) {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            throw new Error(`Can not deserialize object of type ${json.type}`);
        }
        if (!this.hasCorrectValueType(json)) {
            throw new Error(`Can not deserialize OnOffStateAction with value type ${json.valueType}`);
        }
        return this.builder
            .setOffValue(json.offValue)
            .setOnValue(json.onValue)
            .setBooleanValue(json.booleanValue)
            .setIdsOfStatesToSet(json.idsOfStatesToSet)
            .build();
    }
    serialize(objectToSerialize) {
        if (objectToSerialize == null) {
            throw new Error('objectToSerialize may not be null or undefined.');
        }
        if (objectToSerialize instanceof OnOffStateAction_1.OnOffStateAction) {
            return JSON.stringify({
                type: this.getType(),
                valueType: typeof objectToSerialize.getOnValue(),
                onValue: objectToSerialize.getOnValue(),
                offValue: objectToSerialize.getOffValue(),
                booleanValue: objectToSerialize.getBooleanValue(),
                idsOfStatesToSet: objectToSerialize.getIdsOfStatesToSet(),
            });
        }
        else {
            throw new Error('objectToSerialize must be of type OnOffStateAction.');
        }
    }
    getType() {
        return OnOffStateAction_1.OnOffStateAction.prototype.constructor.name;
    }
    hasCorrectValueType(json) {
        return ['string', 'number', 'boolean'].indexOf(json.valueType) != -1;
    }
}
exports.OnOffStateActionSerializer = OnOffStateActionSerializer;
