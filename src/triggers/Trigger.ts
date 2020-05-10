import { Action } from '../actions/Action';

export interface Trigger {
	trigger(): void;
	getAction(): Action;
	setAction(action: Action): void;
	getId(): string;
}
