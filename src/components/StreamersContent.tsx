import { StreamPlayer } from "./StreamPlayer";

const STREAMERS = [
    {
        name: "fafaolive",
        title: "FAFÃO",
    },
    {
        name: "brunoluizagames",
        title: "BRUNO E LUIZA GAMES",
    },
    {
        name: "taqueparill",
        title: "TAQUEPARIL",
    },
    {
        name: "wydraiz",
        title: "WYD RAIZ",
    },
    {
        name: "hespert",
        title: "HESPERT",
    },
];

export function StreamersContent() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STREAMERS.map( ( s ) => (
                <div key={s.name} className="space-y-2">
                    <div className="text-xs">
                        <p className="text-white font-medium">🔴 {s.name}</p>
                        <p className="text-muted-foreground">
                            {s.title}
                        </p>
                    </div>

                    <StreamPlayer channel={s.name} />
                </div>
            ) )}
        </div>
    );
}