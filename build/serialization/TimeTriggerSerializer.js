"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TimeTrigger_1 = require("../triggers/TimeTrigger");
const BaseTriggerSerializer_1 = require("./BaseTriggerSerializer");
const TimeTriggerBuilder_1 = require("../triggers/TimeTriggerBuilder");
class TimeTriggerSerializer extends BaseTriggerSerializer_1.BaseTriggerSerializer {
    deserialize(stringToDeserialize) {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            throw new Error(`Can not deserialize object of type ${json.type}`);
        }
        return new TimeTriggerBuilder_1.TimeTriggerBuilder()
            .setAction(this.deserializeAction(JSON.stringify(json.action)))
            .setHour(json.hour)
            .setMinute(json.minute)
            .setWeekdays(json.weekdays)
            .setId(json.id)
            .build();
    }
    serialize(objectToSerialize) {
        if (objectToSerialize == null) {
            throw new Error('objectToSerialize may not be null or undefined.');
        }
        if (objectToSerialize instanceof TimeTrigger_1.TimeTrigger) {
            return JSON.stringify({
                type: this.getType(),
                hour: objectToSerialize.getHour(),
                minute: objectToSerialize.getMinute(),
                weekdays: objectToSerialize.getWeekdays(),
                id: objectToSerialize.getId(),
                action: JSON.parse(this.serializeAction(objectToSerialize.getAction())),
            });
        }
        else {
            throw new Error('objectToSerialize must be of type TimeTrigger.');
        }
    }
    getType() {
        return TimeTrigger_1.TimeTrigger.prototype.constructor.name;
    }
}
exports.TimeTriggerSerializer = TimeTriggerSerializer;
