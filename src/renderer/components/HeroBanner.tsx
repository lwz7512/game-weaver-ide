import { useState, useEffect } from 'react';

type HeroProps = {
  placeHolder: string;
  title: string;
  heroURL: string;
  delay?: number;
};

export const HeroBanner = ({
  placeHolder,
  title,
  heroURL,
  delay,
}: HeroProps) => {
  const [imagePath, setImagePath] = useState(placeHolder);

  useEffect(() => {
    setTimeout(() => {
      const loader = new Image();
      loader.onload = () => setImagePath(heroURL);
      loader.src = heroURL; // load now
    }, delay);
  }, [delay, heroURL]);

  return (
    <div className="hero-banner relative bg-slate-300 h-64 xl:h-80">
      <img
        src={imagePath}
        alt="banner"
        className="absolute top-0 left-0 w-full object-cover z-0 h-full"
      />
      <h1 className="text-2xl top-10 left-10 text-center p-8 absolute z-10 text-white">
        {title}
      </h1>
    </div>
  );
};

HeroBanner.defaultProps = {
  delay: 0,
};
