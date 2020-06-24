import { Action } from '../actions/Action';
import { Weekday } from './Weekday';
import { DailyTrigger } from './DailyTrigger';
import { Builder } from '../Builder';

export abstract class DailyTriggerBuilder implements Builder<DailyTrigger> {
	private action: Action | null = null;
	private id = '0';
	private weekdays: Weekday[] = [];

	public setAction(action: Action): DailyTriggerBuilder {
		this.action = action;
		return this;
	}

	public setId(id: string): DailyTriggerBuilder {
		this.id = id;
		return this;
	}

	public setWeekdays(weekdays: Weekday[]): DailyTriggerBuilder {
		this.weekdays = weekdays;
		return this;
	}

	protected getAction(): Action | null {
		return this.action;
	}

	protected getWeekdays(): Weekday[] {
		return this.weekdays;
	}

	protected getId(): string {
		return this.id;
	}

	public abstract build(): DailyTrigger;
}
