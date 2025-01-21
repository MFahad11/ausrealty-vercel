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
import Head from "next/head";
export default function App({ Component, pageProps }: AppProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_KEY || '', // Ensure this is correctly set
    libraries:["places"], // Corrected libraries
    version: "weekly",
  });
  if (loadError) return <div></div>;
  if (!isLoaded) return <ProgressLoader/>;
  return <>
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
  <DefaultSeo {...SEO} />
  <ToastContainer/>

  <Component {...pageProps} /></>
}
