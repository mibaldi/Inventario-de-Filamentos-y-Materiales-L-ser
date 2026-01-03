export interface BambuMaterial {
  name: string;
  model: string;
  barcode: string;
  type: string;
  thicknessMm: number;
  pcsPerPack: number;
  safeFlag: "OK" | "CAUTION" | "NO";
  imageUrl: string;
  aliases: string[];
}

// Catálogo de materiales Bambu Lab para corte láser
// Fuente: https://eu.store.bambulab.com/es/collections/bambu-material
export const BAMBU_MATERIALS: BambuMaterial[] = [
  // Basswood Plywood (Contrachapado de Tilo)
  {
    name: "3mm Basswood Plywood (6PCS)",
    model: "B-YA001",
    barcode: "6977252629702",
    type: "Contrachapado",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YA001.png?v=1731054892&width=800",
    aliases: ["ya001", "b-ya001", "basswood 3mm", "contrachapado tilo 3mm"],
  },
  {
    name: "5mm Basswood Plywood (4PCS)",
    model: "B-YA002",
    barcode: "6977252629719",
    type: "Contrachapado",
    thicknessMm: 5,
    pcsPerPack: 4,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YA002.png?v=1731054906&width=800",
    aliases: ["ya002", "b-ya002", "basswood 5mm", "contrachapado tilo 5mm"],
  },
  // MDF
  {
    name: "3mm MDF Board (6PCS)",
    model: "B-YB001",
    barcode: "6977252629726",
    type: "MDF",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YB001.png?v=1731054923&width=800",
    aliases: ["yb001", "b-yb001", "mdf 3mm"],
  },
  {
    name: "5mm MDF Board (4PCS)",
    model: "B-YB002",
    barcode: "6977252629733",
    type: "MDF",
    thicknessMm: 5,
    pcsPerPack: 4,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YB002.png?v=1731054936&width=800",
    aliases: ["yb002", "b-yb002", "mdf 5mm"],
  },
  // Walnut Plywood (Contrachapado de Nogal)
  {
    name: "3mm Walnut Plywood (6PCS)",
    model: "B-YC001",
    barcode: "6977252629740",
    type: "Contrachapado",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YC001.png?v=1731054950&width=800",
    aliases: ["yc001", "b-yc001", "walnut 3mm", "nogal 3mm", "contrachapado nogal 3mm"],
  },
  {
    name: "5mm Walnut Plywood (4PCS)",
    model: "B-YC002",
    barcode: "6977252629757",
    type: "Contrachapado",
    thicknessMm: 5,
    pcsPerPack: 4,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YC002.png?v=1731054963&width=800",
    aliases: ["yc002", "b-yc002", "walnut 5mm", "nogal 5mm", "contrachapado nogal 5mm"],
  },
  // Cherry Plywood (Contrachapado de Cerezo)
  {
    name: "3mm Cherry Plywood (6PCS)",
    model: "B-YD001",
    barcode: "6977252629764",
    type: "Contrachapado",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YD001.png?v=1731054979&width=800",
    aliases: ["yd001", "b-yd001", "cherry 3mm", "cerezo 3mm", "contrachapado cerezo 3mm"],
  },
  {
    name: "5mm Cherry Plywood (4PCS)",
    model: "B-YD002",
    barcode: "6977252629771",
    type: "Contrachapado",
    thicknessMm: 5,
    pcsPerPack: 4,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YD002.png?v=1731054991&width=800",
    aliases: ["yd002", "b-yd002", "cherry 5mm", "cerezo 5mm", "contrachapado cerezo 5mm"],
  },
  // Acrylic (Acrílico)
  {
    name: "3mm White Acrylic Sheet (6PCS)",
    model: "B-YE001",
    barcode: "6977252629788",
    type: "Acrilico",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YE001.png?v=1731055005&width=800",
    aliases: ["ye001", "b-ye001", "acrilico blanco 3mm", "white acrylic 3mm"],
  },
  {
    name: "3mm Black Acrylic Sheet (6PCS)",
    model: "B-YE002",
    barcode: "6977252629795",
    type: "Acrilico",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YE002.png?v=1731055018&width=800",
    aliases: ["ye002", "b-ye002", "acrilico negro 3mm", "black acrylic 3mm"],
  },
  {
    name: "3mm Transparent Acrylic Sheet (6PCS)",
    model: "B-YE003",
    barcode: "6977252629801",
    type: "Acrilico",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YE003.png?v=1731055031&width=800",
    aliases: ["ye003", "b-ye003", "acrilico transparente 3mm", "transparent acrylic 3mm", "clear acrylic 3mm"],
  },
  // Leather (Cuero)
  {
    name: "1.5mm Natural Leather (6PCS)",
    model: "B-YF001",
    barcode: "6977252629818",
    type: "Cuero",
    thicknessMm: 1.5,
    pcsPerPack: 6,
    safeFlag: "CAUTION",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YF001.png?v=1731055045&width=800",
    aliases: ["yf001", "b-yf001", "cuero natural", "natural leather"],
  },
  {
    name: "1.5mm Brown Leather (6PCS)",
    model: "B-YF002",
    barcode: "6977252629825",
    type: "Cuero",
    thicknessMm: 1.5,
    pcsPerPack: 6,
    safeFlag: "CAUTION",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YF002.png?v=1731055058&width=800",
    aliases: ["yf002", "b-yf002", "cuero marron", "brown leather"],
  },
  // Cork (Corcho)
  {
    name: "3mm Cork Sheet (6PCS)",
    model: "B-YG001",
    barcode: "6977252629832",
    type: "Corcho",
    thicknessMm: 3,
    pcsPerPack: 6,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YG001.png?v=1731055072&width=800",
    aliases: ["yg001", "b-yg001", "corcho 3mm", "cork 3mm"],
  },
  // Cardboard (Cartón)
  {
    name: "2mm Kraft Cardboard (10PCS)",
    model: "B-YH001",
    barcode: "6977252629849",
    type: "Carton",
    thicknessMm: 2,
    pcsPerPack: 10,
    safeFlag: "OK",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YH001.png?v=1731055086&width=800",
    aliases: ["yh001", "b-yh001", "carton kraft 2mm", "kraft cardboard"],
  },
  // Rubber (Goma)
  {
    name: "2.3mm Rubber Sheet (6PCS)",
    model: "B-YI001",
    barcode: "6977252629856",
    type: "Goma EVA",
    thicknessMm: 2.3,
    pcsPerPack: 6,
    safeFlag: "CAUTION",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YI001.png?v=1731055099&width=800",
    aliases: ["yi001", "b-yi001", "goma 2.3mm", "rubber sheet"],
  },
  // Fabric (Tela)
  {
    name: "Cotton Fabric (10PCS)",
    model: "B-YJ001",
    barcode: "6977252629863",
    type: "Tela",
    thicknessMm: 0.5,
    pcsPerPack: 10,
    safeFlag: "CAUTION",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YJ001.png?v=1731055113&width=800",
    aliases: ["yj001", "b-yj001", "tela algodon", "cotton fabric"],
  },
  {
    name: "Felt Fabric (10PCS)",
    model: "B-YJ002",
    barcode: "6977252629870",
    type: "Tela",
    thicknessMm: 1,
    pcsPerPack: 10,
    safeFlag: "CAUTION",
    imageUrl: "https://eu.store.bambulab.com/cdn/shop/files/YJ002.png?v=1731055126&width=800",
    aliases: ["yj002", "b-yj002", "fieltro", "felt fabric"],
  },
];

// Buscar material por código de barras
export function findMaterialByBarcode(barcode: string): BambuMaterial | null {
  return BAMBU_MATERIALS.find((m) => m.barcode === barcode) ?? null;
}

// Buscar material por modelo
export function findMaterialByModel(model: string): BambuMaterial | null {
  const normalized = model.toLowerCase().trim();
  return (
    BAMBU_MATERIALS.find(
      (m) =>
        m.model.toLowerCase() === normalized ||
        m.aliases.some((a) => normalized.includes(a) || a.includes(normalized))
    ) ?? null
  );
}

// Buscar material por nombre
export function findMaterialByName(name: string): BambuMaterial | null {
  const normalized = name.toLowerCase().trim();
  return (
    BAMBU_MATERIALS.find(
      (m) =>
        m.name.toLowerCase().includes(normalized) ||
        normalized.includes(m.name.toLowerCase()) ||
        m.aliases.some((a) => normalized.includes(a))
    ) ?? null
  );
}

// Obtener todos los tipos de material disponibles
export function getMaterialTypes(): string[] {
  return [...new Set(BAMBU_MATERIALS.map((m) => m.type))];
}

// Obtener materiales por tipo
export function getMaterialsByType(type: string): BambuMaterial[] {
  return BAMBU_MATERIALS.filter((m) => m.type.toLowerCase() === type.toLowerCase());
}
