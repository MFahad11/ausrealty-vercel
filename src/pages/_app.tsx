import "@/styles/globals.css";
import '@/components/ui/carousel/css/carousel.css';
import '@/components/ui/carousel/css/agent-carousel.css';
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";

export default function App({ Component, pageProps }: AppProps) {
  return <>
  
  <ToastContainer/>

  <Component {...pageProps} /></>
}
