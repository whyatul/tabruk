import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Check, Truck, Share2, Copy } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../hooks/useCatalog';
import tabrukPackagingImage from '../assets/img/tabruk_packaging.png';
import tabrukPacketImage from '../assets/img/tabrukpacket.png';

export default function ProductDetails() {
    const { id } = useParams();
    const { catalog } = useCatalog();
    const product = catalog.find(p => p.id === id);

    const [selectedWeight, setSelectedWeight] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeSlide, setActiveSlide] = useState(0);
    const [copied, setCopied] = useState(false);
    const { addToCart } = useCart();

    const selectedVariation = product
        ? product.variations.find(v => v.weight === selectedWeight) || product.variations[0]
        : null;

    if (!product || !selectedVariation) {
        return (
            <div className="bg-[#111111] pt-32 pb-24 text-center min-h-screen flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-display mb-4 text-gold">Product Not Found</h2>
                <Link to="/" className="text-white border-b border-gold hover:text-gold transition-colors pb-1">Return to Shop</Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        addToCart(product, selectedVariation, quantity);
    };

    const productImages = [product.image, tabrukPackagingImage, tabrukPacketImage].filter(Boolean);

    const goPrevSlide = () => {
        const next = (activeSlide - 1 + productImages.length) % productImages.length;
        setActiveSlide(next);
    };

    const goNextSlide = () => {
        const next = (activeSlide + 1) % productImages.length;
        setActiveSlide(next);
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: `Check out ${product.name} on Tabruk!`,
                    url: url,
                });
            } catch (error) {
                console.log('Sharing failed', error);
            }
        } else {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="bg-[#111111] pt-24 pb-24 min-h-screen text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <nav className="text-xs font-inter text-white/40 mb-8 uppercase tracking-wider">
                    <Link to="/" className="hover:text-gold transition-colors">Home</Link>
                    <span className="mx-2 text-gold/30">/</span>
                    <span className="text-gold">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Images */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-[#1a1a1a] rounded-sm overflow-hidden sticky top-24 border border-white/5 shadow-2xl">
                            <div
                                className="flex w-full h-full transition-transform duration-500 ease-out"
                                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                            >
                                {productImages.map((imageSrc, imageIndex) => (
                                    <img
                                        key={`${product.id}-detail-slide-${imageIndex}`}
                                        src={imageSrc}
                                        alt={`${product.name} view ${imageIndex + 1}`}
                                        className="w-full h-full object-cover flex-shrink-0"
                                    />
                                ))}
                            </div>

                            {productImages.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={goPrevSlide}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                                        aria-label={`Previous image for ${product.name}`}
                                    >
                                        &#8249;
                                    </button>
                                    <button
                                        type="button"
                                        onClick={goNextSlide}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                                        aria-label={`Next image for ${product.name}`}
                                    >
                                        &#8250;
                                    </button>
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                                        {productImages.map((_, dotIndex) => (
                                            <button
                                                key={`${product.id}-detail-dot-${dotIndex}`}
                                                type="button"
                                                onClick={() => setActiveSlide(dotIndex)}
                                                className={`h-1.5 rounded-full transition-all ${activeSlide === dotIndex ? 'w-6 bg-gold' : 'w-2 bg-white/70 hover:bg-white'}`}
                                                aria-label={`Go to image ${dotIndex + 1} for ${product.name}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col pt-4 lg:pt-10">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-gold leading-tight">
                                {product.name}
                            </h1>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors text-white/80"
                                title="Share product"
                            >
                                {copied ? <Copy className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                                <span className="text-xs font-inter uppercase tracking-wider">{copied ? 'Copied' : 'Share'}</span>
                            </button>
                        </div>

                        <div className="flex items-end gap-3 mb-8 pb-6 border-b border-white/10">
                            <span className="text-3xl font-inter text-white">Rs. {selectedVariation.price}</span>
                            <span className="text-lg font-inter text-white/40 line-through mb-0.5">Rs. {selectedVariation.originalPrice}</span>
                            <span className="text-xs font-inter font-bold text-[#111111] bg-gold px-2 py-1 ml-2 rounded-sm outline mb-1 uppercase tracking-wider">
                                Save Rs. {selectedVariation.originalPrice - selectedVariation.price}
                            </span>
                        </div>

                        <div className="prose prose-invert prose-sm text-white/70 mb-8">
                            <p className="leading-relaxed text-base">{product.description}</p>
                        </div>

                        <ul className="space-y-4 mb-10">
                            {product.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm font-inter text-white/90">
                                    <span className="bg-gold/10 p-1 rounded-full border border-gold/30">
                                        <Check className="w-4 h-4 text-gold" />
                                    </span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* Custom Variation Selector */}
                        <div className="mb-8 p-6 bg-[#1a1a1a] border border-white/10 rounded-sm">
                            <span className="text-sm font-inter text-white/60 uppercase tracking-widest block mb-4">Select Size / Weight</span>
                            <div className="flex flex-wrap gap-3">
                                {product.variations.map((v, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedWeight(v.weight)}
                                        className={`px-5 py-3 border rounded-sm text-sm font-inter font-bold transition-all duration-300 outline-none
                      ${selectedVariation.weight === v.weight
                                                ? 'border-gold text-gold bg-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                                : 'border-white/20 text-white/70 hover:border-white/50 hover:bg-white/5'
                                            }`}
                                    >
                                        {v.weight}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-inter text-white/60 uppercase tracking-widest">Quantity</span>
                                <div className="flex items-center border border-white/20 rounded-sm bg-[#1a1a1a]">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-4 py-3 text-white hover:text-gold transition-colors outline-none"
                                    >-</button>
                                    <span className="px-4 py-3 font-inter text-sm font-bold border-x border-white/20 min-w-[3.5rem] text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="px-4 py-3 text-white hover:text-gold transition-colors outline-none"
                                    >+</button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-transparent border border-gold text-gold py-4 text-sm font-inter uppercase tracking-widest hover:bg-gold/10 transition-colors duration-300 font-semibold outline-none"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-gold text-[#111111] py-4 text-sm font-inter uppercase tracking-widest hover:bg-gold-light transition-colors duration-300 font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)] outline-none"
                                >
                                    Buy it Now
                                </button>
                            </div>
                        </div>

                        <div className="mt-12 flex items-center gap-4 text-sm font-inter text-white/70 p-5 bg-[#1a1a1a] rounded-sm border border-gold/20">
                            <div className="bg-gold/10 p-2 rounded-full hidden sm:block">
                                <Truck className="w-5 h-5 text-gold" />
                            </div>
                            <p>Free standard shipping on orders over <span className="text-gold font-bold text-base">Rs. 999</span> within India.</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
