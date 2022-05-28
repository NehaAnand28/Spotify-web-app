import { ChevronDownIcon } from '@heroicons/react/outline';
import { signOut, useSession } from "next-auth/react";  
import { useEffect, useState } from "react";
import { shuffle } from "lodash";
import React from 'react'

const colors = [
  "from-indigo-500",
  "from-blue-500",
  "from-green-500",
  "from-red-500",
  "from-yellow-500",
  "from-pink-500",
  "from-purple-500",
];

 


const Center = () => {
    const { data: session } = useSession();
    const [color, setColor] = useState(null);



     useEffect(() => {
       setColor(shuffle(colors).pop());
     }, []);



  return (
    <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide">
      <header className="absolute top-5 right-8">
        <div
          className="flex items-center bg-red-300 space-x-3 opacity-90 hover:opacity-80
                cursor-pointer rounded-full p-1 pr-2 text-white"
          onClick={signOut}
        >
          <img
            className="rounded-full w-10 h-10"
            src={session?.user?.image}
            alt=""
          />
          <h2>{session?.user.name}</h2>
          <ChevronDownIcon className="h-5 w-5" />
        </div>
      </header>

      <section
        className={`flex items-end space-x-7 bg-gradient-to-b
                                 to-black ${color} h-80 text-white p-8`}
      >
        <img
          className="h-44 w-44 shadow-2xl"
          //   src={playlist?.images?.[0]?.url}
          alt=""
        />
        <div>
          <p>Playlist</p>
          {/* <h1 className="text-2xl md:text-3xl xl:text-5xl"></h1> */}
        </div>
      </section>
    </div>
  );
}

export default Center