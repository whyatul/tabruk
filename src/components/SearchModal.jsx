import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';

export default function SearchModal({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const inputRef = useRef(null);
    const { catalog: products } = useCatalog();

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setQuery('');
            setResults([]);
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    useEffect(() => {
        if (query.trim().length > 1) {
            const lowerQuery = query.toLowerCase();
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.category.toLowerCase().includes(lowerQuery) ||
                p.description.toLowerCase().includes(lowerQuery)
            );
            setResults(filtered);
        } else {
            setResults([]);
        }
    }, [query]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex flex-col justify-start">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-full bg-[#111111] border-b border-white/10"
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center">

                            <button
                                onClick={onClose}
                                className="absolute top-6 right-4 sm:right-6 lg:right-8 text-white/50 hover:text-white transition-colors outline-none"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="w-full max-w-3xl flex items-center border-b-2 border-gold/50 focus-within:border-gold transition-colors pb-2 mt-4">
                                <SearchIcon className="w-6 h-6 text-gold mr-4" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search for saffron, walnuts, almonds..."
                                    className="bg-transparent border-none outline-none w-full text-xl md:text-2xl font-display text-white placeholder:text-white/30"
                                />
                            </div>

                            <div className="w-full max-w-3xl mt-8 pb-8 max-h-[60vh] overflow-y-auto">
                                {query.length > 1 && results.length === 0 && (
                                    <p className="text-white/50 font-inter text-center py-8">No products found matching "{query}"</p>
                                )}

                                {results.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {results.map(product => {
                                            const baseVariation = product.variations[0];
                                            return (
                                                <Link
                                                    key={product.id}
                                                    to={`/products/${product.id}`}
                                                    onClick={onClose}
                                                    className="flex items-center gap-4 group p-3 hover:bg-white/5 rounded-sm transition-colors border border-transparent hover:border-white/10"
                                                >
                                                    <div className="w-20 h-20 bg-[#1a1a1a] rounded-sm overflow-hidden flex-shrink-0 border border-white/5">
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-display text-gold group-hover:text-gold-light transition-colors line-clamp-1">{product.name}</h4>
                                                        <p className="text-xs font-inter text-white/40 mt-1 line-clamp-2">{product.description}</p>
                                                        <p className="text-sm font-inter text-white mt-2">Rs. {baseVariation.price}</p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
