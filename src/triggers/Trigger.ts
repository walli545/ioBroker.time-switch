import { Weekday } from './Weekday';

export interface Trigger {
	getSchedule(): any;

	getWeekdays(): Weekday[];
}
