import Head from 'next/head'
import Image from 'next/image'
import Sidebar from '../components/Sidebar';
import Center from "../components/Center";
// import Player from "../components/Player";
import styles from '../styles/Home.module.css';
import { getSession } from "next-auth/react";

const Home = () => {
  return (
    <div className="bg-black h-screen overflow-hidden">
      <Head>
        <title>Spotify-web-app</title>
      </Head>

      <main className="flex">
       <Sidebar />
       <Center />
        {/* Center */}
      </main>

      {/* <div>
        <Player/>
      </div> */}
    </div>
  );
}
export default Home;

export async function getServerSideProps(context) {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
}