export function extractSmartsuppKey(value: string) {
  const raw = value.trim();
  if (!raw) return "";
  const fromScript = raw.match(/_smartsupp\.key\s*=\s*['"]([a-f0-9]{16,64})['"]/i);
  if (fromScript?.[1]) return fromScript[1];
  const hex = raw.match(/^[a-f0-9]{16,64}$/i);
  return hex ? hex[0] : "";
}

export async function smartsuppWidgetExists(key: string) {
  if (!key) return false;
  try {
    const response = await fetch(
      `https://bootstrap.smartsuppchat.com/widget/${key}.json`,
      { cache: "no-store" },
    );
    return response.ok;
  } catch {
    return false;
  }
}
