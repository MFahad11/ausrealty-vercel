import "@/styles/globals.css";
import '@/components/ui/carousel/css/property-carousel.css';
import '@/components/ui/carousel/css/agent-carousel.css';
import '@/components/ui/carousel/css/index.css';
import '@/components/chat/BookApraisal/BookApraisal.css';
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { useJsApiLoader } from "@react-google-maps/api";
import ProgressLoader from "@/components/ui/ProgressLoader";

export default function App({ Component, pageProps }: AppProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_KEY || '', // Ensure this is correctly set
    libraries:["places"], // Corrected libraries
    version: "weekly",
  });
  if (loadError) return <div></div>;
  if (!isLoaded) return <ProgressLoader/>;
  return <>
  
  <ToastContainer/>

  <Component {...pageProps} /></>
}
