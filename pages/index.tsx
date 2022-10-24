import type { NextPage } from "next";
import Head from "next/head";

import { useEpisode } from "../hooks/useEpisode";

const Home: NextPage = () => {
  // #1st -> Select type (ex: Episode)
  // get all fields from episode from graphql
  // get all inputs for create mutation ?

  // 2nd
  // upload the csv ?

  // 3rd
  // upload from flatfile to skylark using mutation and matched fields

  const fields = useEpisode();

  return (
    <div>
      <Head>
        <title>FlatFile</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div>James Wallis rocks</div>
      </main>

      <div></div>

      <footer></footer>
    </div>
  );
};

export default Home;
