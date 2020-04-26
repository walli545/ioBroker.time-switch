"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UniversalTriggerSerializer {
    constructor(serializers) {
        this.serializers = serializers;
    }
    serialize(trigger) {
        const serializer = this.serializers.find(s => s.getType() === trigger.constructor.name);
        if (serializer) {
            return serializer.serialize(trigger);
        }
        else {
            throw new Error(`No serializer for trigger of type ${trigger.constructor.name} found`);
        }
    }
    deserialize(stringToDeserialize) {
        const json = JSON.parse(stringToDeserialize);
        const serializer = this.serializers.find(s => s.getType() === json.type);
        if (serializer) {
            return serializer.deserialize(stringToDeserialize);
        }
        else {
            throw new Error(`No serializer for trigger of type ${json.type} found`);
        }
    }
}
exports.UniversalTriggerSerializer = UniversalTriggerSerializer;
