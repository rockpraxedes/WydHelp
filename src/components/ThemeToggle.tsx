import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1 text-xs rounded-md border hover:bg-muted transition"
        >
            {theme === "dark" ? (
                <>
                    <Sun className="w-4 h-4" />
                    Claro
                </>
            ) : (
                <>
                    <Moon className="w-4 h-4" />
                    Escuro
                </>
            )}
        </button>
    );
}