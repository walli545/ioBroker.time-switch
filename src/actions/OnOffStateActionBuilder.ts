import { BaseStateActionBuilder } from './BaseStateActionBuilder';
import { OnOffStateAction } from './OnOffStateAction';
import { StateService } from '../services/StateService';

export class OnOffStateActionBuilder<T extends string | number | boolean> extends BaseStateActionBuilder {
	private idOfStateToSet = '';
	private onValue: T | null = null;
	private offValue: T | null = null;
	private booleanValue = true;

	public setIdOfStateToSet(idOfStateToSet: string): OnOffStateActionBuilder<T> {
		this.idOfStateToSet = idOfStateToSet;
		return this;
	}

	public setOnValue(onValue: T): OnOffStateActionBuilder<T> {
		this.onValue = onValue;
		return this;
	}

	public setOffValue(offValue: T): OnOffStateActionBuilder<T> {
		this.offValue = offValue;
		return this;
	}

	public setBooleanValue(booleanValue: boolean): OnOffStateActionBuilder<T> {
		this.booleanValue = booleanValue;
		return this;
	}

	public setStateService(stateService: StateService): OnOffStateActionBuilder<T> {
		super.setStateService(stateService);
		return this;
	}

	public build(): OnOffStateAction<T> {
		return new OnOffStateAction<T>(
			this.idOfStateToSet,
			this.onValue as any,
			this.offValue as any,
			this.booleanValue,
			this.stateService as any,
		);
	}
}
