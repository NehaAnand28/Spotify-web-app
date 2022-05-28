/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { currentTrackIdState, isPlayingState } from "../atoms/songAtom";
import useSongInfo from "../hooks/useSongInfo";
import useSpotify from "../hooks/useSpotify";

const Player = () => {
   const spotifyApi = useSpotify();
   const { data: session, status } = useSession();
   const [currentTrackId, setCurrentTrackId] =
     useRecoilState(currentTrackIdState);
   const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
   const [volume, setVolume] = useState(50);
   const songInfo = useSongInfo();

//     const fetchCurrentSong = () => {
//         if(!songInfo){
//             spotifyApi.getMyCurrentPlayingTrack().then((data) => {
//                 console.log("Now Playing: " ,data.body?.item);
//                 setCurrentTrackId(data.body?.item?.id);
//             });
//         }
//     }

//    useEffect(() => {
//     if(spotifyApi.getAccessToken() && !currentTrackId){
//         //fetch the song info
//     }
//    },[currentTrackIdState,spotifyApi,session])
   return (
     <div>
       {/* Left */}
       <div>
         <img
           className="hidden md:inline h-10 w-10"
           src={songInfo?.album.images?.[0].url}
           alt=""
         />
       </div>
     </div>
   );
}

export default Player