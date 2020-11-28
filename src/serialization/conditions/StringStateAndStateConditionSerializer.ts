import { Serializer } from '../Serializer';
import { StateService } from '../../services/StateService';
import { Condition } from '../../actions/conditions/Condition';
import { StringStateAndStateCondition } from '../../actions/conditions/StringStateAndStateCondition';
import { EqualitySign } from '../../actions/conditions/EqualitySign';

export class StringStateAndStateConditionSerializer implements Serializer<Condition> {
	constructor(private stateService: StateService) {}

	deserialize(stringToDeserialize: string): Condition {
		const json = JSON.parse(stringToDeserialize);
		if (json.type !== this.getType()) {
			throw new Error(`Can not deserialize object of type ${json.type}`);
		}
		if (!Object.values(EqualitySign).includes(json.sign)) {
			throw new Error(`Equality sign ${json.sign} unknown`);
		}
		return new StringStateAndStateCondition(json.stateId1, json.stateId2, json.sign, this.stateService);
	}

	serialize(objectToSerialize: Condition): string {
		if (objectToSerialize == null) {
			throw new Error('objectToSerialize may not be null or undefined.');
		}
		if (objectToSerialize instanceof StringStateAndStateCondition) {
			return JSON.stringify({
				type: this.getType(),
				stateId1: objectToSerialize.getStateId1(),
				stateId2: objectToSerialize.getStateId2(),
				sign: objectToSerialize.getSign(),
			});
		} else {
			throw new Error('objectToSerialize must be of type StringStateAndStateCondition .');
		}
	}

	getType(): string {
		return StringStateAndStateCondition.prototype.constructor.name;
	}
}
