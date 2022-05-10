import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const Home = () => {
  return (
    <div className="">
      <Head>
        <title>Spotify-web-app</title>
      </Head>

      <h1 className="text-3xl font-bold underline">Hello world!</h1>
    </div>
  );
}

export default Home;