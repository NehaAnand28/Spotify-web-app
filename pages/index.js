import Head from 'next/head'
import Image from 'next/image'
import Sidebar from '../components/Sidebar';
import styles from '../styles/Home.module.css'

const Home = () => {
  return (
    <div className="bg-black h-screen overflow-hidden">
      <Head>
        <title>Spotify-web-app</title>
      </Head>

      <main>
       <Sidebar />
        {/* Center */}
      </main>

      <div>{/* Player */}</div>
    </div>
  );
}

export default Home;