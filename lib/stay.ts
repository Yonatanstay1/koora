export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function stayError(
  arrive: string,
  depart: string,
  required = false,
): string {
  if (!arrive && !depart)
    return required ? "Choose your arrival and departure dates." : "";
  if (!validDate(arrive) || !validDate(depart))
    return "Choose both arrival and departure dates.";
  if (arrive < todayISO()) return "Your arrival must be today or later.";
  if (depart <= arrive) return "Departure must be after arrival.";
  return "";
}
export function nightsBetween(a: string, b: string) {
  return validDate(a) && validDate(b) && b > a
    ? Math.round((Date.parse(b) - Date.parse(a)) / 86400000)
    : 0;
}
export function stayQuery(params: URLSearchParams) {
  const result = new URLSearchParams();
  for (const key of ["arrive", "depart", "guests"]) {
    const value = params.get(key);
    if (value) result.set(key, value);
  }
  return result.toString();
}
