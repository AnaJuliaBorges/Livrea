const STORAGE_KEY = "signup_wizard";

export function loadWizard() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveWizard(data: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearWizard() {
  localStorage.removeItem(STORAGE_KEY);
}
