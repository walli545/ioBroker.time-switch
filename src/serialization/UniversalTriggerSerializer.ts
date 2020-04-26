import { Trigger } from '../triggers/Trigger';
import { Serializer } from './Serializer';

export class UniversalTriggerSerializer {
	private readonly serializers: Serializer<Trigger>[];

	constructor(serializers: Serializer<Trigger>[]) {
		this.serializers = serializers;
	}

	public serialize(trigger: Trigger): string {
		const serializer = this.serializers.find(s => s.getType() === trigger.constructor.name);
		if (serializer) {
			return serializer.serialize(trigger);
		} else {
			throw new Error(`No serializer for trigger of type ${trigger.constructor.name} found`);
		}
	}

	public deserialize(stringToDeserialize: string): Trigger {
		const json = JSON.parse(stringToDeserialize);
		const serializer = this.serializers.find(s => s.getType() === json.type);
		if (serializer) {
			return serializer.deserialize(stringToDeserialize);
		} else {
			throw new Error(`No serializer for trigger of type ${json.type} found`);
		}
	}
}
