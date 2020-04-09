import { Weekday } from './Weekday';
import { Action } from '../actions/Action';
import { TimeTrigger } from './TimeTrigger';

export class TimeTriggerBuilder {
	private action: Action | null = null;
	private hour = 0;
	private minute = 0;
	private weekdays: Weekday[] = [];

	public setAction(action: Action): TimeTriggerBuilder {
		this.action = action;
		return this;
	}

	public setHour(hour: number): TimeTriggerBuilder {
		this.hour = hour;
		return this;
	}

	public setMinute(minute: number): TimeTriggerBuilder {
		this.minute = minute;
		return this;
	}

	public setWeekdays(weekdays: Weekday[]): TimeTriggerBuilder {
		this.weekdays = weekdays;
		return this;
	}

	public build(): TimeTrigger {
		return new TimeTrigger(this.hour, this.minute, this.weekdays, (this.action as any) as Action);
	}
}
