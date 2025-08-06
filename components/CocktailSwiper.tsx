"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/mousewheel";

import { CocktailCard } from "./CocktailCard";

/* — тип данных — */
export interface Cocktail {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

interface Props {
  cocktails: Cocktail[];
  onOrder?: (id: number) => void;
}

export default function CocktailSwiper({ cocktails, onOrder }: Props) {
  return (
    <Swiper
      modules={[Mousewheel]}
      direction="vertical"
      slidesPerView={1}
      loop
      className="h-dvh md:w-[500px]"
      mousewheel={{
        forceToAxis: true,
        thresholdDelta: 40,
        thresholdTime: 200,
      }}
    >
      {cocktails.map((c) => (
        <SwiperSlide
          key={c.id}
          className="h-dvh md:h-auto flex justify-center items-start"
        >
          <CocktailCard cocktail={c} onOrder={() => onOrder?.(c.id)} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
