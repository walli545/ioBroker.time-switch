import { TimeTriggerSerializer } from './TimeTriggerSerializer';
import { TimeTrigger } from '../triggers/TimeTrigger';
import { Weekday } from '../triggers/Weekday';
import { expect } from 'chai';

describe('TimeTriggerSerializer', () => {
	describe('serialize', () => {
		it('should serialize ', () => {
			const sut = new TimeTriggerSerializer();
			const trigger = new TimeTrigger(12, 30, [Weekday.Monday, Weekday.Thursday]);
			const serialized = sut.serialize(trigger);
			const json = JSON.parse(serialized);
			expect(json.type).to.equal(TimeTriggerSerializer.TYPE);
			expect(json.hour).to.equal(12);
			expect(json.minute).to.equal(30);
			expect(json.weekdays.length).to.equal(2);
			expect(json.weekdays.includes(Weekday.Monday)).to.equal(true);
			expect(json.weekdays.includes(Weekday.Thursday)).to.equal(true);
		});

		it('throws when objectToSerialize is null', () => {
			const sut = new TimeTriggerSerializer();
			// @ts-ignore
			expect(() => sut.serialize(null)).to.throw();
		});
	});

	describe('deserialize', () => {
		it('should deserialize ', () => {
			const sut = new TimeTriggerSerializer();
			const serialized = `{"type": "${TimeTriggerSerializer.TYPE}", "hour": 5, "minute": 57, "weekdays": [3, 5, 4]}`;
			const deserialized = sut.deserialize(serialized);
			expect(deserialized.getHour()).to.equal(5);
			expect(deserialized.getMinute()).to.equal(57);
			expect(deserialized.getWeekdays().length).to.equal(3);
			expect(deserialized.getWeekdays().includes(Weekday.Thursday)).to.equal(true);
			expect(deserialized.getWeekdays().includes(Weekday.Wednesday)).to.equal(true);
			expect(deserialized.getWeekdays().includes(Weekday.Friday)).to.equal(true);
		});

		it('throws when type is not time', () => {
			const sut = new TimeTriggerSerializer();
			const serialized = `{"type": "astro", "hour": 5, "minute": 57, "weekdays": [3, 5, 4]}`;
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when stringToDeserialize is empty', () => {
			const sut = new TimeTriggerSerializer();
			const serialized = '';
			// @ts-ignore
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when stringToDeserialize is invalid json', () => {
			const sut = new TimeTriggerSerializer();
			const serialized = 'abc';
			// @ts-ignore
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property type is missing', () => {
			const sut = new TimeTriggerSerializer();
			const serialized = `{"minute": 12, "hour": 10, "weekdays": [1]}`;
			// @ts-ignore
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property hour is missing', () => {
			const sut = new TimeTriggerSerializer();
			const serialized = `{"type": "${TimeTriggerSerializer.TYPE}", "minute": 57, "weekdays": [3, 5, 4]}`;
			// @ts-ignore
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property minute is missing', () => {
			const sut = new TimeTriggerSerializer();
			const serialized = `{"type": "${TimeTriggerSerializer.TYPE}", "hour": 10, weekdays": [3, 5, 4]}`;
			// @ts-ignore
			expect(() => sut.deserialize(serialized)).to.throw();
		});

		it('throws when property weekdays is missing', () => {
			const sut = new TimeTriggerSerializer();
			const serialized = `{"type": "${TimeTriggerSerializer.TYPE}", "minute": 12, "hour": 10}`;
			// @ts-ignore
			expect(() => sut.deserialize(serialized)).to.throw();
		});
	});
});
