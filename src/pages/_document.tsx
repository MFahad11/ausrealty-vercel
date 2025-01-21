import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
      <title>{`Ausrealty`}</title>
        <meta name="description" content={`Details for property`} />
        <link rel="canonical" href={'https://devausrealty.vercel.app/'} />
        <meta property="og:title" content={`Property`} />
        <meta property="og:description" content={`Details for property`} />
        <meta property="og:image" content={'https://beleef-public-uploads.s3.ap-southeast-2.amazonaws.com/pictures/preview.jpg'} />
        <meta property="og:url" content={'https://devausrealty.vercel.app/'} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Property`} />
        <meta name="twitter:description" content={`Details for property`} />
        <meta name="twitter:image" content={'https://beleef-public-uploads.s3.ap-southeast-2.amazonaws.com/pictures/preview.jpg'} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
