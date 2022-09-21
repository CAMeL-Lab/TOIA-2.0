import { useRef } from "react";

export default function VideoPlaybackPlayer(props) {
    const videoRef = useRef(null);

    const onTimeUpdate = () => {
        if (!props.filler && props.duration_seconds && props.duration_seconds > 3){
            if ((props.duration_seconds - videoRef.current.currentTime) <= 1){
                props.onEnded();
            }
        }
    }

    return (
        <div>
            <video
                muted={props.muted}
                className="player-vid"
                id="vidmain"
                key={props.key}
                onEnded={props.onEnded}
                onTimeUpdate={onTimeUpdate}
                ref={videoRef}
                autoPlay
            >
                <source src={props.source} type="video/mp4"></source>
            </video>
        </div>
    );
}
