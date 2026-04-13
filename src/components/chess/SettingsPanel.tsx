import { useGameStore } from "@/store/gameStore";
import { boardThemes } from "@/lib/themes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Sun, Moon } from "lucide-react";

export function SettingsPanel() {
  const { settings, setSettings, showSettingsPanel, setShowSettingsPanel } =
    useGameStore();

  const toggleDarkMode = (checked: boolean) => {
    setSettings({ darkMode: checked });
  };

  return (
    <Sheet open={showSettingsPanel} onOpenChange={setShowSettingsPanel}>
      <SheetContent className="overflow-y-auto wood-texture border-l border-primary/20">
        <SheetHeader className="border-b border-primary/10 pb-4">
          <SheetTitle className="font-[Cinzel] text-xl tracking-wide">
            Settings
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-8 py-6">
          <div className="space-y-4">
            <Label className="text-sm font-[Cinzel] font-semibold tracking-wide text-primary">
              Board Wood Type
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {boardThemes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => setSettings({ boardTheme: theme })}
                  className="relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 wood-panel group"
                  style={{
                    borderColor:
                      settings.boardTheme.name === theme.name
                        ? "hsl(var(--primary))"
                        : "transparent",
                  }}
                >
                  <div className="grid grid-cols-2 w-full aspect-square">
                    <div style={{ backgroundColor: theme.lightSquare }} />
                    <div style={{ backgroundColor: theme.darkSquare }} />
                    <div style={{ backgroundColor: theme.darkSquare }} />
                    <div style={{ backgroundColor: theme.lightSquare }} />
                  </div>
                  {settings.boardTheme.name === theme.name && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px]">
                      <Check className="w-5 h-5 text-primary drop-shadow-md" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 text-[10px] text-center py-1 bg-card/95 border-t border-border font-[Cinzel] font-medium">
                    {theme.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-[Cinzel] font-semibold tracking-wide text-primary">
              Board Settings
            </Label>

            <div className="space-y-4 bg-card/50 p-4 rounded-lg border border-primary/10">
              <div className="flex items-center justify-between">
                <Label htmlFor="coords" className="text-sm font-medium">
                  Show coordinates
                </Label>
                <Switch
                  id="coords"
                  checked={settings.showCoordinates}
                  onCheckedChange={(v) => setSettings({ showCoordinates: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="legal" className="text-sm font-medium">
                  Show legal moves
                </Label>
                <Switch
                  id="legal"
                  checked={settings.showLegalMoves}
                  onCheckedChange={(v) => setSettings({ showLegalMoves: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="last" className="text-sm font-medium">
                  Show last move
                </Label>
                <Switch
                  id="last"
                  checked={settings.showLastMove}
                  onCheckedChange={(v) => setSettings({ showLastMove: v })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-[Cinzel] font-semibold tracking-wide text-primary">
              Appearance
            </Label>
            <div className="flex items-center justify-between bg-card/50 p-4 rounded-lg border border-primary/10">
              <Label className="text-sm flex items-center gap-3 font-medium">
                <div
                  className={`p-2 rounded-full ${settings.darkMode ? "bg-primary/20" : "bg-accent/20"}`}
                >
                  {settings.darkMode ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span>{settings.darkMode ? "Dark Walnut" : "Light Oak"}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Wood finish theme
                  </span>
                </div>
              </Label>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
