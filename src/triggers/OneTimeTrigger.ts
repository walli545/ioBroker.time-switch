import { Action } from '../actions/Action';
import { Destroyable } from '../Destroyable';
import { Trigger } from './Trigger';

export class OneTimeTrigger implements Trigger, Destroyable {
	private readonly id: string;
	private action: Action;
	private readonly date: Date;
	private readonly onDestroy: (() => void) | null;

	constructor(id: string, action: Action, date: Date, onDestroy: (() => void) | null) {
		if (id == null) {
			throw new Error('Id may not be null or undefined.');
		}
		if (action == null) {
			throw new Error('Action may not be null or undefined.');
		}
		if (date == null) {
			throw new Error('Date may not be null or undefined.');
		}
		this.id = id;
		this.action = action;
		this.date = new Date(date);
		this.onDestroy = onDestroy;
	}

	public getAction(): Action {
		return {
			execute: () => {
				this.action.execute();
				this.destroy();
			},
		} as Action;
	}

	public setAction(action: Action): void {
		if (action == null) {
			throw new Error('Action may not be null or undefined.');
		}
		this.action = action;
	}

	public getId(): string {
		return this.id;
	}

	public getDate(): Date {
		return new Date(this.date);
	}

	public toString(): string {
		return `OneTimeTrigger {id=${this.getId()}, date=${this.getDate().toISOString()}}`;
	}

	public getInternalAction(): Action {
		return this.action;
	}

	public destroy(): void {
		if (this.onDestroy) {
			this.onDestroy();
		}
	}
}
