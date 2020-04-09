import { AstroTime } from './AstroTime';
import { BaseTrigger } from './BaseTrigger';
import { Weekday } from './Weekday';
import { Action } from '../actions/Action';

export class AstroTrigger extends BaseTrigger {
	public static readonly MAX_SHIFT = 600;

	private readonly astroTime: AstroTime;

	private readonly shiftInMinutes: number;

	constructor(astroTime: AstroTime, shiftInMinutes: number, weekdays: Weekday[], action: Action) {
		super(action, weekdays);
		if (astroTime == null) {
			throw new Error('Astro time may not be null.');
		}
		if (shiftInMinutes > AstroTrigger.MAX_SHIFT || shiftInMinutes < -AstroTrigger.MAX_SHIFT) {
			throw new Error('Shift in minutes must be in range -600 to 600.');
		}
		this.astroTime = astroTime;
		this.shiftInMinutes = shiftInMinutes;
	}

	public getAstroTime(): AstroTime {
		return this.astroTime;
	}

	public getShiftInMinutes(): number {
		return this.shiftInMinutes;
	}
}
