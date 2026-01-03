"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { FILAMENT_COLORS, findColorByName, type FilamentColor } from "@/data/filament-colors";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (colorName: string, colorHex: string | null) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);
  const [selectedColor, setSelectedColor] = useState<FilamentColor | null>(null);

  useEffect(() => {
    // Buscar si el valor actual coincide con un color predefinido
    if (value) {
      const found = findColorByName(value);
      setSelectedColor(found);
      setCustomColor(value);
    }
  }, [value]);

  const handleSelectColor = (color: FilamentColor) => {
    setSelectedColor(color);
    setCustomColor(color.nameEs);
    onChange(color.nameEs, color.hex);
    setOpen(false);
  };

  const handleCustomColorChange = (newValue: string) => {
    setCustomColor(newValue);
    const found = findColorByName(newValue);
    setSelectedColor(found);
    onChange(newValue, found?.hex ?? null);
  };

  // Agrupar colores por categoria
  const colorGroups = [
    { label: "Basicos", colors: FILAMENT_COLORS.slice(0, 4) },
    { label: "Rojos", colors: FILAMENT_COLORS.slice(4, 7) },
    { label: "Naranjas", colors: FILAMENT_COLORS.slice(7, 9) },
    { label: "Amarillos", colors: FILAMENT_COLORS.slice(9, 11) },
    { label: "Verdes", colors: FILAMENT_COLORS.slice(11, 15) },
    { label: "Azules", colors: FILAMENT_COLORS.slice(15, 21) },
    { label: "Morados", colors: FILAMENT_COLORS.slice(21, 24) },
    { label: "Rosas", colors: FILAMENT_COLORS.slice(24, 26) },
    { label: "Marrones", colors: FILAMENT_COLORS.slice(26, 30) },
    { label: "Especiales", colors: FILAMENT_COLORS.slice(30) },
  ];

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-12 h-9 p-0 border-2"
            style={{
              backgroundColor: selectedColor?.hex ?? "#E5E7EB",
              borderColor: selectedColor?.hex === "#FFFFFF" ? "#D1D5DB" : "transparent",
            }}
          >
            <span className="sr-only">Seleccionar color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <div className="space-y-3">
            <p className="text-sm font-medium">Seleccionar color</p>

            {colorGroups.map((group) => (
              <div key={group.label}>
                <p className="text-xs text-muted-foreground mb-1.5">{group.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => handleSelectColor(color)}
                      className={cn(
                        "w-7 h-7 rounded-md border-2 transition-all hover:scale-110 relative",
                        selectedColor?.name === color.name
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:ring-1 hover:ring-gray-300"
                      )}
                      style={{
                        backgroundColor: color.hex,
                        borderColor: color.hex === "#FFFFFF" ? "#D1D5DB" : "transparent",
                      }}
                      title={color.nameEs}
                    >
                      {selectedColor?.name === color.name && (
                        <CheckIcon
                          className={cn(
                            "w-4 h-4 absolute inset-0 m-auto",
                            color.hex === "#FFFFFF" || color.hex === "#FACC15" || color.hex === "#E5E7EB"
                              ? "text-gray-800"
                              : "text-white"
                          )}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Input
        placeholder="Gris, Rojo, Azul..."
        value={customColor}
        onChange={(e) => handleCustomColorChange(e.target.value)}
        className="flex-1"
      />
    </div>
  );
}
