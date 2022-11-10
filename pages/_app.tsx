import type { AppProps } from 'next/app'
import "../styles/globals.css";
import "@fontsource/work-sans/700.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
