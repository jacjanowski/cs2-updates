
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ContentCarouselProps {
  images: string[];
  carouselId: string;
}

const ContentCarousel = ({ images, carouselId }: ContentCarouselProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || images.length === 0) {
    return null;
  }

  return (
    <div className="w-full my-4">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={10}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        loop={images.length > 1}
        className="carousel-swiper"
      >
        {images.map((image, index) => (
          <SwiperSlide key={`${carouselId}-${index}`}>
            <AspectRatio ratio={16 / 9} className="bg-muted/20">
              <img
                src={image}
                alt={`Carousel image ${index + 1}`}
                className="w-full object-contain h-full max-h-[400px] rounded-md"
              />
            </AspectRatio>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ContentCarousel;
