import { StateService } from '../services/StateService';
import { BaseStateAction } from './BaseStateAction';

export class OnOffStateAction<T extends string | number | boolean> extends BaseStateAction {
	private readonly idOfStateToSet: string;
	private readonly onValue: T;
	private readonly offValue: T;
	private readonly booleanValue: boolean;

	constructor(
		id: string,
		idOfStateToSet: string,
		onValue: T,
		offValue: T,
		booleanValue: boolean,
		stateService: StateService,
	) {
		super(id, stateService);

		if (idOfStateToSet == null || idOfStateToSet.length == 0) {
			throw new Error('IdOfStateToSet may not be null or empty.');
		}
		if (onValue == undefined) {
			throw new Error('OnValue may not be undefined.');
		}
		if (offValue == undefined) {
			throw new Error('OffValue may not be undefined.');
		}
		if (booleanValue == null) {
			throw new Error('ValueToSet may not be null or undefined.');
		}

		this.idOfStateToSet = idOfStateToSet;
		this.onValue = onValue;
		this.offValue = offValue;
		this.booleanValue = booleanValue;
	}

	public getIdOfStateToSet(): string {
		return this.idOfStateToSet;
	}

	public getOnValue(): T {
		return this.onValue;
	}

	public getOffValue(): T {
		return this.offValue;
	}

	public getBooleanValue(): boolean {
		return this.booleanValue;
	}

	public execute(): void {
		const valueToUse = this.getBooleanValue() ? this.getOnValue() : this.getOffValue()
		this.getStateService().setForeignState(this.getIdOfStateToSet(), valueToUse);
	}
}
