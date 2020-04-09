import { Trigger } from './Trigger';
import { Weekday } from './Weekday';
import { Action } from '../actions/Action';

export abstract class BaseTrigger implements Trigger {
	private readonly weekdays: Weekday[];
	private readonly action: Action;

	protected constructor(action: Action, weekdays: Weekday[]) {
		if (action == null) {
			throw new Error('Action may not be null or undefined.');
		}
		this.checkWeekdays(weekdays);
		this.weekdays = weekdays;
		this.action = action;
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
