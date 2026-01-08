import { enrichWithOrientation } from "./orientationService.js";

export function collectFormData(form) {
  if (!form) return {};
  const data = {};
  const entries = new FormData(form);
  for (const [rawKey, value] of entries) {
    const key = rawKey.endsWith("[]") ? rawKey.slice(0, -2) : rawKey;
    if (data[key] === undefined) {
      data[key] = value;
      continue;
    }
    if (Array.isArray(data[key])) {
      data[key].push(value);
      continue;
    }
    data[key] = [data[key], value];
  }
  return enrichWithOrientation(data);
}

export function getRequiredFields(stepElement) {
  if (!stepElement) return [];
  return Array.from(stepElement.querySelectorAll("input[required], select[required], textarea[required]"));
}

export function areFieldsFilled(fields) {
  return fields.every((field) => field.value.trim() !== "");
}
