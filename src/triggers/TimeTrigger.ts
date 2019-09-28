import { BaseTrigger } from './BaseTrigger';
import { Weekday } from './Weekday';

export class TimeTrigger extends BaseTrigger {
	private readonly hours: number;
	private readonly minutes: number;

	constructor(hours: number, minutes: number, weekdays: Weekday[]) {
		super(weekdays);
		if (hours < 0 || hours > 23) {
			throw new Error('Hours must be in range 0-23.');
		}
		if (minutes < 0 || minutes > 59) {
			throw new Error('Minutes must be in range 0-59.');
		}
		this.hours = hours;
		this.minutes = minutes;
	}

	public getHours(): number {
		return this.hours;
	}

	public getMinutes(): number {
		return this.minutes;
	}

	public getSchedule(): any {
		return { time: { hour: this.getHours(), minute: this.getMinutes() } };
	}
}
