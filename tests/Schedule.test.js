import React from 'react'
import ReactTestUtils from 'react-addons-test-utils' 
import Schedule from '../src/components/Schedule.jsx'

const ScheduleComponent = ReactTestUtils.renderIntoDocument(<Schedule />);

test('create new schedule', () => {
	ScheduleComponent.createSchedule('10:00', 1);
	expect(ScheduleComponent.state.schedules[0].time).toBe('10:00');
	expect(ScheduleComponent.state.schedules[0].rep).toBe("1");
	expect(ScheduleComponent.state.schedules[0].isActive).toBe(true);
	expect(ScheduleComponent.state.schedules[0].id).toBeDefined();
});

test('generate id for schedule', () => {
	expect(ScheduleComponent.generateId()).toBeGreaterThanOrEqual(0);
});

test('toggle schedule off/on', () => {
	const id = ScheduleComponent.state.schedules[0].id;
	ScheduleComponent.toggleSchedule(id);
	expect(ScheduleComponent.state.schedules[0].isActive).toBe(false);
	ScheduleComponent.toggleSchedule(id);
	expect(ScheduleComponent.state.schedules[0].isActive).toBe(true);
});

test('delete schedule', () => {
	const id = ScheduleComponent.state.schedules[0].id;
	ScheduleComponent.deleteSchedule(id);
	expect(ScheduleComponent.state.schedules[0]).toBeUndefined();
});