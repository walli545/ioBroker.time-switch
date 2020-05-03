import { Serializer } from './Serializer';
import { Trigger } from '../triggers/Trigger';
import { Action } from '../actions/Action';

export abstract class BaseTriggerSerializer implements Serializer<Trigger> {
	private readonly actionSerializers: Serializer<Action>[];

	constructor(actionSerializers: Serializer<Action>[]) {
		this.actionSerializers = actionSerializers;
	}

	protected serializeAction(action: Action): string {
		const serializer = this.actionSerializers.find(s => s.getType() === action.constructor.name);
		if (serializer) {
			return serializer.serialize(action);
		} else {
			throw new Error(`No serializer for action of type ${action.constructor.name} found`);
		}
	}

	protected deserializeAction(actionString: string): Action {
		const json = JSON.parse(actionString);
		const serializer = this.actionSerializers.find(s => s.getType() === json.type);
		if (serializer) {
			return serializer.deserialize(actionString);
		} else {
			throw new Error(`No serializer for action of type ${json.type} found`);
		}
	}

	abstract deserialize(stringToDeserialize: string): Trigger;

	abstract getType(): string;

	abstract serialize(objectToSerialize: Trigger): string;
}
