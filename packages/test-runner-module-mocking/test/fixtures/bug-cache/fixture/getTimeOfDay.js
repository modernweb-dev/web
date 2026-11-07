import { getCurrentHour } from './time-library.js';

export function getTimeOfDay() {
  const hour = getCurrentHour();
  if (hour < 6 || hour > 18) {
    return 'night';
  }
  return 'day';
}
