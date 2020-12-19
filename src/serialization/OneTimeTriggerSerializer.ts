import { Action } from '../actions/Action';
import { OneTimeTrigger } from '../triggers/OneTimeTrigger';
import { OneTimeTriggerBuilder } from '../triggers/OneTimeTriggerBuilder';
import { Trigger } from '../triggers/Trigger';
import { Serializer } from './Serializer';
import { UniversalSerializer } from './UniversalSerializer';

export class OneTimeTriggerSerializer implements Serializer<Trigger> {
	constructor(private readonly actionSerializer: UniversalSerializer<Action>) {}

	public deserialize(stringToDeserialize: string): Trigger {
		const json = JSON.parse(stringToDeserialize);
		if (json.type !== this.getType()) {
			throw new Error(`Can not deserialize object of type ${json.type}`);
		}
		return new OneTimeTriggerBuilder()
			.setAction(this.actionSerializer.deserialize(JSON.stringify(json.action)))
			.setDate(new Date(Date.parse(json.date)))
			.setId(json.id)
			.build();
	}

	public serialize(objectToSerialize: Trigger): string {
		if (objectToSerialize == null) {
			throw new Error('objectToSerialize may not be null or undefined.');
		}
		if (objectToSerialize instanceof OneTimeTrigger) {
			return JSON.stringify({
				type: this.getType(),
				date: objectToSerialize.getDate().toISOString(),
				id: objectToSerialize.getId(),
				action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getAction())),
			});
		} else {
			throw new Error('objectToSerialize must be of type OneTimeTrigger.');
		}
	}

	getType(): string {
		return OneTimeTrigger.prototype.constructor.name;
	}
}
