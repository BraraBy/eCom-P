import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

import '../index.css';

import { Autoplay, Pagination, } from 'swiper/modules';

export default function Banner() {
  return (
    <>
    <div className="absolute top-0 left-0 w-full h-full">
      <Swiper
        spaceBetween={30}
        centeredSlides={false}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        modules={[Autoplay, Pagination]}
        className="mySwiper"
      >
        <SwiperSlide>
          <img className="h-auto object-cover" src="/test.jfif" alt="" />
        </SwiperSlide>
        <SwiperSlide></SwiperSlide>
        <SwiperSlide></SwiperSlide>
      </Swiper>
    </div>
    </>
  );
}
