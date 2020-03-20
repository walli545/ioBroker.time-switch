export interface Serializer<T> {
	deserialize(stringToDeserialize: string): T;

	serialize(objectToSerialize: T): string;
}
