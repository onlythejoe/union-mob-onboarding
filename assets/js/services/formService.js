export function collectFormData(form) {
  if (!form) return {};
  return Object.fromEntries(new FormData(form).entries());
}

export function getRequiredFields(stepElement) {
  if (!stepElement) return [];
  return Array.from(stepElement.querySelectorAll("input[required], select[required], textarea[required]"));
}

export function areFieldsFilled(fields) {
  return fields.every((field) => field.value.trim() !== "");
}
