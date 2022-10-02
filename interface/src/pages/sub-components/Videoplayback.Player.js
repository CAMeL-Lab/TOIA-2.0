import { useRef, useState, useEffect } from "react";

export default function VideoPlaybackPlayer(props) {
    const videoRef = useRef(null);

    // let skippedLastSecond = false;
    
    // useEffect(() => {
    //   skippedLastSecond = false;
    // }, [props])
    

    // const onTimeUpdate = () => {
    //     if (!props.filler && props.duration_seconds && props.duration_seconds > 3){
    //         if ((props.duration_seconds - videoRef.current.currentTime) <= 1){
    //             if (!skippedLastSecond){
    //                 skippedLastSecond = true;
    //                 props.onEnded();
    //                 console.log("Ending:", props.duration_seconds)
    //             }
    //         }
    //     }
    // }

    return (
        <div>
            <video
                muted={props.muted}
                className="player-vid"
                id="vidmain"
                key={props.key}
                onEnded={props.onEnded}
                // onTimeUpdate={onTimeUpdate}
                ref={videoRef}
                autoPlay
            >
                <source src={props.source} type="video/mp4"></source>
            </video>
        </div>
    );
}
