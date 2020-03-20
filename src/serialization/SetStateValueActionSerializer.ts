import { ActionSerializer } from './ActionSerializer';
import { SetStateValueAction } from '../actions/SetStateValueAction';
import { StateService } from '../services/StateService';

export class SetStateValueActionSerializer extends ActionSerializer {
	public static readonly TYPE: string = 'setStateValueAction';

	constructor(private readonly stateService: StateService) {
		super();
	}

	deserialize(stringToDeserialize: string): SetStateValueAction<string | number | boolean> {
		const json = JSON.parse(stringToDeserialize);
		if (json.type !== SetStateValueActionSerializer.TYPE) {
			throw new Error(`Type must be ${SetStateValueActionSerializer.TYPE}.`);
		}
		if (!json.valueType) {
			throw new Error('Must contain property valueType');
		}
		const baseAction = super.deserialize(stringToDeserialize);
		if (json.valueType == 'string') {
			return new SetStateValueAction<string>(
				baseAction.getId(),
				baseAction.getTrigger(),
				json.idOfStateToSet,
				json.valueToSet,
				this.stateService,
			);
		} else if (json.valueType == 'number') {
			return new SetStateValueAction<number>(
				json.id,
				baseAction.getTrigger(),
				json.idOfStateToSet,
				json.valueToSet,
				this.stateService,
			);
		} else if (json.valueType == 'boolean') {
			return new SetStateValueAction<boolean>(
				json.id,
				baseAction.getTrigger(),
				json.idOfStateToSet,
				json.valueToSet,
				this.stateService,
			);
		} else {
			throw new Error(`valueType ${json.valueType} can not be deserialized.`);
		}
	}

	serialize(objectToSerialize: SetStateValueAction<string | number | boolean>): string {
		const baseAction = JSON.parse(super.serialize(objectToSerialize));
		const valueType = typeof objectToSerialize.getValueToSet();
		return JSON.stringify({
			...baseAction,
			idOfStateToSet: objectToSerialize.getIdOfStateToSet(),
			valueToSet: objectToSerialize.getValueToSet(),
			valueType: valueType,
			type: SetStateValueActionSerializer.TYPE,
		});
	}
}
