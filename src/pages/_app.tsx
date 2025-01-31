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
