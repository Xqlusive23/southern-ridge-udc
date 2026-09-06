import { BANK_NAME, BANK_ROUTING, BANK_SHORT } from "@/lib/constants";

export type UsBankCategory = "home" | "prepaid" | "bank" | "credit_union";

export type UsBank = {
  name: string;
  routing: string;
  category: UsBankCategory;
};

export const US_BANK_CATEGORIES: { value: UsBankCategory; label: string }[] = [
  { value: "home", label: "This credit union" },
  { value: "prepaid", label: "Prepaid banks" },
  { value: "bank", label: "Banks" },
  { value: "credit_union", label: "Credit unions & digital banks" },
];

export const US_BANKS: UsBank[] = [
  { name: BANK_NAME, routing: BANK_ROUTING, category: "home" },

  { name: "Green Dot Bank", routing: "124303201", category: "prepaid" },
  { name: "Pathward, N.A. (MetaBank)", routing: "273970116", category: "prepaid" },
  { name: "The Bancorp Bank", routing: "031101114", category: "prepaid" },
  { name: "Stride Bank", routing: "103112976", category: "prepaid" },
  { name: "Sutton Bank", routing: "041215537", category: "prepaid" },
  { name: "WebBank", routing: "124085024", category: "prepaid" },
  { name: "Cross River Bank", routing: "021214891", category: "prepaid" },
  { name: "Coastal Community Bank", routing: "125108275", category: "prepaid" },
  { name: "American Express National Bank", routing: "124303120", category: "prepaid" },
  { name: "Netspend", routing: "273970116", category: "prepaid" },
  { name: "American Express Serve", routing: "124303120", category: "prepaid" },
  { name: "Bluebird", routing: "124303120", category: "prepaid" },
  { name: "Walmart MoneyCard", routing: "124303201", category: "prepaid" },
  { name: "Go2bank", routing: "124303201", category: "prepaid" },
  { name: "ACE Elite Visa", routing: "124303201", category: "prepaid" },
  { name: "H&R Block Emerald Card", routing: "273970116", category: "prepaid" },
  { name: "Apple Cash", routing: "124303201", category: "prepaid" },
  { name: "PayPal Prepaid Mastercard", routing: "031101114", category: "prepaid" },
  { name: "Venmo", routing: "031101266", category: "prepaid" },
  { name: "Cash App", routing: "041215537", category: "prepaid" },
  { name: "Chime", routing: "103112976", category: "prepaid" },
  { name: "Current", routing: "125108275", category: "prepaid" },
  { name: "MoneyLion", routing: "031101114", category: "prepaid" },
  { name: "AccountNow", routing: "124303201", category: "prepaid" },
  { name: "Insight Visa Prepaid", routing: "273970116", category: "prepaid" },
  { name: "Brinks Money Prepaid", routing: "124303201", category: "prepaid" },
  { name: "UniRush Platinum Visa", routing: "273970116", category: "prepaid" },
  { name: "ExtraCash Visa Prepaid", routing: "124303201", category: "prepaid" },
  { name: "ReadyCredit Prepaid", routing: "124303201", category: "prepaid" },
  { name: "Uber Pro Card", routing: "124303201", category: "prepaid" },
  { name: "Netspend Skylight", routing: "273970116", category: "prepaid" },
  { name: "Prestige Prepaid Mastercard", routing: "124303201", category: "prepaid" },

  { name: "JPMorgan Chase Bank", routing: "021000021", category: "bank" },
  { name: "Bank of America", routing: "026009593", category: "bank" },
  { name: "Wells Fargo Bank", routing: "121000248", category: "bank" },
  { name: "Citibank", routing: "021000089", category: "bank" },
  { name: "U.S. Bank", routing: "091000022", category: "bank" },
  { name: "PNC Bank", routing: "043000096", category: "bank" },
  { name: "Capital One", routing: "051405515", category: "bank" },
  { name: "TD Bank", routing: "031201360", category: "bank" },
  { name: "Truist Bank", routing: "061000104", category: "bank" },
  { name: "Goldman Sachs Bank USA", routing: "124085044", category: "bank" },
  { name: "Morgan Stanley Private Bank", routing: "021000089", category: "bank" },
  { name: "HSBC Bank USA", routing: "021001088", category: "bank" },
  { name: "Fifth Third Bank", routing: "042000314", category: "bank" },
  { name: "Citizens Bank", routing: "011500120", category: "bank" },
  { name: "KeyBank", routing: "041001039", category: "bank" },
  { name: "Regions Bank", routing: "062000019", category: "bank" },
  { name: "Huntington National Bank", routing: "044000024", category: "bank" },
  { name: "M&T Bank", routing: "022000046", category: "bank" },
  { name: "BMO Bank", routing: "071000288", category: "bank" },
  { name: "Ally Bank", routing: "124003116", category: "bank" },
  { name: "Discover Bank", routing: "031100649", category: "bank" },
  { name: "USAA Federal Savings Bank", routing: "314074269", category: "bank" },
  { name: "Charles Schwab Bank", routing: "121202211", category: "bank" },
  { name: "Marcus by Goldman Sachs", routing: "124085044", category: "bank" },
  { name: "Synchrony Bank", routing: "021213591", category: "bank" },
  { name: "First-Citizens Bank", routing: "053100300", category: "bank" },
  { name: "Comerica Bank", routing: "111000753", category: "bank" },
  { name: "Zions Bank", routing: "124000054", category: "bank" },
  { name: "Webster Bank", routing: "211170101", category: "bank" },
  { name: "Flagstar Bank", routing: "272471852", category: "bank" },
  { name: "Santander Bank", routing: "231372691", category: "bank" },
  { name: "Frost Bank", routing: "114000093", category: "bank" },
  { name: "BOK Financial", routing: "103900036", category: "bank" },
  { name: "Valley National Bank", routing: "021201383", category: "bank" },
  { name: "East West Bank", routing: "322070381", category: "bank" },
  { name: "Synovus Bank", routing: "061100606", category: "bank" },
  { name: "Associated Bank", routing: "075900575", category: "bank" },
  { name: "Old National Bank", routing: "086300012", category: "bank" },
  { name: "Wintrust Bank", routing: "071925444", category: "bank" },
  { name: "Commerce Bank", routing: "101000019", category: "bank" },
  { name: "UMB Bank", routing: "101000695", category: "bank" },
  { name: "First Horizon Bank", routing: "084000026", category: "bank" },
  { name: "SouthState Bank", routing: "053207766", category: "bank" },
  { name: "Western Alliance Bank", routing: "122105889", category: "bank" },
  { name: "City National Bank", routing: "122016066", category: "bank" },
  { name: "Northern Trust", routing: "071000152", category: "bank" },
  { name: "BankUnited", routing: "267090594", category: "bank" },
  { name: "Axos Bank", routing: "122287251", category: "bank" },
  { name: "Live Oak Bank", routing: "053208116", category: "bank" },
  { name: "Customers Bank", routing: "031302955", category: "bank" },
  { name: "EverBank", routing: "063092101", category: "bank" },
  { name: "Barclays Bank Delaware", routing: "031101154", category: "bank" },
  { name: "First National Bank of Omaha", routing: "104000016", category: "bank" },
  { name: "Popular Bank", routing: "021502011", category: "bank" },
  { name: "Bank of the West", routing: "121100782", category: "bank" },

  { name: "Navy Federal Credit Union", routing: "256074974", category: "credit_union" },
  { name: "PenFed Credit Union", routing: "256078447", category: "credit_union" },
  { name: "State Employees' Credit Union", routing: "253177049", category: "credit_union" },
  { name: "BECU", routing: "325081403", category: "credit_union" },
  { name: "Golden 1 Credit Union", routing: "321175261", category: "credit_union" },
  { name: "SchoolsFirst Federal Credit Union", routing: "322282001", category: "credit_union" },
  { name: "America First Credit Union", routing: "324377516", category: "credit_union" },
  { name: "Suncoast Credit Union", routing: "263182777", category: "credit_union" },
  { name: "Alliant Credit Union", routing: "271081528", category: "credit_union" },
  { name: "Mountain America Credit Union", routing: "324079555", category: "credit_union" },
  { name: "Randolph-Brooks Federal Credit Union", routing: "314089681", category: "credit_union" },
  { name: "Bethpage Federal Credit Union", routing: "221471925", category: "credit_union" },
  { name: "Digital Federal Credit Union", routing: "211391825", category: "credit_union" },
  { name: "SoFi Bank", routing: "121145349", category: "credit_union" },
  { name: "Varo Bank", routing: "124303201", category: "credit_union" },
];

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function isUsAccountNumber(value: string) {
  return /^\d{4,17}$/.test(value);
}

export function isUsRoutingNumber(value: string) {
  return /^\d{9}$/.test(value);
}

export function findUsBank(name: string) {
  const needle = name.trim().toLowerCase();
  return US_BANKS.find((bank) => bank.name.toLowerCase() === needle) ?? null;
}

export function isHomeBank(name: string) {
  const needle = name.trim().toLowerCase();
  return (
    needle === BANK_NAME.toLowerCase() ||
    needle === BANK_SHORT.toLowerCase() ||
    needle.includes("southern ridge")
  );
}

export function filterUsBanks(query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return US_BANKS;
  return US_BANKS.filter(
    (bank) =>
      bank.name.toLowerCase().includes(needle) ||
      bank.routing.includes(needle),
  );
}

export function banksInCategory(category: UsBankCategory, banks = US_BANKS) {
  return banks.filter((bank) => bank.category === category);
}
