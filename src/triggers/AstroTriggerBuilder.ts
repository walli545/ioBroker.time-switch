import { Action } from '../actions/Action';
import { Weekday } from './Weekday';
import { AstroTime } from './AstroTime';
import { AstroTrigger } from './AstroTrigger';
import { Builder } from '../Builder';

export class AstroTriggerBuilder implements Builder<AstroTrigger> {
	private action: Action | null = null;
	private id = '0';
	private astroTime: AstroTime | null = null;
	private shift = 0;
	private weekdays: Weekday[] = [];

	public setAction(action: Action): AstroTriggerBuilder {
		this.action = action;
		return this;
	}

	public setId(id: string): AstroTriggerBuilder {
		this.id = id;
		return this;
	}

	public setAstroTime(astroTime: AstroTime): AstroTriggerBuilder {
		this.astroTime = astroTime;
		return this;
	}

	public setShift(shift: number): AstroTriggerBuilder {
		this.shift = shift;
		return this;
	}

	public setWeekdays(weekdays: Weekday[]): AstroTriggerBuilder {
		this.weekdays = weekdays;
		return this;
	}

	public build(): AstroTrigger {
		return new AstroTrigger(
			this.id,
			(this.astroTime as any) as AstroTime,
			this.shift,
			this.weekdays,
			(this.action as any) as Action,
		);
	}
}
