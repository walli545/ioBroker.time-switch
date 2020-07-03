import { Action } from '../actions/Action';
import { AstroTime } from './AstroTime';
import { AstroTrigger } from './AstroTrigger';
import { Builder } from '../Builder';
import { DailyTriggerBuilder } from './DailyTriggerBuilder';
import { Weekday } from './Weekday';

export class AstroTriggerBuilder extends DailyTriggerBuilder implements Builder<AstroTrigger> {
	private astroTime: AstroTime | null = null;
	private shift = 0;

	public setAstroTime(astroTime: AstroTime): AstroTriggerBuilder {
		this.astroTime = astroTime;
		return this;
	}

	public setShift(shift: number): AstroTriggerBuilder {
		this.shift = shift;
		return this;
	}

	public setAction(action: Action): AstroTriggerBuilder {
		super.setAction(action);
		return this;
	}

	public setId(id: string): AstroTriggerBuilder {
		super.setId(id);
		return this;
	}

	public setWeekdays(weekdays: Weekday[]): AstroTriggerBuilder {
		super.setWeekdays(weekdays);
		return this;
	}

	public build(): AstroTrigger {
		return new AstroTrigger(
			this.getId(),
			(this.astroTime as any) as AstroTime,
			this.shift,
			this.getWeekdays(),
			(this.getAction() as any) as Action,
		);
	}
}
