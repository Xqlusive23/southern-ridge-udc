import { BANK_NAME, BANK_SHORT } from "@/lib/constants";
import { findUsBank, isHomeBank } from "@/lib/us-banks";

export type BankBrand = {
  name: string;
  shortName: string;
  initials: string;
  color: string;
  accent: string;
  logoDomain: string;
};

const HOME_BRAND: BankBrand = {
  name: BANK_NAME,
  shortName: BANK_SHORT,
  initials: "SR",
  color: "#0B2340",
  accent: "#2F7A45",
  logoDomain: "",
};

const SHORT_NAMES: Record<string, string> = {
  "JPMorgan Chase Bank": "Chase",
  "Bank of America": "Bank of America",
  "Wells Fargo Bank": "Wells Fargo",
  Citibank: "Citi",
  "U.S. Bank": "U.S. Bank",
  "PNC Bank": "PNC",
  "Capital One": "Capital One",
  "TD Bank": "TD Bank",
  "Truist Bank": "Truist",
  "Goldman Sachs Bank USA": "Goldman Sachs",
  "Morgan Stanley Private Bank": "Morgan Stanley",
  "HSBC Bank USA": "HSBC",
  "Fifth Third Bank": "Fifth Third",
  "Citizens Bank": "Citizens",
  KeyBank: "KeyBank",
  "Regions Bank": "Regions",
  "Huntington National Bank": "Huntington",
  "M&T Bank": "M&T",
  "BMO Bank": "BMO",
  "Ally Bank": "Ally",
  "Discover Bank": "Discover",
  "USAA Federal Savings Bank": "USAA",
  "Charles Schwab Bank": "Schwab",
  "Marcus by Goldman Sachs": "Marcus",
  "Synchrony Bank": "Synchrony",
  "Navy Federal Credit Union": "Navy Federal",
  "PenFed Credit Union": "PenFed",
  "State Employees' Credit Union": "SECU",
  "Green Dot Bank": "Green Dot",
  "Pathward, N.A. (MetaBank)": "Pathward",
  "The Bancorp Bank": "Bancorp",
  Chime: "Chime",
  "Cash App": "Cash App",
  Venmo: "Venmo",
  "SoFi Bank": "SoFi",
  "Varo Bank": "Varo",
};

const BRAND_COLORS: Record<string, [string, string]> = {
  Chase: ["#117ACA", "#0B4F8A"],
  "Bank of America": ["#012169", "#E31837"],
  "Wells Fargo": ["#D71E28", "#FFCD41"],
  Citi: ["#003B70", "#00BDF2"],
  "U.S. Bank": ["#0C2074", "#D22630"],
  PNC: ["#F28033", "#F28033"],
  "Capital One": ["#004977", "#D03027"],
  "TD Bank": ["#34B233", "#34B233"],
  Truist: ["#1C3F94", "#6CC24A"],
  Chime: ["#1ECAD3", "#0B2340"],
  "Cash App": ["#00D632", "#00D632"],
  Venmo: ["#008CFF", "#008CFF"],
  "Navy Federal": ["#00205B", "#C5A572"],
  SoFi: ["#00A7E1", "#00A7E1"],
};

const LOGO_DOMAINS: Record<string, string> = {
  Chase: "chase.com",
  "Bank of America": "bankofamerica.com",
  "Wells Fargo": "wellsfargo.com",
  Citi: "citi.com",
  "U.S. Bank": "usbank.com",
  PNC: "pnc.com",
  "Capital One": "capitalone.com",
  "TD Bank": "td.com",
  Truist: "truist.com",
  "Goldman Sachs": "goldmansachs.com",
  "Morgan Stanley": "morganstanley.com",
  HSBC: "us.hsbc.com",
  "Fifth Third": "53.com",
  Citizens: "citizensbank.com",
  KeyBank: "key.com",
  Regions: "regions.com",
  Huntington: "huntington.com",
  "M&T": "mtb.com",
  BMO: "bmo.com",
  Ally: "ally.com",
  Discover: "discover.com",
  USAA: "usaa.com",
  Schwab: "schwab.com",
  Marcus: "marcus.com",
  Synchrony: "synchrony.com",
  "Navy Federal": "navyfederal.org",
  PenFed: "penfed.org",
  SECU: "ncsecu.org",
  "Green Dot": "greendot.com",
  Pathward: "pathward.com",
  Bancorp: "thebancorp.com",
  Chime: "chime.com",
  "Cash App": "cash.app",
  Venmo: "venmo.com",
  SoFi: "sofi.com",
  Varo: "varomoney.com",
};

function initialsFrom(name: string) {
  const words = name
    .replace(/[(),]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !/^(bank|the|of|n\.?a\.?|usa|federal|national|credit|union|by)$/i.test(word));
  const letters = (words[0]?.[0] ?? "B") + (words[1]?.[0] ?? words[0]?.[1] ?? "K");
  return letters.toUpperCase();
}

export function homeBankBrand(): BankBrand {
  return HOME_BRAND;
}

export function brandForBankName(name: string): BankBrand {
  const trimmed = name.trim();
  if (!trimmed || isHomeBank(trimmed)) return HOME_BRAND;
  const known = findUsBank(trimmed);
  const canonical = known?.name ?? trimmed;
  const shortName = SHORT_NAMES[canonical] ?? canonical.replace(/\s+Bank(?:\s+USA)?$/i, "").trim();
  const [color, accent] = BRAND_COLORS[shortName] ?? ["#122033", "#2F7A45"];
  return {
    name: canonical,
    shortName,
    initials: initialsFrom(shortName),
    color,
    accent,
    logoDomain: LOGO_DOMAINS[shortName] ?? "",
  };
}

export function receivingBankNameFromDetails(details?: string | null) {
  if (!details) return "";
  for (const part of details.split("·")) {
    const candidate = part.trim();
    if (!candidate || /@/.test(candidate) || /^routing\b/i.test(candidate) || /^\d+$/.test(candidate)) {
      continue;
    }
    if (isHomeBank(candidate) || findUsBank(candidate)) return candidate;
  }
  return "";
}

export function bankBrandFromDetails(details?: string | null) {
  const name = receivingBankNameFromDetails(details);
  return name ? brandForBankName(name) : HOME_BRAND;
}
