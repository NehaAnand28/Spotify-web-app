import React from "react";
import {
  HomeIcon,
  SearchIcon,
  LibraryIcon,
  PlusCircleIcon,
  RssIcon,
  HeartIcon,
  RepeatIcon,
} from "@heroicons/react/outline";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { playlistIdState } from "../atoms/playlistAtom";
import useSpotify from "../hooks/useSpotify";
import { useRecoilState } from "recoil";
import axios from "axios";

const Sidebar = () => {
  const spotifyApi = useSpotify();
  const { data: session, status } = useSession();
  const [playlists, setPlaylists] = useState([]);
  const [playlistId, setPlaylistId] = useRecoilState(playlistIdState);

  useEffect(() => {
    if (spotifyApi.getAccessToken()) {
      spotifyApi.getUserPlaylists().then((data) => {
        setPlaylists(data.body.items);
      });
    }
  }, [session, spotifyApi]);

  const [getMessage, setGetMessage] = useState({});
  useEffect(() => {
    axios
      .get("http://localhost:5000/flask/models")
      .then((response) => {
        console.log("SUCCESS", response);
        setGetMessage(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // useEffect(() => {
  //   axios
  //     .get("http://localhost:5000/create")
  //     .then((response) => {
  //       console.log("SUCCESS", response);
  //       setGetMessage(response);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });

  //     console.log("send playlist uri as " , playlistId);
  // },);

  const createPlaylist = () => {
      axios
      .get("http://localhost:5000/create")
      .then((response) => {
        console.log("SUCCESS", response);
        setGetMessage(response);
      })
      .catch((error) => {
        console.log(error);
      });

      console.log("send playlist uri as " , playlistId);

  }
 
  const generateRecommendations = () => {
    axios
      .get("http://localhost:5000/generate")
      .then((response) => {
        console.log("SUCCESS", response);
        setGetMessage(response);
      })
      .catch((error) => {
        console.log(error);
      });

      console.log("Songs added to Recommended for you");
  }

  // console.log(playlists);
  console.log("You picked playlist >>>", playlistId);

  return (
    <div
      className="text-gray-500 p-5 text-sm lg:text-sm border-r
    border-gray-900 overflow-y-scroll scrollbar-hide h-screen sm:max-w-[12rem] lg:max-w-[15rem] hidden md:inline-flex"
    >
      <div className="space-y-4">
        <button className="flex items-center space-x-2 hover:text-white">
          <HomeIcon className="h-5 w-5" />
          <p>Home</p>
        </button>
        <button className="flex items-center space-x-2 hover:text-white">
          <SearchIcon className="h-5 w-5" />
          <p>Search</p>
        </button>
        <button className="flex items-center space-x-2 hover:text-white">
          <LibraryIcon className="h-5 w-5" />
          <p>Your Library</p>
        </button>
        <hr className="border-t-[0.1px] border-gray-900" />
        <button className="flex items-center space-x-2 hover:text-white"
        onClick={() =>{createPlaylist()}}>
          <PlusCircleIcon className="h-5 w-5" />
          <p>Create Playlist</p>
        </button>
        <button className="flex items-center space-x-2 hover:text-white">
          <HeartIcon className="h-5 w-5" />
          <p>Your Library</p>
        </button>
        {/* checking backend connection */}
        <button className="flex items-center space-x-2 hover:text-white" 
        onClick={() => {generateRecommendations()}}>
          <RssIcon className="h-5 w-5" />
          {getMessage.status === 200 ? (
            <p>{getMessage.data.message}</p>
          ) : (
            <p>LOADING</p>
          )}
          {/* {getMessage.status === 200
            ? console.log(getMessage.data.message)
            : console.log("Loading")} */}
        </button>
        <hr className="border-t-[0.1px] border-gray-900" />

        {/* {Playlists...} */}
        {playlists.map((playlist) => (
          <p
            key={playlist.id}
            onClick={() => setPlaylistId(playlist.id)}
            className="cursor-pointer hover:text-white"
          >
            {playlist.name}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
