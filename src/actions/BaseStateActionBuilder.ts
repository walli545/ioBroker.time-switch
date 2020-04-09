import { StateService } from '../services/StateService';
import { BaseStateAction } from './BaseStateAction';

export abstract class BaseStateActionBuilder {
	protected stateService: StateService | null = null;
	protected id = '';

	public setId(id: string): BaseStateActionBuilder {
		this.id = id;
		return this;
	}

	public setStateService(stateService: StateService): BaseStateActionBuilder {
		this.stateService = stateService;
		return this;
	}

	public abstract build(): BaseStateAction;
}
