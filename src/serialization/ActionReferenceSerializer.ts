import { Serializer } from './Serializer';
import { Action } from '../actions/Action';

export class ActionReferenceSerializer implements Serializer<Action> {
	private readonly referencableActions: Map<string, Action>;
	private readonly typeToReference: string;
	constructor(typeToReference: string, referencableActions: Map<string, Action>) {
		if (!typeToReference) {
			throw new Error(`typeToReference cannot be null or undefined`);
		}
		if (!referencableActions || referencableActions.size == 0) {
			throw new Error(`referencableActions cannot be null, undefined or empty`);
		}
		this.referencableActions = referencableActions;
		this.typeToReference = typeToReference;
	}

	deserialize(stringToDeserialize: string): Action {
		const json = JSON.parse(stringToDeserialize);
		if (json.type !== this.getType()) {
			throw new Error(`Can not reference object of type ${json.type}`);
		}
		const found = this.referencableActions.get(json.name);
		if (found) {
			return found;
		} else {
			throw new Error(`No existing action found with name ${json.name} to reference`);
		}
	}

	serialize(objectToSerialize: Action): string {
		if (objectToSerialize == null) {
			throw new Error('objectToSerialize may not be null or undefined.');
		}
		let name = null;
		for (const entry of this.referencableActions.entries()) {
			if (entry[1] === objectToSerialize) {
				name = entry[0];
				break;
			}
		}
		if (name) {
			return JSON.stringify({
				type: this.getType(),
				name: name,
			});
		} else {
			throw new Error('no existing action found');
		}
	}

	getType(): string {
		return this.typeToReference;
	}
}
