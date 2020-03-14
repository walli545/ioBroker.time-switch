"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TimeTriggerSerializer_1 = require("./TimeTriggerSerializer");
const TimeTrigger_1 = require("../triggers/TimeTrigger");
class ActionSerializer {
    deserialize(stringToDeserialize) {
        const json = JSON.parse(stringToDeserialize);
        return {
            getTrigger: () => this.deserializeTrigger(json.trigger),
            getId: () => json.id,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            execute: () => { },
        };
    }
    serialize(objectToSerialize) {
        if (!objectToSerialize) {
            throw new Error('objectToSerialize may not be null or undefined.');
        }
        return JSON.stringify({
            trigger: this.serializeTrigger(objectToSerialize.getTrigger()),
            id: objectToSerialize.getId(),
        });
    }
    deserializeTrigger(triggerJson) {
        if (triggerJson == undefined) {
            throw new Error('No trigger data available.');
        }
        if (triggerJson.type == undefined) {
            throw new Error('Trigger has no type.');
        }
        switch (triggerJson.type) {
            case TimeTriggerSerializer_1.TimeTriggerSerializer.TYPE:
                return new TimeTriggerSerializer_1.TimeTriggerSerializer().deserialize(JSON.stringify(triggerJson));
            default:
                throw new Error(`No deserializer for type ${triggerJson.type} available.`);
        }
    }
    serializeTrigger(trigger) {
        if (trigger instanceof TimeTrigger_1.TimeTrigger) {
            return new TimeTriggerSerializer_1.TimeTriggerSerializer().serialize(trigger);
        }
        else {
            throw new Error(`No serializer for type ${typeof trigger} available.`);
        }
    }
}
exports.ActionSerializer = ActionSerializer;
