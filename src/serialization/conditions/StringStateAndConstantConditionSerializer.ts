import { Serializer } from '../Serializer';
import { StringStateAndConstantCondition } from '../../actions/conditions/StringStateAndConstantCondition';
import { StateService } from '../../services/StateService';
import { Condition } from '../../actions/conditions/Condition';
import { EqualitySign } from '../../actions/conditions/EqualitySign';

export class StringStateAndConstantConditionSerializer implements Serializer<Condition> {
	constructor(private stateService: StateService) {}

	deserialize(stringToDeserialize: string): Condition {
		const json = JSON.parse(stringToDeserialize);
		if (json.type !== this.getType()) {
			throw new Error(`Can not deserialize object of type ${json.type}`);
		}
		if (!Object.values(EqualitySign).includes(json.sign)) {
			throw new Error(`Equality sign ${json.sign} unknown`);
		}
		return new StringStateAndConstantCondition(json.constant, json.stateId, json.sign, this.stateService);
	}

	serialize(objectToSerialize: Condition): string {
		if (objectToSerialize == null) {
			throw new Error('objectToSerialize may not be null or undefined.');
		}
		if (objectToSerialize instanceof StringStateAndConstantCondition) {
			return JSON.stringify({
				type: this.getType(),
				constant: objectToSerialize.getConstant(),
				stateId: objectToSerialize.getStateId(),
				sign: objectToSerialize.getSign(),
			});
		} else {
			throw new Error('objectToSerialize must be of type StringStateAndConstantCondition .');
		}
	}

	getType(): string {
		return StringStateAndConstantCondition.prototype.constructor.name;
	}
}
