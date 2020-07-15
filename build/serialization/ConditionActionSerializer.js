"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionActionSerializer = void 0;
const ConditionAction_1 = require("../actions/ConditionAction");
class ConditionActionSerializer {
    constructor(conditionSerializer, actionSerializer, logger) {
        this.conditionSerializer = conditionSerializer;
        this.actionSerializer = actionSerializer;
        this.logger = logger;
    }
    deserialize(stringToDeserialize) {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            throw new Error(`Can not deserialize object of type ${json.type}`);
        }
        return new ConditionAction_1.ConditionAction(this.conditionSerializer.deserialize(JSON.stringify(json.condition)), this.actionSerializer.deserialize(JSON.stringify(json.action)), this.logger);
    }
    serialize(objectToSerialize) {
        if (objectToSerialize == null) {
            throw new Error('objectToSerialize may not be null or undefined.');
        }
        if (objectToSerialize instanceof ConditionAction_1.ConditionAction) {
            return JSON.stringify({
                type: this.getType(),
                condition: JSON.parse(this.conditionSerializer.serialize(objectToSerialize.getCondition())),
                action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getAction())),
            });
        }
        else {
            throw new Error('objectToSerialize must be of type ConditionAction.');
        }
    }
    getType() {
        return ConditionAction_1.ConditionAction.prototype.constructor.name;
    }
}
exports.ConditionActionSerializer = ConditionActionSerializer;
