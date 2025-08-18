import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

export function useProduct () {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

    const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const addToCart = (product) => {
      console.log("🛒 Added to cart:", product);
      setSelectedProduct(null);
    };

    return {
        emblaRef,
        emblaApi,
        prevBtnEnabled,
        nextBtnEnabled,
        scrollNext,
        scrollPrev,
        selectedProduct,
        addToCart,
        setSelectedProduct
    };
}