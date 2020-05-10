import { Trigger } from './Trigger';
import { Weekday } from './Weekday';

export interface DailyTrigger extends Trigger {
	getWeekdays(): Weekday[];
}
