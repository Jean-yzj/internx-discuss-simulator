import "@/styles/globals.css";
import "remixicon/fonts/remixicon.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
    return (
        <>
            <Head>
                <title>實習通｜話題討論 Simulator</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                <meta name="description" content="InternX 「話題」功能模擬器 — 給技術人員預覽用的獨立 demo。" />
                <meta name="theme-color" content="#0182fd" />
                <link rel="icon" href="/internx-logo-square.svg" />
            </Head>
            <Component {...pageProps} />
        </>
    );
}
