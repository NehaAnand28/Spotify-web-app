import Head from 'next/head'
import Image from 'next/image'
import Sidebar from '../components/Sidebar';
import Center from "../components/Center";
import styles from '../styles/Home.module.css'

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

      <div>{/* Player */}</div>
    </div>
  );
}

export default Home;