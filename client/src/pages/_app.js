import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export default function App({ Component, pageProps }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <Head>
        <title>Agentflow_AI | Agentic AI Operations Automation Platform</title>
        <meta
          name="description"
          content="Enterprise AI Operations Automation Platform turning natural language into visual multi-agent workflows with real-time execution streaming."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
