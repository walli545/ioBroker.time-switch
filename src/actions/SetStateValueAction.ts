import { Trigger } from '../triggers/Trigger';
import { Action } from './Action';
import { StateService } from '../services/StateService';

export class SetStateValueAction<T extends string | number | boolean> implements Action {
	private readonly id: string;
	private readonly trigger: Trigger;
	private readonly idOfStateToSet: string;
	private readonly valueToSet: T;
	private readonly stateService: StateService;

	constructor(id: string, trigger: Trigger, idOfStateToSet: string, valueToSet: T, stateService: StateService) {
		if (id == null || id == undefined || id.length == 0) {
			throw new Error('Id may not be null or empty.');
		}
		if (trigger == null || trigger == undefined) {
			throw new Error('Trigger may not be null or undefined.');
		}
		if (idOfStateToSet == null || idOfStateToSet == undefined || idOfStateToSet.length == 0) {
			throw new Error('IdOfStateToSet may not be null or empty.');
		}
		if (valueToSet == undefined) {
			throw new Error('ValueToSet may not be undefined.');
		}
		if (stateService == null || stateService == undefined) {
			throw new Error('StateService may not be null or undefined.');
		}
		this.id = id;
		this.trigger = trigger;
		this.idOfStateToSet = idOfStateToSet;
		this.valueToSet = valueToSet;
		this.stateService = stateService;
	}

	public getId(): string {
		return this.id;
	}

	public getTrigger(): Trigger {
		return this.trigger;
	}

	public getIdOfStateToSet(): string {
		return this.idOfStateToSet;
	}

	public getValueToSet(): T {
		return this.valueToSet;
	}

	public execute(): void {
		this.stateService.setForeignState(this.getIdOfStateToSet(), this.getValueToSet());
	}
}
