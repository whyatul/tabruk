import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../hooks/useCatalog';
import tabrukPackagingImage from '../assets/img/tabruk_packaging.png';
import tabrukPacketImage from '../assets/img/tabrukpacket.png';

export default function Products() {
    const [sortBy, setSortBy] = useState('Featured');
    const [activeSlides, setActiveSlides] = useState({});
    const { addToCart } = useCart();
    const { catalog: products } = useCatalog();

    const sortedProducts = useMemo(() => {
        let sorted = [...products];
        if (sortBy === 'Price: Low to High') {
            sorted.sort((a, b) => a.variations[0].price - b.variations[0].price);
        } else if (sortBy === 'Price: High to Low') {
            sorted.sort((a, b) => b.variations[0].price - a.variations[0].price);
        }
        return sorted;
    }, [products, sortBy]);

    const getProductImages = (product) => [
        product.image,
        tabrukPackagingImage,
        tabrukPacketImage,
    ].filter(Boolean);

    const handleSlideChange = (productId, nextIndex) => {
        setActiveSlides((prev) => ({
            ...prev,
            [productId]: nextIndex,
        }));
    };

    return (
        <div className="bg-[#111111] pt-32 pb-24 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <header className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-display text-gold mb-4 drop-shadow-md"
                    >
                        Tabruk Exclusives
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/70 font-sans max-w-2xl mx-auto"
                    >
                        Explore our full range of premium, pure and handpicked produce from the valley of Kashmir.
                    </motion.p>
                </header>

                <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                    <p className="text-sm font-inter text-gold/80">{products.length} products</p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-inter text-white/60">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-transparent text-sm font-inter text-gold border-none focus:ring-0 cursor-pointer outline-none"
                        >
                            <option className="bg-[#1a1a1a]">Featured</option>
                            <option className="bg-[#1a1a1a]">Price: Low to High</option>
                            <option className="bg-[#1a1a1a]">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                    {sortedProducts.map((product, index) => {
                        const baseVariation = product.variations[0];
                        const productImages = getProductImages(product);
                        const activeSlide = activeSlides[product.id] ?? 0;
                        const hasMultipleSlides = productImages.length > 1;

                        const goPrevSlide = () => {
                            const next = (activeSlide - 1 + productImages.length) % productImages.length;
                            handleSlideChange(product.id, next);
                        };

                        const goNextSlide = () => {
                            const next = (activeSlide + 1) % productImages.length;
                            handleSlideChange(product.id, next);
                        };

                        return (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className="group cursor-pointer flex flex-col h-full"
                            >
                                <div className="block flex-grow relative">
                                    <div className="aspect-square overflow-hidden mb-5 relative bg-[#1a1a1a] rounded-sm border border-white/5">
                                        <Link to={`/products/${product.id}`}>
                                            <div
                                                className="flex w-full h-full transition-transform duration-500 ease-out"
                                                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                                            >
                                                {productImages.map((imageSrc, imageIndex) => (
                                                    <img
                                                        key={`${product.id}-slide-${imageIndex}`}
                                                        src={imageSrc}
                                                        alt={`${product.name} view ${imageIndex + 1}`}
                                                        className="object-cover w-full h-full flex-shrink-0 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700 ease-out"
                                                    />
                                                ))}
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300 z-10 pointer-events-none"></div>
                                        </Link>

                                        {hasMultipleSlides && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={goPrevSlide}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                                                    aria-label={`Previous image for ${product.name}`}
                                                >
                                                    &#8249;
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={goNextSlide}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                                                    aria-label={`Next image for ${product.name}`}
                                                >
                                                    &#8250;
                                                </button>
                                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                                                    {productImages.map((_, dotIndex) => (
                                                        <button
                                                            key={`${product.id}-dot-${dotIndex}`}
                                                            type="button"
                                                            onClick={() => handleSlideChange(product.id, dotIndex)}
                                                            className={`h-1.5 rounded-full transition-all ${activeSlide === dotIndex ? 'w-5 bg-gold' : 'w-2 bg-white/60 hover:bg-white/90'}`}
                                                            aria-label={`Go to image ${dotIndex + 1} for ${product.name}`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="absolute inset-x-0 bottom-[5.5rem] p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-20 pointer-events-none flex justify-center">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                addToCart(product, baseVariation, 1);
                                            }}
                                            className="w-full pointer-events-auto bg-gold text-[#111111] font-inter font-bold text-xs tracking-widest uppercase py-3 hover:bg-gold-light transition-colors shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                                        >
                                            Quick Add
                                        </button>
                                    </div>
                                    <Link to={`/products/${product.id}`} className="block">
                                        <h3 className="text-base font-display text-gold mb-1 line-clamp-2">{product.name}</h3>
                                        <div className="flex items-center gap-2 text-sm font-inter mt-2">
                                            <span className="text-white/40 line-through text-xs">Rs. {baseVariation.originalPrice}</span>
                                            <span className="text-white font-medium">From Rs. {baseVariation.price}</span>
                                        </div>
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
