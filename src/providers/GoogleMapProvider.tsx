import ProgressLoader from '@/components/ui/ProgressLoader';
import { useJsApiLoader } from '@react-google-maps/api';
import { PropsWithChildren } from 'react';


export function GoogleMapsProvider({ children }: PropsWithChildren) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_KEY || '',
    libraries: ["places"],
    version: "weekly",
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <ProgressLoader />;

  return <>{children}</>;
}