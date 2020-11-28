import { Serializer } from './Serializer';
import { Action } from '../actions/Action';
import { ConditionAction } from '../actions/ConditionAction';
import { UniversalSerializer } from './UniversalSerializer';
import { Condition } from '../actions/conditions/Condition';
import { LoggingService } from '../services/LoggingService';

export class ConditionActionSerializer implements Serializer<Action> {
	constructor(
		private conditionSerializer: UniversalSerializer<Condition>,
		private actionSerializer: UniversalSerializer<Action>,
		private logger?: LoggingService,
	) {}

	deserialize(stringToDeserialize: string): Action {
		const json = JSON.parse(stringToDeserialize);
		if (json.type !== this.getType()) {
			throw new Error(`Can not deserialize object of type ${json.type}`);
		}
		return new ConditionAction(
			this.conditionSerializer.deserialize(JSON.stringify(json.condition)),
			this.actionSerializer.deserialize(JSON.stringify(json.action)),
			this.logger,
		);
	}

	serialize(objectToSerialize: Action): string {
		if (objectToSerialize == null) {
			throw new Error('objectToSerialize may not be null or undefined.');
		}
		if (objectToSerialize instanceof ConditionAction) {
			return JSON.stringify({
				type: this.getType(),
				condition: JSON.parse(this.conditionSerializer.serialize(objectToSerialize.getCondition())),
				action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getAction())),
			});
		} else {
			throw new Error('objectToSerialize must be of type ConditionAction.');
		}
	}

	public getType(): string {
		return ConditionAction.prototype.constructor.name;
	}
}
