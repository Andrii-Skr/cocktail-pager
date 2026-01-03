"use client"

import { Mousewheel } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/mousewheel"

import { CocktailCard } from "./CocktailCard"

/* — тип данных — */
export interface Cocktail {
  id: number
  name: string
  description: string
  imageUrl: string
}

type Props = {
  cocktails: Cocktail[]
  onOrder?: (id: number) => void
  disabled?: boolean
}

export default function CocktailSwiper({
  cocktails,
  onOrder,
  disabled = false,
}: Props) {
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
      {cocktails.map((c, index) => (
        <SwiperSlide
          key={c.id}
          className="h-dvh md:h-auto flex justify-center items-start"
        >
          <CocktailCard
            cocktail={c}
            onOrder={() => onOrder?.(c.id)}
            disabled={disabled}
            priority={index === 0}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
