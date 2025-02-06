import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
           <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
           <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
           <link rel="icon" type="image/png" sizes="180x180" href="/favicon-180x180.png" />
           <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png" />
           <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
           key={'viewport'}
           />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
