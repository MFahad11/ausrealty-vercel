import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
         <title>{`Ausrealty`}</title>
         <meta name="twitter:image" content={'https://beleef-public-uploads.s3.ap-southeast-2.amazonaws.com/pictures/preview.jpg'} />
         <meta name="twitter:card" content={'https://beleef-public-uploads.s3.ap-southeast-2.amazonaws.com/pictures/preview.jpg'} />
         <meta name="twitter:title" content={`Ausrealty`} />
         <meta name="twitter:description" content='Find your dream home with Ausrealty' />
         <meta name="description" content='Find your dream home with Ausrealty' />
         <meta property="og:image" content={'https://beleef-public-uploads.s3.ap-southeast-2.amazonaws.com/pictures/preview.jpg'} />
         <meta property="og:site_name" content="Ausrealty"></meta>
         <meta property="og:title" content={`Ausrealty`} />
         <meta property="og:description" content='Find your dream home with Ausrealty' />
         <meta property="og:url" content={'https://devausrealty.vercel.app/'} />
         <link rel="canonical" href={'https://devausrealty.vercel.app/'} />
         <meta property="description" content="Find your dream home with Ausrealty" />
         <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
         <meta property="og:type" content="website" />
         <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
