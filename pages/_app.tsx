import '@/styles/base.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes'


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;
