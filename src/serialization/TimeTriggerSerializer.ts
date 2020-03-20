import { TimeTrigger } from '../triggers/TimeTrigger';
import { Serializer } from './Serializer';

export class TimeTriggerSerializer implements Serializer<TimeTrigger> {
	public static readonly TYPE = 'time';

	public deserialize(stringToDeserialize: string): TimeTrigger {
		const json = JSON.parse(stringToDeserialize);
		if (json.type !== TimeTriggerSerializer.TYPE) {
			throw new Error('Type must be time.');
		}
		return new TimeTrigger(json.hour, json.minute, json.weekdays);
	}

	public serialize(objectToSerialize: TimeTrigger): string {
		if (!objectToSerialize) {
			throw new Error('objectToSerialize may not be null or undefined.');
		}
		return JSON.stringify({
			type: TimeTriggerSerializer.TYPE,
			hour: objectToSerialize.getHour(),
			minute: objectToSerialize.getMinute(),
			weekdays: objectToSerialize.getWeekdays(),
		});
	}
}
