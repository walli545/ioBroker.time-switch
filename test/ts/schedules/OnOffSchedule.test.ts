import * as TypeMoq from 'typemoq';
import { IMock, It, Times } from 'typemoq';
import { OnOffStateAction } from '../../../src/actions/OnOffStateAction';
import { UniversalTriggerScheduler } from '../../../src/scheduler/UniversalTriggerScheduler';
import { OnOffSchedule } from '../../../src/schedules/OnOffSchedule';
import { expect } from 'chai';
import { Trigger } from '../../../src/triggers/Trigger';
import { OnOffStateActionBuilder } from '../../../src/actions/OnOffStateActionBuilder';
import { StateService } from '../../../src/services/StateService';
import { Action } from '../../../src/actions/Action';

describe('OnOffSchedule', () => {
	let onAction: TypeMoq.IMock<OnOffStateAction<number>>;
	let offAction: TypeMoq.IMock<OnOffStateAction<number>>;
	let triggerScheduler: TypeMoq.IMock<UniversalTriggerScheduler>;
	let sut: OnOffSchedule;

	beforeEach(() => {
		onAction = TypeMoq.Mock.ofType<OnOffStateAction<number>>();
		offAction = TypeMoq.Mock.ofType<OnOffStateAction<number>>();
		triggerScheduler = TypeMoq.Mock.ofType<UniversalTriggerScheduler>();
		sut = new OnOffSchedule(onAction.object, offAction.object, triggerScheduler.object);
	});

	describe('ctor', () => {
		it('throws when onAction is null', () => {
			expect(() => new OnOffSchedule(null as any, offAction.object, triggerScheduler.object)).to.throw();
		});

		it('throws when onAction is undefined', () => {
			expect(() => new OnOffSchedule(undefined as any, offAction.object, triggerScheduler.object)).to.throw();
		});

		it('throws when offAction is null', () => {
			expect(() => new OnOffSchedule(onAction.object, null as any, triggerScheduler.object)).to.throw();
		});

		it('throws when offAction is undefined', () => {
			expect(() => new OnOffSchedule(onAction.object, undefined as any, triggerScheduler.object)).to.throw();
		});

		it('throws when triggerScheduler is null', () => {
			expect(() => new OnOffSchedule(onAction.object, offAction.object, null as any)).to.throw();
		});

		it('throws when triggerScheduler is undefined', () => {
			expect(() => new OnOffSchedule(onAction.object, offAction.object, undefined as any)).to.throw();
		});

		it('creates', () => {
			const sut = new OnOffSchedule(onAction.object, offAction.object, triggerScheduler.object);
			expect(sut.getOnAction()).to.equal(onAction.object);
			expect(sut.getOffAction()).to.equal(offAction.object);
			expect(sut.isEnabled()).to.be.false;
			expect(sut.getName()).to.equal('New Schedule');
			expect(sut.getTriggers()).to.deep.equal([]);
		});
	});

	describe('set name', () => {
		it('should set name', () => {
			expect(sut.getName()).to.equal('New Schedule');
			sut.setName('My Schedule');
			expect(sut.getName()).to.equal('My Schedule');
		});

		it('throws when name is null', () => {
			expect(() => sut.setName(null as any)).to.throw();
		});

		it('throws when name is undefined', () => {
			expect(() => sut.setName(undefined as any)).to.throw();
		});
	});

	describe('set enabled', () => {
		it('should register triggers when changed from false to true', () => {
			expect(sut.isEnabled()).to.be.false;
			const t1 = createMockTrigger('1');
			const t2 = createMockTrigger('2');
			sut.addTrigger(t1.object);
			sut.addTrigger(t2.object);
			triggerScheduler.reset();

			sut.setEnabled(true);

			triggerScheduler.verify(s => s.register(t1.object), Times.once());
			triggerScheduler.verify(s => s.register(t2.object), Times.once());
			triggerScheduler.verify(s => s.register(It.isAny()), Times.exactly(2));
			triggerScheduler.verify(s => s.unregister(It.isAny()), Times.never());
			triggerScheduler.verify(s => s.unregisterAll(), Times.never());
			expect(sut.isEnabled()).to.be.true;
		});

		it('should do nothing when changed from false to false', () => {
			expect(sut.isEnabled()).to.be.false;
			const t1 = createMockTrigger('1');
			const t2 = createMockTrigger('2');
			sut.addTrigger(t1.object);
			sut.addTrigger(t2.object);
			triggerScheduler.reset();

			sut.setEnabled(false);

			triggerScheduler.verify(s => s.unregister(It.isAny()), Times.never());
			triggerScheduler.verify(s => s.unregisterAll(), Times.never());
			triggerScheduler.verify(s => s.unregister(It.isAny()), Times.never());
			expect(sut.isEnabled()).to.be.false;
		});

		it('should unregister triggers when changed from true to false', () => {
			sut.setEnabled(true);
			const t1 = createMockTrigger('1');
			const t2 = createMockTrigger('2');
			sut.addTrigger(t1.object);
			sut.addTrigger(t2.object);
			triggerScheduler.reset();

			sut.setEnabled(false);

			triggerScheduler.verify(s => s.unregister(It.isAny()), Times.never());
			triggerScheduler.verify(s => s.unregisterAll(), Times.once());
			triggerScheduler.verify(s => s.unregister(It.isAny()), Times.never());
			expect(sut.isEnabled()).to.be.false;
		});

		it('should do nothing when changed from true to true', () => {
			sut.setEnabled(true);
			const t1 = createMockTrigger('1');
			const t2 = createMockTrigger('2');
			sut.addTrigger(t1.object);
			sut.addTrigger(t2.object);
			triggerScheduler.reset();

			sut.setEnabled(true);

			triggerScheduler.verify(s => s.unregister(It.isAny()), Times.never());
			triggerScheduler.verify(s => s.unregisterAll(), Times.never());
			triggerScheduler.verify(s => s.unregister(It.isAny()), Times.never());
			expect(sut.isEnabled()).to.be.true;
		});
	});

	describe('add trigger', () => {
		it('should add trigger', () => {
			expect(sut.getTriggers()).to.deep.equal([]);
			const t = createMockTrigger('1');
			sut.addTrigger(t.object);
			expect(sut.getTriggers()).to.deep.equal([t.object]);
		});

		it('should add two triggers', () => {
			expect(sut.getTriggers()).to.deep.equal([]);
			const t1 = createMockTrigger('1');
			const t2 = createMockTrigger('2');
			sut.addTrigger(t1.object);
			sut.addTrigger(t2.object);
			expect(sut.getTriggers()).to.deep.equal([t1.object, t2.object]);
		});

		it('throws when adding trigger id twice', () => {
			expect(sut.getTriggers()).to.deep.equal([]);
			const t1 = createMockTrigger('1');
			sut.addTrigger(t1.object);
			expect(() => sut.addTrigger(t1.object)).to.throw();
			expect(sut.getTriggers()).to.deep.equal([t1.object]);
		});

		it('should register trigger when enabled', () => {
			sut.setEnabled(true);
			const t = createMockTrigger('1');
			sut.addTrigger(t.object);
			triggerScheduler.verify(s => s.register(t.object), Times.once());
		});

		it('should not register trigger when disabled', () => {
			sut.setEnabled(false);
			const t = createMockTrigger('1');
			sut.addTrigger(t.object);
			triggerScheduler.verify(s => s.register(t.object), Times.never());
		});
	});

	describe('remove trigger', () => {
		it('should remove trigger', () => {
			const t = createMockTrigger('1');
			sut.addTrigger(t.object);
			sut.removeTrigger('1');
			expect(sut.getTriggers()).to.deep.equal([]);
		});

		it('throws when trigger not found', () => {
			const t = createMockTrigger('1');
			sut.addTrigger(t.object);
			expect(() => sut.removeTrigger('2')).to.throw();
			expect(sut.getTriggers()).to.deep.equal([t.object]);
		});

		it('should unregister trigger when enabled', () => {
			sut.setEnabled(true);
			const t = createMockTrigger('1');
			sut.addTrigger(t.object);
			sut.removeTrigger('1');
			triggerScheduler.verify(s => s.unregister(t.object), Times.once());
			triggerScheduler.verify(s => s.unregister(It.isAny()), Times.once());
			triggerScheduler.verify(s => s.unregisterAll(), Times.never());
		});

		it('should not unregister trigger when disabled', () => {
			sut.setEnabled(false);
			const t = createMockTrigger('1');
			sut.addTrigger(t.object);
			sut.removeTrigger('1');
			triggerScheduler.verify(s => s.unregister(It.isAny()), Times.never());
			triggerScheduler.verify(s => s.unregisterAll(), Times.never());
		});
	});

	describe('update trigger', () => {
		it('throws when trigger not found', () => {
			const t = createMockTrigger('1');
			expect(() => sut.updateTrigger(t.object)).to.throw();
			expect(sut.getTriggers()).to.deep.equal([]);
		});

		it('should update trigger', () => {
			const oldTrigger = createMockTrigger('1');
			sut.addTrigger(oldTrigger.object);
			const newTrigger = createMockTrigger('1');

			sut.updateTrigger(newTrigger.object);

			expect(sut.getTriggers()).to.deep.equal([newTrigger.object]);
		});

		it('should keep order', () => {
			const oldTrigger1 = createMockTrigger('1');
			const oldTrigger2 = createMockTrigger('2');
			sut.addTrigger(oldTrigger1.object);
			sut.addTrigger(oldTrigger2.object);
			const newTrigger = createMockTrigger('1');

			sut.updateTrigger(newTrigger.object);

			expect(sut.getTriggers()).to.deep.equal([newTrigger.object, oldTrigger2.object]);
		});

		it('should unregister old trigger when enabled', () => {
			sut.setEnabled(true);
			const oldTrigger = createMockTrigger('1');
			sut.addTrigger(oldTrigger.object);
			triggerScheduler.reset();
			const newTrigger = createMockTrigger('1');

			sut.updateTrigger(newTrigger.object);

			triggerScheduler.verify(s => s.unregister(oldTrigger.object), Times.once());
			triggerScheduler.verify(s => s.unregister(It.isAny()), Times.once());
			triggerScheduler.verify(s => s.unregisterAll(), Times.never());
		});

		it('should not unregister old trigger when disabled', () => {
			sut.setEnabled(false);
			const oldTrigger = createMockTrigger('1');
			sut.addTrigger(oldTrigger.object);
			triggerScheduler.reset();
			const newTrigger = createMockTrigger('1');

			sut.updateTrigger(newTrigger.object);

			triggerScheduler.verify(s => s.unregister(It.isAny()), Times.never());
			triggerScheduler.verify(s => s.unregisterAll(), Times.never());
		});

		it('should register new trigger when enabled', () => {
			sut.setEnabled(true);
			const oldTrigger = createMockTrigger('1');
			sut.addTrigger(oldTrigger.object);
			triggerScheduler.reset();
			const newTrigger = createMockTrigger('1');

			sut.updateTrigger(newTrigger.object);

			triggerScheduler.verify(s => s.register(newTrigger.object), Times.once());
			triggerScheduler.verify(s => s.register(It.isAny()), Times.once());
		});

		it('should not register new trigger when disabled', () => {
			sut.setEnabled(false);
			const oldTrigger = createMockTrigger('1');
			sut.addTrigger(oldTrigger.object);
			triggerScheduler.reset();
			const newTrigger = createMockTrigger('1');

			sut.updateTrigger(newTrigger.object);

			triggerScheduler.verify(s => s.register(It.isAny()), Times.never());
		});
	});

	describe('remove all triggers', () => {
		it('should remove all triggers', () => {
			const t1 = createMockTrigger('1');
			const t2 = createMockTrigger('2');
			sut.addTrigger(t1.object);
			sut.addTrigger(t2.object);

			sut.removeAllTriggers();
			expect(sut.getTriggers()).to.deep.equal([]);
		});

		it('should unregister all triggers when enabled', () => {
			sut.setEnabled(true);
			const t1 = createMockTrigger('1');
			const t2 = createMockTrigger('2');
			sut.addTrigger(t1.object);
			sut.addTrigger(t2.object);
			triggerScheduler.reset();

			sut.removeAllTriggers();

			triggerScheduler.verify(s => s.unregisterAll(), Times.once());
			triggerScheduler.verify(s => s.unregister(It.isAny()), Times.never());
		});

		it('should not unregister all triggers when disabled', () => {
			sut.setEnabled(false);
			const t1 = createMockTrigger('1');
			const t2 = createMockTrigger('2');
			sut.addTrigger(t1.object);
			sut.addTrigger(t2.object);
			triggerScheduler.reset();

			sut.removeAllTriggers();

			triggerScheduler.verify(s => s.unregisterAll(), Times.never());
			triggerScheduler.verify(s => s.unregister(It.isAny()), Times.never());
		});
	});

	describe('set on action', () => {
		it('throws when new action is null ', () => {
			expect(() => sut.setOnAction(null as any)).to.throw();
		});

		it('throws when new action is undefined ', () => {
			expect(() => sut.setOnAction(undefined as any)).to.throw();
		});

		it('should set new on action', () => {
			const newAction = TypeMoq.Mock.ofType<OnOffStateAction<string>>().object;
			sut.setOnAction(newAction);
			expect(sut.getOnAction()).to.equal(newAction);
		});

		it('should set new on action to triggers with OnOffStateActions with boolean value true', () => {
			const trigger = createMockTrigger('1');
			const action = new OnOffStateActionBuilder()
				.setOnValue('on')
				.setOffValue('off')
				.setBooleanValue(true)
				.setIdsOfStatesToSet(['ids'])
				.setStateService(TypeMoq.Mock.ofType<StateService>().object)
				.build();
			trigger.setup(t => t.getAction()).returns(_ => action);
			sut.addTrigger(trigger.object);

			const newAction = TypeMoq.Mock.ofType<OnOffStateAction<string>>().object;
			sut.setOnAction(newAction);
			trigger.verify(t => t.setAction(newAction), Times.once());
		});

		it('should not set new on action to triggers with OnOffStateActions with boolean value false', () => {
			const trigger = createMockTrigger('1');
			const action = new OnOffStateActionBuilder()
				.setOnValue('on')
				.setOffValue('off')
				.setBooleanValue(false)
				.setIdsOfStatesToSet(['ids'])
				.setStateService(TypeMoq.Mock.ofType<StateService>().object)
				.build();
			trigger.setup(t => t.getAction()).returns(_ => action);
			sut.addTrigger(trigger.object);

			const newAction = TypeMoq.Mock.ofType<OnOffStateAction<string>>().object;
			sut.setOnAction(newAction);
			trigger.verify(t => t.setAction(It.isAny()), Times.never());
		});

		it('should not set new on action to triggers with another type of action', () => {
			const trigger = createMockTrigger('1');
			const action = TypeMoq.Mock.ofType<Action>();
			trigger.setup(t => t.getAction()).returns(_ => action.object);
			sut.addTrigger(trigger.object);

			const newAction = TypeMoq.Mock.ofType<OnOffStateAction<string>>().object;
			sut.setOnAction(newAction);
			trigger.verify(t => t.setAction(It.isAny()), Times.never());
		});
	});

	describe('set off action', () => {
		it('throws when new action is null ', () => {
			expect(() => sut.setOffAction(null as any)).to.throw();
		});

		it('throws when new action is undefined ', () => {
			expect(() => sut.setOffAction(undefined as any)).to.throw();
		});

		it('should set new off action', () => {
			const newAction = TypeMoq.Mock.ofType<OnOffStateAction<string>>().object;
			sut.setOffAction(newAction);
			expect(sut.getOffAction()).to.equal(newAction);
		});

		it('should set new off action to triggers with OnOffStateActions with boolean value false', () => {
			const trigger = createMockTrigger('1');
			const action = new OnOffStateActionBuilder()
				.setOnValue('on')
				.setOffValue('off')
				.setBooleanValue(false)
				.setIdsOfStatesToSet(['ids'])
				.setStateService(TypeMoq.Mock.ofType<StateService>().object)
				.build();
			trigger.setup(t => t.getAction()).returns(_ => action);
			sut.addTrigger(trigger.object);

			const newAction = TypeMoq.Mock.ofType<OnOffStateAction<string>>().object;
			sut.setOffAction(newAction);
			trigger.verify(t => t.setAction(newAction), Times.once());
		});

		it('should not set new off action to triggers with OnOffStateActions with boolean value true', () => {
			const trigger = createMockTrigger('1');
			const action = new OnOffStateActionBuilder()
				.setOnValue('on')
				.setOffValue('off')
				.setBooleanValue(true)
				.setIdsOfStatesToSet(['ids'])
				.setStateService(TypeMoq.Mock.ofType<StateService>().object)
				.build();
			trigger.setup(t => t.getAction()).returns(_ => action);
			sut.addTrigger(trigger.object);

			const newAction = TypeMoq.Mock.ofType<OnOffStateAction<string>>().object;
			sut.setOffAction(newAction);
			trigger.verify(t => t.setAction(It.isAny()), Times.never());
		});

		it('should not set new off action to triggers with another type of action', () => {
			const trigger = createMockTrigger('1');
			const action = TypeMoq.Mock.ofType<Action>();
			trigger.setup(t => t.getAction()).returns(_ => action.object);
			sut.addTrigger(trigger.object);

			const newAction = TypeMoq.Mock.ofType<OnOffStateAction<string>>().object;
			sut.setOffAction(newAction);
			trigger.verify(t => t.setAction(It.isAny()), Times.never());
		});
	});

	function createMockTrigger(id: string): IMock<Trigger> {
		const t = TypeMoq.Mock.ofType<Trigger>();
		t.setup(t => t.getId()).returns(_ => id);
		return t;
	}
});
