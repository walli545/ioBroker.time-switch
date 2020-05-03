"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseTriggerSerializer {
    constructor(actionSerializers) {
        this.actionSerializers = actionSerializers;
    }
    serializeAction(action) {
        const serializer = this.actionSerializers.find(s => s.getType() === action.constructor.name);
        if (serializer) {
            return serializer.serialize(action);
        }
        else {
            throw new Error(`No serializer for action of type ${action.constructor.name} found`);
        }
    }
    deserializeAction(actionString) {
        const json = JSON.parse(actionString);
        const serializer = this.actionSerializers.find(s => s.getType() === json.type);
        if (serializer) {
            return serializer.deserialize(actionString);
        }
        else {
            throw new Error(`No serializer for action of type ${json.type} found`);
        }
    }
}
exports.BaseTriggerSerializer = BaseTriggerSerializer;
