import { Serializer } from './Serializer';

export class UniversalSerializer<T extends Record<string, any>> implements Serializer<T> {
	constructor(private serializers: Serializer<T>[]) {}

	replaceSerializer(serializer: Serializer<T>): Serializer<T> {
		const existing = this.serializers.find(s => s.getType() === serializer.getType());
		if (existing) {
			this.serializers = this.serializers.filter(s => s != existing);
			this.serializers.push(serializer);
			return existing;
		}
		throw new Error('Cannot replace non existing serializer');
	}

	public serialize(object: T): string {
		const serializer = this.serializers.find(s => s.getType() === object.constructor.name);
		if (serializer) {
			return serializer.serialize(object);
		} else {
			throw new Error(`No serializer for object of type ${object.constructor.name} found`);
		}
	}

	public deserialize(stringToDeserialize: string): T {
		const json = JSON.parse(stringToDeserialize);
		const serializer = this.serializers.find(s => s.getType() === json.type);
		if (serializer) {
			return serializer.deserialize(stringToDeserialize);
		} else {
			throw new Error(`No serializer for object of type ${json.type} found`);
		}
	}

	getType(): string {
		return 'Universal';
	}
}
