import "@/styles/globals.css";
import '@/components/ui/carousel/css/property-carousel.css';
import '@/components/ui/carousel/css/agent-carousel.css';
import '@/components/ui/carousel/css/index.css';
import '@/components/chat/BookApraisal/BookApraisal.css';
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { useJsApiLoader } from "@react-google-maps/api";
import ProgressLoader from "@/components/ui/ProgressLoader";
import { DefaultSeo } from 'next-seo';
import SEO from '../../next-seo.config';
import Script from "next/script";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
export default function App({ Component, pageProps }: AppProps) {
  const GA_TRACKING_ID = "G-HJ4Y2HZ69J";
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_KEY || '', // Ensure this is correctly set
    libraries:["places"], // Corrected libraries
    version: "weekly",
  });
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url:string) => {
      // @ts-ignore
      window.gtag("config", GA_TRACKING_ID, {
        page_path: url,
      });
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);
  if (loadError) return <div></div>;
  if (!isLoaded) return <ProgressLoader/>;
  return <>
    <Head>
           <title>{`Ausrealty`}</title>
           <meta name="twitter:image" content={'https://beleef-public-uploads.s3.ap-southeast-2.amazonaws.com/pictures/preview.jpg'} />
           <meta name="twitter:card" content={'Find your dream home with Ausrealty'} />
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
  <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
  <DefaultSeo {...SEO} />
  <ToastContainer/>

  <Component {...pageProps} /></>
}
