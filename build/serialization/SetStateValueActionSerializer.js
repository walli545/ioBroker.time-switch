"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ActionSerializer_1 = require("./ActionSerializer");
const SetStateValueAction_1 = require("../actions/SetStateValueAction");
class SetStateValueActionSerializer extends ActionSerializer_1.ActionSerializer {
    constructor(stateService) {
        super();
        this.stateService = stateService;
    }
    deserialize(stringToDeserialize) {
        const json = JSON.parse(stringToDeserialize);
        if (json.type !== SetStateValueActionSerializer.TYPE) {
            throw new Error(`Type must be ${SetStateValueActionSerializer.TYPE}.`);
        }
        if (!json.valueType) {
            throw new Error('Must contain property valueType');
        }
        const baseAction = super.deserialize(stringToDeserialize);
        if (json.valueType == 'string') {
            return new SetStateValueAction_1.SetStateValueAction(baseAction.getId(), baseAction.getTrigger(), json.idOfStateToSet, json.valueToSet, this.stateService);
        }
        else if (json.valueType == 'number') {
            return new SetStateValueAction_1.SetStateValueAction(json.id, baseAction.getTrigger(), json.idOfStateToSet, json.valueToSet, this.stateService);
        }
        else if (json.valueType == 'boolean') {
            return new SetStateValueAction_1.SetStateValueAction(json.id, baseAction.getTrigger(), json.idOfStateToSet, json.valueToSet, this.stateService);
        }
        else {
            throw new Error(`valueType ${json.valueType} can not be deserialized.`);
        }
    }
    serialize(objectToSerialize) {
        const baseAction = JSON.parse(super.serialize(objectToSerialize));
        const valueType = typeof objectToSerialize.getValueToSet();
        return JSON.stringify(Object.assign(Object.assign({}, baseAction), { idOfStateToSet: objectToSerialize.getIdOfStateToSet(), valueToSet: objectToSerialize.getValueToSet(), valueType: valueType, type: SetStateValueActionSerializer.TYPE }));
    }
}
exports.SetStateValueActionSerializer = SetStateValueActionSerializer;
SetStateValueActionSerializer.TYPE = 'setStateValueAction';
