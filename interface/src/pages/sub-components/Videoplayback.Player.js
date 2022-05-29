export default function VideoPlaybackPlayer(props) {
    return (
        <div>
            <video
                muted={props.muted}
                className="player-vid"
                id="vidmain"
                key={props.key}
                onEnded={props.onEnded}
                autoPlay
            >
                <source src={props.source} type="video/mp4"></source>
            </video>
        </div>
    );
}
