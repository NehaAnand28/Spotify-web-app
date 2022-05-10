import Head from 'next/head'
import Image from 'next/image'
import Sidebar from '../components/Sidebar';
import styles from '../styles/Home.module.css'

const Home = () => {
  return (
    <div className="">
      <Head>
        <title>Spotify-web-app</title>
      </Head>

      <h1 className="text-3xl font-bold underline">Hello world!</h1>

      <main>
       <Sidebar />
        {/* Center */}
      </main>

      <div>{/* Player */}</div>
    </div>
  );
}

export default Home;