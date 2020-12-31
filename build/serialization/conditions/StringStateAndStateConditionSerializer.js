"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringStateAndStateConditionSerializer = void 0;
const StringStateAndStateCondition_1 = require("../../actions/conditions/StringStateAndStateCondition");
const EqualitySign_1 = require("../../actions/conditions/EqualitySign");
class StringStateAndStateConditionSerializer {
    constructor(stateService) {
        this.stateService = stateService;
    }
    deserialize(stringToDeserialize) {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== this.getType()) {
            throw new Error(`Can not deserialize object of type ${json.type}`);
        }
        if (!Object.values(EqualitySign_1.EqualitySign).includes(json.sign)) {
            throw new Error(`Equality sign ${json.sign} unknown`);
        }
        return new StringStateAndStateCondition_1.StringStateAndStateCondition(json.stateId1, json.stateId2, json.sign, this.stateService);
    }
    serialize(objectToSerialize) {
        if (objectToSerialize == null) {
            throw new Error('objectToSerialize may not be null or undefined.');
        }
        if (objectToSerialize instanceof StringStateAndStateCondition_1.StringStateAndStateCondition) {
            return JSON.stringify({
                type: this.getType(),
                stateId1: objectToSerialize.getStateId1(),
                stateId2: objectToSerialize.getStateId2(),
                sign: objectToSerialize.getSign(),
            });
        }
        else {
            throw new Error('objectToSerialize must be of type StringStateAndStateCondition .');
        }
    }
    getType() {
        return StringStateAndStateCondition_1.StringStateAndStateCondition.prototype.constructor.name;
    }
}
exports.StringStateAndStateConditionSerializer = StringStateAndStateConditionSerializer;
