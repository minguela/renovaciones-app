import test from 'node:test';
import assert from 'node:assert/strict';
import { nextOccurrence, daysBetween, shouldRemind } from '../lib/notifications/reminders.ts';

test('monthly charges keep their billing day and clamp short months', () => {
  assert.equal(nextOccurrence('2026-01-31', 'monthly', '2026-02-01'), '2026-02-28');
  assert.equal(nextOccurrence('2026-01-31', 'monthly', '2026-03-01'), '2026-03-31');
});

test('annual leap-day renewal is projected into non-leap years', () => {
  assert.equal(nextOccurrence('2024-02-29', 'annual', '2025-01-01'), '2025-02-28');
});

test('one-time charges stop after their date and calendar days ignore timezones', () => {
  assert.equal(nextOccurrence('2026-09-14', 'one-time', '2026-09-15'), null);
  assert.equal(daysBetween('2026-09-15', '2026-09-16'), 1);
});

test('reminders cover the chosen lead time plus near-due follow-ups', () => {
  assert.equal(shouldRemind(14, 14), true);
  assert.equal(shouldRemind(7, 14), true);
  assert.equal(shouldRemind(3, 14), true);
  assert.equal(shouldRemind(1, 14), true);
  assert.equal(shouldRemind(0, 14), true);
  assert.equal(shouldRemind(10, 14), false);
  assert.equal(shouldRemind(7, 3), false);
});
