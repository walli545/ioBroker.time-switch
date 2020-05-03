export interface Serializer<T> {
	getType(): string;

	deserialize(stringToDeserialize: string): T;

	serialize(objectToSerialize: T): string;
}
