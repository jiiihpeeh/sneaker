import type { SettingField, SettingValue } from "../types";

const SETTINGS_DIR = "./data";

const fs = typeof import.meta !== "undefined" && "fs" in import.meta
  ? (await import("node:fs")).promises
  : null;

async function ensureDir(path: string): Promise<void> {
  if (!fs) return;
  try {
    await fs.mkdir(path, { recursive: true });
  } catch {}
}

async function readJsonFile<T>(path: string, fallback: T): Promise<T> {
  if (!fs) return fallback;
  try {
    const data = await fs.readFile(path, "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(path: string, data: T): Promise<void> {
  if (!fs) return;
  await ensureDir(path.substring(0, path.lastIndexOf("/")));
  await fs.writeFile(path, JSON.stringify(data, null, 2), "utf-8");
}

export async function getSettings(
  id: string,
): Promise<Record<string, SettingValue>> {
  const filePath = `${SETTINGS_DIR}/settings/${id}.json`;
  return readJsonFile(filePath, {});
}

export async function setSettings(
  id: string,
  settings: Record<string, SettingValue>,
): Promise<void> {
  const filePath = `${SETTINGS_DIR}/settings/${id}.json`;
  await writeJsonFile(filePath, settings);
}

export async function isDisabled(id: string): Promise<boolean> {
  const settings = await getSettings(id);
  return settings.disabled === "true";
}

export function asString(value: SettingValue): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0) return value[0];
  return "";
}

export function asArray(value: SettingValue): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value) return [value];
  return [];
}

export function mergeDefaults(
  settings: Record<string, SettingValue>,
  schema: SettingField[],
): Record<string, SettingValue> {
  const result: Record<string, SettingValue> = { ...settings };
  for (const field of schema) {
    if (field.key in result) continue;
    if (field.type === "toggle") {
      result[field.key] = "false";
    } else if (field.type === "select" && field.options && field.options.length > 0) {
      result[field.key] = field.options[0];
    } else {
      result[field.key] = "";
    }
  }
  return result;
}

export function mergeSecrets(
  incoming: Record<string, SettingValue>,
  existing: Record<string, SettingValue>,
  schema: SettingField[],
): Record<string, SettingValue> {
  const secrets = new Set(schema.filter((f) => f.secret).map((f) => f.key));
  const result: Record<string, SettingValue> = { ...existing };
  for (const [key, value] of Object.entries(incoming)) {
    if (secrets.has(key) && typeof value === "string" && value === "") {
      continue;
    }
    result[key] = value;
  }
  return result;
}

export function maskSecrets(
  settings: Record<string, SettingValue>,
  schema: SettingField[],
): Record<string, SettingValue> {
  const secrets = new Set(schema.filter((f) => f.secret).map((f) => f.key));
  const result: Record<string, SettingValue> = { ...settings };
  for (const key of secrets) {
    if (typeof result[key] === "string" && result[key]) {
      result[key] = "********";
    }
  }
  return result;
}

export async function getSettingsTokenFromRequest(_req: Request): Promise<string | null> {
  return null;
}

export async function validateSettingsToken(_token: string | null): Promise<boolean> {
  return true;
}
