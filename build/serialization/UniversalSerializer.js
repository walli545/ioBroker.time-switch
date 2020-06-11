"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalSerializer = void 0;
class UniversalSerializer {
    constructor(serializers) {
        this.serializers = serializers;
    }
    replaceSerializer(serializer) {
        const existing = this.serializers.find(s => s.getType() === serializer.getType());
        if (existing) {
            this.serializers = this.serializers.filter(s => s != existing);
            this.serializers.push(serializer);
            return existing;
        }
        throw new Error('Cannot replace non existing serializer');
    }
    serialize(object) {
        const serializer = this.serializers.find(s => s.getType() === object.constructor.name);
        if (serializer) {
            return serializer.serialize(object);
        }
        else {
            throw new Error(`No serializer for object of type ${object.constructor.name} found`);
        }
    }
    deserialize(stringToDeserialize) {
        const json = JSON.parse(stringToDeserialize);
        const serializer = this.serializers.find(s => s.getType() === json.type);
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
