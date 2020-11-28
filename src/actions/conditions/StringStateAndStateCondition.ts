import { Condition } from './Condition';
import { StateService } from '../../services/StateService';
import { EqualitySign } from './EqualitySign';

export class StringStateAndStateCondition implements Condition {
	private readonly stateId1: string;
	private readonly stateId2: string;
	private readonly stateService: StateService;
	private readonly sign: EqualitySign;

	constructor(stateId1: string, stateId2: string, sign: EqualitySign, stateService: StateService) {
		if (stateId1 == null || stateId1.length === 0) {
			throw new Error('First state id may not be null, undefined or empty.');
		}
		if (stateId2 == null || stateId2.length === 0) {
			throw new Error('Second state id may not be null, undefined or empty.');
		}
		if (sign == null) {
			throw new Error('Sign may not be null or undefined.');
		}
		if (stateService == null) {
			throw new Error('State service may not be null or undefined.');
		}
		this.stateId1 = stateId1;
		this.stateId2 = stateId2;
		this.sign = sign;
		this.stateService = stateService;
	}

	public async evaluate(): Promise<boolean> {
		const firstStateValue = String(await this.stateService.getForeignState(this.stateId1));
		const secondStateValue = String(await this.stateService.getForeignState(this.stateId2));
		let result: boolean;
		if (this.sign == EqualitySign.NotEqual) {
			result = firstStateValue !== secondStateValue;
		} else {
			result = firstStateValue === secondStateValue;
		}
		return Promise.resolve(result);
	}

	public getStateId1(): string {
		return this.stateId1;
	}

	public getStateId2(): string {
		return this.stateId2;
	}

	public getSign(): EqualitySign {
		return this.sign;
	}

	public toString(): string {
		return `${this.stateId1} ${this.sign} ${this.stateId2}`;
	}
}
