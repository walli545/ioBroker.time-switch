import { StateService } from '../services/StateService';
import { BaseStateAction } from './BaseStateAction';

export class OnOffStateAction<T extends string | number | boolean> extends BaseStateAction {
	private idsOfStatesToSet: string[];
	private readonly onValue: T;
	private readonly offValue: T;
	private readonly booleanValue: boolean;

	constructor(
		idsOfStatesToSet: string[],
		onValue: T,
		offValue: T,
		booleanValue: boolean,
		stateService: StateService,
	) {
		super(stateService);

		this.checkIdsOfStates(idsOfStatesToSet);
		if (onValue == undefined) {
			throw new Error('OnValue may not be undefined.');
		}
		if (offValue == undefined) {
			throw new Error('OffValue may not be undefined.');
		}
		if (booleanValue == null) {
			throw new Error('ValueToSet may not be null or undefined.');
		}

		this.idsOfStatesToSet = idsOfStatesToSet;
		this.onValue = onValue;
		this.offValue = offValue;
		this.booleanValue = booleanValue;
	}

	public getIdsOfStatesToSet(): string[] {
		return this.idsOfStatesToSet;
	}

	public setIdsOfStatesToSet(idsOfStatesToSet: string[]): void {
		this.checkIdsOfStates(idsOfStatesToSet);
		this.idsOfStatesToSet = idsOfStatesToSet;
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
		const valueToUse = this.getBooleanValue() ? this.getOnValue() : this.getOffValue();
		this.getIdsOfStatesToSet().forEach(id => {
			this.getStateService().setForeignState(id, valueToUse);
		});
	}

	public toBooleanValueType(): OnOffStateAction<boolean> {
		return new OnOffStateAction(
			this.getIdsOfStatesToSet(),
			true,
			false,
			this.getBooleanValue(),
			this.getStateService(),
		);
	}

	public toStringValueType(onValue: string, offValue: string): OnOffStateAction<string> {
		return new OnOffStateAction(
			this.getIdsOfStatesToSet(),
			onValue,
			offValue,
			this.getBooleanValue(),
			this.getStateService(),
		);
	}

	public toNumberValueType(onValue: number, offValue: number): OnOffStateAction<number> {
		return new OnOffStateAction(
			this.getIdsOfStatesToSet(),
			onValue,
			offValue,
			this.getBooleanValue(),
			this.getStateService(),
		);
	}

	private checkIdsOfStates(ids: string[]): void {
		if (ids == null || ids.length == 0 || ids.includes('')) {
			throw new Error('IdsOfStatesToSet may not be null or empty.');
		}
	}
}
