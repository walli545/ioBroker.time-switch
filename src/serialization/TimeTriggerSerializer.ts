import { TimeTrigger } from '../triggers/TimeTrigger';
import { Trigger } from '../triggers/Trigger';
import { BaseTriggerSerializer } from './BaseTriggerSerializer';
import { TimeTriggerBuilder } from '../triggers/TimeTriggerBuilder';

export class TimeTriggerSerializer extends BaseTriggerSerializer {
	public deserialize(stringToDeserialize: string): Trigger {
		const json = JSON.parse(stringToDeserialize);
		if (json.type !== this.getType()) {
			throw new Error(`Can not deserialize object of type ${json.type}`);
		}
		return new TimeTriggerBuilder()
			.setAction(this.deserializeAction(JSON.stringify(json.action)))
			.setHour(json.hour)
			.setMinute(json.minute)
			.setWeekdays(json.weekdays)
			.setId(json.id)
			.build();
	}

	public serialize(objectToSerialize: Trigger): string {
		if (objectToSerialize == null) {
			throw new Error('objectToSerialize may not be null or undefined.');
		}
		if (objectToSerialize instanceof TimeTrigger) {
			return JSON.stringify({
				type: this.getType(),
				hour: objectToSerialize.getHour(),
				minute: objectToSerialize.getMinute(),
				weekdays: objectToSerialize.getWeekdays(),
				id: objectToSerialize.getId(),
				action: JSON.parse(this.serializeAction(objectToSerialize.getAction())),
			});
		} else {
			throw new Error('objectToSerialize must be of type TimeTrigger.');
		}
	}

	getType(): string {
		return TimeTrigger.prototype.constructor.name;
	}
}
