import { Weekday } from './Weekday';
import { Action } from '../actions/Action';
import { DailyTrigger } from './DailyTrigger';

export abstract class BaseDailyTrigger implements DailyTrigger {
	private readonly weekdays: Weekday[];
	private readonly id: string;
	private action: Action;

	protected constructor(id: string, action: Action, weekdays: Weekday[]) {
		if (id == null) {
			throw new Error('Id may not be null or undefined.');
		}
		if (action == null) {
			throw new Error('Action may not be null or undefined.');
		}
		this.checkWeekdays(weekdays);
		this.weekdays = weekdays;
		this.action = action;
		this.id = id;
	}

	public trigger(): void {
		this.getAction().execute();
	}

	public getWeekdays(): Weekday[] {
		return this.weekdays;
	}

	public getAction(): Action {
		return this.action;
	}

	public setAction(action: Action): void {
		if (action == null) {
			throw new Error('Action may not be null or undefined.');
		}
		this.action = action;
	}

	public getId(): string {
		return this.id;
	}

	private checkWeekdays(weekdays: Weekday[]): void {
		if (weekdays == null) {
			throw new Error('Weekdays may not be null or undefined.');
		}
		if (weekdays.length <= 0 || weekdays.length > 7) {
			throw new Error('Weekdays length must be in range 1-7.');
		}
		if (this.hasDuplicates(weekdays)) {
			throw new Error('Weekdays may not contain duplicates.');
		}
	}

	private hasDuplicates(weekdays: Weekday[]): boolean {
		return new Set(weekdays).size !== weekdays.length;
	}
}
