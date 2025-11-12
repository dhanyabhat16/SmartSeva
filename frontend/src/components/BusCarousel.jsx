import React, { useState, useEffect, useRef } from "react";

const BusCarousel = () => {
  const slides = [
    "./carousel1.jpg",
    "./carousel2.jpg",
    "./carousel3.jpg",
    "./carousel4.jpg",
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const autoSlideRef = useRef();

  // Go to next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Go to previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);

    autoSlideRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(autoSlideRef.current);
  }, [currentSlide, slides.length]); // reset timer whenever slide changes manually

  return (
    <div className="w-full relative">
      <div className="carousel w-full h-96 mb-2 overflow-hidden rounded-lg relative">
        {slides.map((src, idx) => (
          <div
            key={idx}
            className={`carousel-item absolute w-full transition-all duration-700 ${
              idx === currentSlide ? "opacity-100 z-20" : "opacity-0 z-10"
            }`}
          >
            <img
              src={src}
              className="w-full h-96 object-cover rounded-lg"
              alt={`Bus ${idx + 1}`}
            />
          </div>
        ))}

        {/* Navigation Buttons */}
        <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 justify-between px-2">
          <button
            onClick={prevSlide}
            className="btn btn-circle btn-primary"
          >
            ❮
          </button>
          <button
            onClick={nextSlide}
            className="btn btn-circle btn-primary"
          >
            ❯
          </button>
        </div>
      </div>

      
    </div>
  );
};

export default BusCarousel;
