import { useRef, useState, useEffect } from "react";

// var fsp = fs.promises;

// var subtitle = "V0VCVlRUDQoNCjAwOjAwOjAwLjAwMCAtLT4gMDA6MDA6MDEuMDAwDQpXaGVyZSBkaWQgaGUgZ28/WVlZWQ0KDQowMDowMDowMS4wMDAgLS0+IDAwOjAwOjAzLjUwMA0KSSB0aGluayBoZSB3ZW50IGRvd24gdGhpcyBsYW5lLg0KDQowMDowMDowMy4wMDAgLS0+IDAwOjAwOjA2LjUwMA0KV2hhdCBhcmUgeW91IHdhaXRpbmcgZm9yPw==";
// subtitle = window.atob(subtitle);
// var subBlob = new Blob([subtitle]);
// var subURL = URL.createObjectURL(subBlob);

//   const result = await streamToString(stream)

export default function VideoPlaybackPlayer({
	muted,
	key,
	onEnded,
	source,
	lang,
	source_vtt,
}) {
	const videoRef = useRef(null);

	return (
		<div>
			<video
			crossOrigin="anonymous"
				muted={muted}
				className="player-vid"
				id="vidmain"
				key={key}
				onEnded={onEnded}
				// onTimeUpdate={onTimeUpdate}
				ref={videoRef}
				autoPlay>
				<source src={source} type="video/mp4"></source>
				<track
					label="Captions"
					kind="subtitles"
					srcLang={lang?.split("-")[0] ?? ""}
					src={source_vtt}
					default
				/>
			</video>
		</div>
	);
}
