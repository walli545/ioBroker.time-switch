"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringStateAndConstantConditionSerializer = void 0;
const StringStateAndConstantCondition_1 = require("../../actions/conditions/StringStateAndConstantCondition");
const EqualitySign_1 = require("../../actions/conditions/EqualitySign");
class StringStateAndConstantConditionSerializer {
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
        return new StringStateAndConstantCondition_1.StringStateAndConstantCondition(json.constant, json.stateId, json.sign, this.stateService);
    }
    serialize(objectToSerialize) {
        if (objectToSerialize == null) {
            throw new Error('objectToSerialize may not be null or undefined.');
        }
        if (objectToSerialize instanceof StringStateAndConstantCondition_1.StringStateAndConstantCondition) {
            return JSON.stringify({
                type: this.getType(),
                constant: objectToSerialize.getConstant(),
                stateId: objectToSerialize.getStateId(),
                sign: objectToSerialize.getSign(),
            });
        }
        else {
            throw new Error('objectToSerialize must be of type StringStateAndConstantCondition .');
        }
    }
    getType() {
        return StringStateAndConstantCondition_1.StringStateAndConstantCondition.prototype.constructor.name;
    }
}
exports.StringStateAndConstantConditionSerializer = StringStateAndConstantConditionSerializer;
