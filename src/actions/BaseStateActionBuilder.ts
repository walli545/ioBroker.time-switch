import { StateService } from '../services/StateService';
import { BaseStateAction } from './BaseStateAction';

export abstract class BaseStateActionBuilder {
	protected stateService: StateService | null = null;

	public setStateService(stateService: StateService): BaseStateActionBuilder {
		this.stateService = stateService;
		return this;
	}

	public abstract build(): BaseStateAction;
}
