import { Serializer } from './Serializer';
import { Action } from '../actions/Action';
import { TimeTriggerSerializer } from './TimeTriggerSerializer';
import { Trigger } from '../triggers/Trigger';
import { TimeTrigger } from '../triggers/TimeTrigger';

export abstract class ActionSerializer implements Serializer<Action> {
	deserialize(stringToDeserialize: string): Action {
		const json = JSON.parse(stringToDeserialize);
		return {
			getTrigger: () => this.deserializeTrigger(json.trigger),
			getId: () => json.id,
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			execute: () => {},
		} as Action;
	}

	serialize(objectToSerialize: Action): string {
		if (!objectToSerialize) {
			throw new Error('objectToSerialize may not be null or undefined.');
		}
		return JSON.stringify({
			trigger: this.serializeTrigger(objectToSerialize.getTrigger()),
			id: objectToSerialize.getId(),
		});
	}

	private deserializeTrigger(triggerJson: any): Trigger {
		if (triggerJson == undefined) {
			throw new Error('No trigger data available.');
		}
		if (triggerJson.type == undefined) {
			throw new Error('Trigger has no type.');
		}
		switch (triggerJson.type) {
			case TimeTriggerSerializer.TYPE:
				return new TimeTriggerSerializer().deserialize(JSON.stringify(triggerJson));
			default:
				throw new Error(`No deserializer for type ${triggerJson.type} available.`);
		}
	}

	private serializeTrigger(trigger: Trigger): string {
		if (trigger instanceof TimeTrigger) {
			return new TimeTriggerSerializer().serialize(trigger);
		} else {
			throw new Error(`No serializer for type ${typeof trigger} available.`);
		}
	}
}
