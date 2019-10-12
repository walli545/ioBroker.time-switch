import { Weekday } from './Weekday';

export interface Trigger {
	getWeekdays(): Weekday[];
}
