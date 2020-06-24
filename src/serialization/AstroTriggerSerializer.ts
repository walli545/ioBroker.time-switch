import { Serializer } from './Serializer';
import { AstroTrigger } from '../triggers/AstroTrigger';
import { UniversalSerializer } from './UniversalSerializer';
import { Action } from '../actions/Action';
import { Trigger } from '../triggers/Trigger';
import { AstroTriggerBuilder } from '../triggers/AstroTriggerBuilder';

export class AstroTriggerSerializer implements Serializer<Trigger> {
	constructor(private readonly actionSerializer: UniversalSerializer<Action>) {}

	public deserialize(stringToDeserialize: string): Trigger {
		const json = JSON.parse(stringToDeserialize);
		if (json.type !== this.getType()) {
			throw new Error(`Can not deserialize object of type ${json.type}`);
		}
		return new AstroTriggerBuilder()
			.setAction(this.actionSerializer.deserialize(JSON.stringify(json.action)))
			.setAstroTime(json.astroTime)
			.setShift(json.shiftInMinutes)
			.setWeekdays(json.weekdays)
			.setId(json.id)
			.build();
	}

	public serialize(objectToSerialize: Trigger): string {
		if (objectToSerialize == null) {
			throw new Error('objectToSerialize may not be null or undefined.');
		}
		if (objectToSerialize instanceof AstroTrigger) {
			return JSON.stringify({
				type: this.getType(),
				astroTime: objectToSerialize.getAstroTime(),
				shiftInMinutes: objectToSerialize.getShiftInMinutes(),
				weekdays: objectToSerialize.getWeekdays(),
				id: objectToSerialize.getId(),
				action: JSON.parse(this.actionSerializer.serialize(objectToSerialize.getAction())),
			});
		} else {
			throw new Error('objectToSerialize must be of type AstroTrigger.');
		}
	}
	getType(): string {
		return AstroTrigger.prototype.constructor.name;
	}
}
