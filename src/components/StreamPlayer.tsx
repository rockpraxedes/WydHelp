type Props = {
    channel: string;
};

export function StreamPlayer( { channel }: Props ) {
    return (
        <div className="w-full aspect-video rounded-lg overflow-hidden border">
            <iframe
                src={`https://player.twitch.tv/?channel=${channel}&parent=rockpraxedes.github.io&muted=true`}
                width="100%"
                height="100%"
                allowFullScreen
            />
        </div>
    );
}