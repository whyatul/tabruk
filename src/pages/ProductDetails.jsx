import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Check, Truck } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
    const { id } = useParams();
    const product = products.find(p => p.id === id);

    const [selectedVariation, setSelectedVariation] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    useEffect(() => {
        if (product) {
            setSelectedVariation(product.variations[0]);
            setQuantity(1); // reset quantity on product load changes
        }
    }, [product]);

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
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <div className="aspect-square bg-[#1a1a1a] rounded-sm overflow-hidden sticky top-24 border border-white/5 shadow-2xl">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>

                    {/* Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col pt-4 lg:pt-10"
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-gold mb-6 leading-tight">
                            {product.name}
                        </h1>

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
                                        onClick={() => setSelectedVariation(v)}
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

                    </motion.div>
                </div>
            </div>
        </div>
    );
}
