import { Action } from '../actions/Action';
import { BaseDailyTrigger } from './BaseDailyTrigger';
import { Weekday } from './Weekday';

export class TimeTrigger extends BaseDailyTrigger {
	private readonly hours: number;
	private readonly minutes: number;

	constructor(id: string, hour: number, minute: number, weekdays: Weekday[], action: Action) {
		super(id, action, weekdays);
		if (hour == undefined || hour < 0 || hour > 23) {
			throw new Error('Hour must be in range 0-23.');
		}
		if (minute == undefined || minute < 0 || minute > 59) {
			throw new Error('Minute must be in range 0-59.');
		}
		this.hours = hour;
		this.minutes = minute;
	}

	public getHour(): number {
		return this.hours;
	}

	public getMinute(): number {
		return this.minutes;
	}

	public toString(): string {
		return (
			`TimeTrigger {id=${this.getId()}, hour=${this.getHour()},` +
			` minute=${this.getMinute()}, weekdays=[${this.getWeekdays()}]}`
		);
	}
}
