const DEFAULT_ALPHA = 1;
const DEFAULT_BETA = 0.15;

function toMinutes(value) {
  return Math.round(value / (60 * 1000));
}

function bookingsOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

function getNearestGapMinutes(bookings = [], start, end) {
  if (!bookings.length) return 120;

  let minGap = Number.POSITIVE_INFINITY;

  for (const slot of bookings) {
    const bookedStart = new Date(slot.start);
    const bookedEnd = new Date(slot.end);

    if (bookingsOverlap(start, end, bookedStart, bookedEnd)) {
      return 0;
    }

    const gapBefore = Math.abs(start.getTime() - bookedEnd.getTime());
    const gapAfter = Math.abs(bookedStart.getTime() - end.getTime());
    const nearest = Math.min(gapBefore, gapAfter);

    if (nearest < minGap) {
      minGap = nearest;
    }
  }

  return Number.isFinite(minGap) ? toMinutes(minGap) : 120;
}

export function scoreTable(table, peopleCount, start, end, alpha = DEFAULT_ALPHA, beta = DEFAULT_BETA) {
  const waste = Math.max(0, (table.capacity || 0) - (peopleCount || 1));
  const timeGap = getNearestGapMinutes(table.bookings || [], start, end);

  return {
    table,
    waste,
    timeGap,
    score: (alpha * waste) + (beta * timeGap)
  };
}

export function pickBestTable({ tables = [], peopleCount = 1, start, end, alpha = DEFAULT_ALPHA, beta = DEFAULT_BETA }) {
  const candidates = [];

  for (const table of tables) {
    const capacity = table.capacity || 0;
    if (capacity < peopleCount) continue;
    if (table.available === false) continue;

    const hasOverlap = (table.bookings || []).some((slot) => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      return bookingsOverlap(start, end, slotStart, slotEnd);
    });

    if (hasOverlap) continue;
    candidates.push(scoreTable(table, peopleCount, start, end, alpha, beta));
  }

  if (!candidates.length) {
    return null;
  }

  candidates.sort((a, b) => a.score - b.score);
  return candidates[0];
}

export function getBookingWindow(date, time, slotMinutes = 90) {
  const start = new Date(`${date}T${time}`);
  const end = new Date(start.getTime() + slotMinutes * 60 * 1000);
  return { start, end };
}
