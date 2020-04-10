import { Weekday } from './Weekday';
import { Action } from '../actions/Action';

export interface Trigger {
	trigger(): void;
	getAction(): Action;
	getId(): string;
	getWeekdays(): Weekday[];
}
