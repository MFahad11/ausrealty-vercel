import React from 'react';
import Link from 'next/link'
import { BiChevronLeft } from 'react-icons/bi';
import Image from 'next/image';
import StickyContact from './StickyContact';
import { useRouter } from 'next/router';

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
  backButtonLink,
  logoSrc = '/logo.png', 
  logoAlt = 'Logo'
}) => {
  const router=useRouter();
  return (
    <nav 
      className={`top-0 fixed z-[10000] flex items-center justify-center  w-full p-4`} 
      style={{ backgroundColor }}
    >
      {/* Back Button - conditionally rendered */}
      {showBackButton && (
        <button 
          onClick={() => {
            if(backButtonLink){
              router.push(backButtonLink)
            }
            else{
              router.back()
            }

          }}
          
          className="absolute left-4 md:left-48 top-1/2 -translate-y-1/2"
        >
          <BiChevronLeft className={`h-6 w-6
            ${backgroundColor === 'white' ? 'text-black' : 'text-white'}
            `}/>
        </button>
      )}
      
      {/* Centered Logo */}
      <Link href={'/'} className="flex items-center justify-center">
        <img 
          src={
            backgroundColor === 'white' ? '/logo.png' : '/logo-white.png'
          } 
          alt={logoAlt} 
          className=" object-contain"
            width={210}
            height={40}
        />

      </Link>
    </nav>
    
  );
};

export default NavBar;
