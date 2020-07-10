"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalSerializer = void 0;
class UniversalSerializer {
    constructor(serializers) {
        this.serializers = serializers;
    }
    useSerializer(serializer) {
        if (serializer == null) {
            throw new Error('Serializer to use may not be null/undefined');
        }
        this.serializers = this.serializers.filter((s) => s.getType() !== serializer.getType());
        this.serializers.push(serializer);
    }
    serialize(object) {
        const serializer = this.serializers.find((s) => s.getType() === object.constructor.name);
        if (serializer) {
            return serializer.serialize(object);
        }
        else {
            throw new Error(`No serializer for object of type ${object.constructor.name} found`);
        }
    }
    deserialize(stringToDeserialize) {
        const json = JSON.parse(stringToDeserialize);
        const serializer = this.serializers.find((s) => s.getType() === json.type);
        if (serializer) {
            return serializer.deserialize(stringToDeserialize);
        }
        else {
            throw new Error(`No serializer for object of type ${json.type} found`);
        }
    }
    getType() {
        return 'Universal';
    }
}
exports.UniversalSerializer = UniversalSerializer;
