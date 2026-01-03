export interface FilamentColor {
  name: string;
  hex: string;
  nameEs: string;
}

// Colores comunes de filamentos
export const FILAMENT_COLORS: FilamentColor[] = [
  // Basicos
  { name: "White", hex: "#FFFFFF", nameEs: "Blanco" },
  { name: "Black", hex: "#1a1a1a", nameEs: "Negro" },
  { name: "Gray", hex: "#808080", nameEs: "Gris" },
  { name: "Silver", hex: "#C0C0C0", nameEs: "Plata" },

  // Rojos
  { name: "Red", hex: "#DC2626", nameEs: "Rojo" },
  { name: "Dark Red", hex: "#991B1B", nameEs: "Rojo Oscuro" },
  { name: "Maroon", hex: "#7F1D1D", nameEs: "Granate" },

  // Naranjas
  { name: "Orange", hex: "#EA580C", nameEs: "Naranja" },
  { name: "Coral", hex: "#F97316", nameEs: "Coral" },

  // Amarillos
  { name: "Yellow", hex: "#FACC15", nameEs: "Amarillo" },
  { name: "Gold", hex: "#CA8A04", nameEs: "Dorado" },

  // Verdes
  { name: "Green", hex: "#16A34A", nameEs: "Verde" },
  { name: "Dark Green", hex: "#166534", nameEs: "Verde Oscuro" },
  { name: "Lime", hex: "#84CC16", nameEs: "Lima" },
  { name: "Olive", hex: "#65A30D", nameEs: "Oliva" },

  // Azules
  { name: "Blue", hex: "#2563EB", nameEs: "Azul" },
  { name: "Dark Blue", hex: "#1E40AF", nameEs: "Azul Oscuro" },
  { name: "Sky Blue", hex: "#0EA5E9", nameEs: "Azul Cielo" },
  { name: "Navy", hex: "#1E3A8A", nameEs: "Azul Marino" },
  { name: "Cyan", hex: "#06B6D4", nameEs: "Cian" },
  { name: "Teal", hex: "#0D9488", nameEs: "Verde Azulado" },

  // Morados
  { name: "Purple", hex: "#9333EA", nameEs: "Morado" },
  { name: "Violet", hex: "#7C3AED", nameEs: "Violeta" },
  { name: "Magenta", hex: "#DB2777", nameEs: "Magenta" },

  // Rosas
  { name: "Pink", hex: "#EC4899", nameEs: "Rosa" },
  { name: "Hot Pink", hex: "#F472B6", nameEs: "Rosa Intenso" },

  // Marrones
  { name: "Brown", hex: "#92400E", nameEs: "Marron" },
  { name: "Tan", hex: "#D2B48C", nameEs: "Canela" },
  { name: "Beige", hex: "#F5DEB3", nameEs: "Beige" },
  { name: "Wood", hex: "#8B4513", nameEs: "Madera" },

  // Especiales
  { name: "Transparent", hex: "#E5E7EB", nameEs: "Transparente" },
  { name: "Natural", hex: "#FAF9F6", nameEs: "Natural" },
  { name: "Glow in Dark", hex: "#BFFF00", nameEs: "Fosforescente" },
];

// Buscar color por nombre (en ingles o espanol)
export function findColorByName(name: string): FilamentColor | null {
  const normalized = name.toLowerCase().trim();
  return (
    FILAMENT_COLORS.find(
      (c) =>
        c.name.toLowerCase() === normalized ||
        c.nameEs.toLowerCase() === normalized ||
        c.name.toLowerCase().includes(normalized) ||
        c.nameEs.toLowerCase().includes(normalized)
    ) ?? null
  );
}

// Obtener color hex por nombre
export function getColorHex(name: string): string | null {
  const color = findColorByName(name);
  return color?.hex ?? null;
}
