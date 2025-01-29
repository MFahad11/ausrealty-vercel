import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
           {/* <title>{`Ausrealty`}</title> */}
           <meta key={'twitterImage'} name="twitter:image" content={'https://beleef-public-uploads.s3.ap-southeast-2.amazonaws.com/pictures/preview.jpg'} />
           <meta name="twitter:card" content={'Find your dream home with Ausrealty'} 
            key={'twitterCard'}
           />
           <meta name="twitter:title" content={`Ausrealty`}
           key={'twitterTitle'}
           />
           <meta name="twitter:description" content='Find your dream home with Ausrealty' 
           key={'twitterDescription'}
           />
           <meta name="description" content='Find your dream home with Ausrealty' key={'description'} />
           
           <meta property="og:image" content={'https://beleef-public-uploads.s3.ap-southeast-2.amazonaws.com/pictures/preview.jpg'} 
           key={'ogImage'}
           />
           <meta property="og:site_name" content="Ausrealty"
           key={'ogSiteName'}

           ></meta>
           <meta property="og:title" content={`Ausrealty`}
           key={'ogTitle'}
           />
           <meta property="og:description" content='Find your dream home with Ausrealty' 
           key={'ogDescription'}
           />
           <meta property="og:url" content={'https://devausrealty.vercel.app/'} 
           key={'ogUrl'}
           />
           <link rel="canonical" href={'https://devausrealty.vercel.app/'} 
           key={'canonical'}
           />
           <meta property="description" content="Find your dream home with Ausrealty" 
           key={'description'}
           />
           {/* <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
           key={'viewport'}
           /> */}
           <meta property="og:type" content="website" 
           key={'ogType'}
           />
           {/* <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
           key={'viewport'}
           /> */}
        </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
