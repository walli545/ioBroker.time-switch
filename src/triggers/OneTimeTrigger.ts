import { Action } from '../actions/Action';
import { Trigger } from './Trigger';

export class OneTimeTrigger implements Trigger {
	private readonly id: string;
	private action: Action;
	private readonly date: Date;

	constructor(id: string, action: Action, date: Date) {
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
	}

	public getAction(): Action {
		return this.action;
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
}
