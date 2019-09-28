import { Trigger } from './Trigger';
import { Weekday } from './Weekday';

export abstract class BaseTrigger implements Trigger {
	private readonly weekdays: Weekday[];

	protected constructor(weekdays: Weekday[]) {
		this.checkWeekdays(weekdays);
		this.weekdays = weekdays;
	}

	public abstract getSchedule(): any;

	public getWeekdays(): Weekday[] {
		return this.weekdays;
	}

	private checkWeekdays(weekdays: Weekday[]) {
		if (weekdays == null) {
			throw new Error('Weekdays may not be null.');
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
