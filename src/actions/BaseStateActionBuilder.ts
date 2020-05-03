import { StateService } from '../services/StateService';
import { BaseStateAction } from './BaseStateAction';
import { Builder } from '../Builder';

export abstract class BaseStateActionBuilder implements Builder<BaseStateAction> {
	protected stateService: StateService | null = null;

	public setStateService(stateService: StateService): BaseStateActionBuilder {
		this.stateService = stateService;
		return this;
	}

	public abstract build(): BaseStateAction;
}
