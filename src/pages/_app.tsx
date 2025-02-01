import "@/styles/globals.css";
import '@/components/ui/carousel/css/property-carousel.css';
import '@/components/ui/carousel/css/agent-carousel.css';
import '@/components/ui/carousel/css/index.css';
import '@/components/chat/BookApraisal/BookApraisal.css';
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { useJsApiLoader } from "@react-google-maps/api";
import ProgressLoader from "@/components/ui/ProgressLoader";

import Script from "next/script";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
export default function App({ Component, pageProps }: AppProps) {
  console.log("App -> pageProps", pageProps)
  const GA_TRACKING_ID = "G-HJ4Y2HZ69J";
  // const { isLoaded, loadError } = useJsApiLoader({
  //   googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_KEY || '', // Ensure this is correctly set
  //   libraries:["places"], // Corrected libraries
  //   version: "weekly",
  // });
  // const router = useRouter();

  // useEffect(() => {
  //   const handleRouteChange = (url:string) => {
  //     // @ts-ignore
  //     window.gtag("config", GA_TRACKING_ID, {
  //       page_path: url,
  //     });
  //   };

  //   router.events.on("routeChangeComplete", handleRouteChange);
  //   return () => {
  //     router.events.off("routeChangeComplete", handleRouteChange);
  //   };
  // }, [router.events]);
  // if (loadError) return <div></div>;
  // if (!isLoaded) return <ProgressLoader/>;
  return <>
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
  <ToastContainer/>
  <Head>
        <title key={'title'}>{pageProps?.initialPropertyData?.addressParts?.displayAddress || "Property"} | Ausrealty</title>
        <meta name="description" content={pageProps?.initialPropertyData?.details || "Find your dream home with Ausrealty"} 
        key={'description'}
        />
        <meta property="og:title" content={pageProps?.initialPropertyData?.addressParts?.displayAddress || "Property | Ausrealty"} 
        key={'ogTitle'}
        />
        <meta
          property="og:description"
          content={pageProps?.initialPropertyData?.details || "Find your dream home with Ausrealty"}
          key={'ogDescription'}
        />
        <meta
          property="og:image"
          content={
            pageProps?.initialPropertyData?.media[0]?.url ||
            "https://beleef-public-uploads.s3.ap-southeast-2.amazonaws.com/pictures/preview.jpg"

          }
          key={'ogImage'}
        />
        <meta property="og:url" content={pageProps?.canonicalUrl} 
        key={'ogUrl'}
        />
        <meta property="og:type" content="website" 
        key={'ogType'}
        />
        <meta name="twitter:card" content="summary_large_image" 
        key={'twitterCard'}
        />
        <meta name="twitter:title" content={pageProps?.initialPropertyData?.addressParts?.displayAddress || "Property | Ausrealty"}
        key={'twitterTitle'}
        />
        <meta
          name="twitter:description"
          content={pageProps?.initialPropertyData?.details || "Find your dream home with Ausrealty"}
          key={'twitterDescription'}
        />
        <meta
          name="twitter:image"
          content={
            pageProps?.initialPropertyData?.media[0]?.url ||
            "https://beleef-public-uploads.s3.ap-southeast-2.amazonaws.com/pictures/preview.jpg"
          }
          key={'twitterImage'}
        />
      </Head>
  <Component {...pageProps} /></>
}
