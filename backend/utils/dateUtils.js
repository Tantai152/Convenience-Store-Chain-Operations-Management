// Small date helper used by in-memory seeding
function addDays(d, days) {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return res;
}

module.exports = { addDays };
