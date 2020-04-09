import { Action } from './Action';
import { StateService } from '../services/StateService';

export abstract class BaseStateAction implements Action {
	private readonly stateService: StateService;
	private readonly id: string;

	protected constructor(id: string, stateService: StateService) {
		if (id == null || id.length == 0) {
			throw new Error('Id may not be null or empty.');
		}
		if (stateService == null) {
			throw new Error('StateService may not be null or undefined.');
		}
		this.id = id;
		this.stateService = stateService;
	}

	abstract execute(): void;

	public getId(): string {
		return this.id;
	}

	protected getStateService(): StateService {
		return this.stateService;
	}
}
