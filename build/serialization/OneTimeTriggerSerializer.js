"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneTimeTriggerSerializer = void 0;
const OneTimeTrigger_1 = require("../triggers/OneTimeTrigger");
const OneTimeTriggerBuilder_1 = require("../triggers/OneTimeTriggerBuilder");
class OneTimeTriggerSerializer {
    constructor(actionSerializer) {
        this.actionSerializer = actionSerializer;
    }
    deserialize(stringToDeserialize) {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            throw new Error(`Can not deserialize object of type ${json.type}`);
        }
        return new OneTimeTriggerBuilder_1.OneTimeTriggerBuilder()
            .setAction(this.actionSerializer.deserialize(JSON.stringify(json.action)))
            .setDate(new Date(Date.parse(json.date)))
            .setId(json.id)
            .build();
    }
    serialize(objectToSerialize) {
        if (objectToSerialize == null) {
            throw new Error('objectToSerialize may not be null or undefined.');
        }
        if (objectToSerialize instanceof OneTimeTrigger_1.OneTimeTrigger) {
            return JSON.stringify({
                type: this.getType(),
                date: objectToSerialize.getDate().toISOString(),
                id: objectToSerialize.getId(),
                action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getAction())),
            });
        }
        else {
            throw new Error('objectToSerialize must be of type OneTimeTrigger.');
        }
    }
    getType() {
        return OneTimeTrigger_1.OneTimeTrigger.prototype.constructor.name;
    }
}
exports.OneTimeTriggerSerializer = OneTimeTriggerSerializer;
