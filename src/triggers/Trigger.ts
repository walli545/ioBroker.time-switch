import { Weekday } from './Weekday';
import { Action } from '../actions/Action';

export interface Trigger {
	trigger(): void;
	getAction(): Action;
	getWeekdays(): Weekday[];
}
