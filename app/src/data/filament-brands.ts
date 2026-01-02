export interface FilamentBrand {
  name: string;
  tareG: number;
  netWeightG: number;
  aliases: string[];
}

export const FILAMENT_BRANDS: FilamentBrand[] = [
  { name: "Sunlu", tareG: 200, netWeightG: 1000, aliases: ["sunlu", "sun lu"] },
  { name: "eSUN", tareG: 230, netWeightG: 1000, aliases: ["esun", "e-sun"] },
  { name: "Bambu Lab", tareG: 250, netWeightG: 1000, aliases: ["bambu", "bambulab", "bambu lab"] },
  { name: "Polymaker", tareG: 240, netWeightG: 1000, aliases: ["polymaker", "poly maker"] },
  { name: "Prusament", tareG: 200, netWeightG: 1000, aliases: ["prusament", "prusa"] },
  { name: "Hatchbox", tareG: 220, netWeightG: 1000, aliases: ["hatchbox", "hatch box"] },
  { name: "Overture", tareG: 210, netWeightG: 1000, aliases: ["overture"] },
  { name: "Eryone", tareG: 195, netWeightG: 1000, aliases: ["eryone"] },
  { name: "JAYO", tareG: 200, netWeightG: 1000, aliases: ["jayo"] },
  { name: "Creality", tareG: 230, netWeightG: 1000, aliases: ["creality", "ender"] },
  { name: "Elegoo", tareG: 215, netWeightG: 1000, aliases: ["elegoo"] },
  { name: "Anycubic", tareG: 220, netWeightG: 1000, aliases: ["anycubic", "any cubic"] },
  { name: "Flashforge", tareG: 225, netWeightG: 1000, aliases: ["flashforge", "flash forge"] },
  { name: "3D Solutech", tareG: 210, netWeightG: 1000, aliases: ["3dsolutech", "solutech"] },
  { name: "Amazon Basics", tareG: 215, netWeightG: 1000, aliases: ["amazon", "amazonbasics"] },
  { name: "Inland", tareG: 205, netWeightG: 1000, aliases: ["inland"] },
  { name: "Geeetech", tareG: 200, netWeightG: 1000, aliases: ["geeetech", "geetech"] },
  { name: "TIANSE", tareG: 210, netWeightG: 1000, aliases: ["tianse"] },
  { name: "TTYT3D", tareG: 200, netWeightG: 1000, aliases: ["ttyt3d", "ttyt"] },
  { name: "Giantarm", tareG: 205, netWeightG: 1000, aliases: ["giantarm", "giant arm"] },
  { name: "ColorFabb", tareG: 180, netWeightG: 750, aliases: ["colorfabb", "color fabb"] },
  { name: "Fillamentum", tareG: 185, netWeightG: 750, aliases: ["fillamentum"] },
  { name: "FormFutura", tareG: 190, netWeightG: 750, aliases: ["formfutura", "form futura"] },
  { name: "3DXTech", tareG: 200, netWeightG: 1000, aliases: ["3dxtech"] },
  { name: "MatterHackers", tareG: 210, netWeightG: 1000, aliases: ["matterhackers", "matter hackers"] },
];

export const DEFAULT_TARE_G = 220;

export function findBrandByName(name: string): FilamentBrand | null {
  const normalized = name.toLowerCase().trim();

  for (const brand of FILAMENT_BRANDS) {
    if (brand.name.toLowerCase() === normalized) {
      return brand;
    }
    if (brand.aliases.some(alias => normalized.includes(alias))) {
      return brand;
    }
  }

  return null;
}

export function getTareForBrand(brandName: string | null): { tareG: number; source: "brand" | "default" } {
  if (!brandName) {
    return { tareG: DEFAULT_TARE_G, source: "default" };
  }

  const brand = findBrandByName(brandName);
  if (brand) {
    return { tareG: brand.tareG, source: "brand" };
  }

  return { tareG: DEFAULT_TARE_G, source: "default" };
}

export function getBrandNames(): string[] {
  return FILAMENT_BRANDS.map(b => b.name);
}
