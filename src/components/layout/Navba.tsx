import React from 'react';
import Link from 'next/link'
import { BiChevronLeft } from 'react-icons/bi';
import Image from 'next/image';

// Define prop types for the navigation component
interface NavBarProps {
  backgroundColor?: string;
  showBackButton?: boolean;
  backButtonLink?: string;
  logoSrc?: string;
  logoAlt?: string;
}

const NavBar: React.FC<NavBarProps> = ({
  backgroundColor = 'white', 
  showBackButton = false,
  backButtonLink = '/',
  logoSrc = '/logo.png', 
  logoAlt = 'Logo'
}) => {
  return (
    <nav 
      className={`flex items-center justify-center relative w-full p-4`} 
      style={{ backgroundColor }}
    >
      {/* Back Button - conditionally rendered */}
      {showBackButton && (
        <Link 
          href={backButtonLink} 
          className="absolute left-4 md:left-48 top-1/2 -translate-y-1/2"
        >
          <BiChevronLeft className="h-6 w-6" />
        </Link>
      )}
      
      {/* Centered Logo */}
      <Link href={'/'} className="flex items-center justify-center">
        <Image 
          src={logoSrc} 
          alt={logoAlt} 
          className=" object-contain"
            width={197}
            height={18}
        />

      </Link>
    </nav>
  );
};

export default NavBar;