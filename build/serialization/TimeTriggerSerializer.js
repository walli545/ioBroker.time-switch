"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TimeTrigger_1 = require("../triggers/TimeTrigger");
class TimeTriggerSerializer {
    deserialize(stringToDeserialize) {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== TimeTriggerSerializer.TYPE) {
            throw new Error('Type must be time.');
        }
        return new TimeTrigger_1.TimeTrigger(json.hour, json.minute, json.weekdays);
    }
    serialize(objectToSerialize) {
        if (!objectToSerialize) {
            throw new Error('objectToSerialize may not be null or undefined.');
        }
        return JSON.stringify({
            type: TimeTriggerSerializer.TYPE,
            hour: objectToSerialize.getHour(),
            minute: objectToSerialize.getMinute(),
            weekdays: objectToSerialize.getWeekdays(),
        });
    }
}
exports.TimeTriggerSerializer = TimeTriggerSerializer;
TimeTriggerSerializer.TYPE = 'time';
