"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AstroTrigger_1 = require("../triggers/AstroTrigger");
const AstroTriggerBuilder_1 = require("../triggers/AstroTriggerBuilder");
class AstroTriggerSerializer {
    constructor(actionSerializer) {
        this.actionSerializer = actionSerializer;
    }
    deserialize(stringToDeserialize) {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            throw new Error(`Can not deserialize object of type ${json.type}`);
        }
        return new AstroTriggerBuilder_1.AstroTriggerBuilder()
            .setAction(this.actionSerializer.deserialize(JSON.stringify(json.action)))
            .setAstroTime(json.astroTime)
            .setShift(json.shiftInMinutes)
            .setWeekdays(json.weekdays)
            .setId(json.id)
            .build();
    }
    serialize(objectToSerialize) {
        if (objectToSerialize == null) {
            throw new Error('objectToSerialize may not be null or undefined.');
        }
        if (objectToSerialize instanceof AstroTrigger_1.AstroTrigger) {
            return JSON.stringify({
                type: this.getType(),
                astroTime: objectToSerialize.getAstroTime(),
                shiftInMinutes: objectToSerialize.getShiftInMinutes(),
                weekdays: objectToSerialize.getWeekdays(),
                id: objectToSerialize.getId(),
                action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getAction())),
            });
        }
        else {
            throw new Error('objectToSerialize must be of type AstroTrigger.');
        }
    }
    getType() {
        return AstroTrigger_1.AstroTrigger.prototype.constructor.name;
    }
}
exports.AstroTriggerSerializer = AstroTriggerSerializer;
