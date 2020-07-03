import { Action } from '../actions/Action';

export interface Trigger {
	getAction(): Action;
	setAction(action: Action): void;
	getId(): string;
}
