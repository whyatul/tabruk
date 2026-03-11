import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import SearchModal from './SearchModal';

export default function Header() {
    const { cartCount, setIsCartOpen } = useCart();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <header className="fixed w-full top-0 z-50 bg-[#111111]/90 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">

                        {/* Mobile menu button (Left) */}
                        <div className="flex items-center flex-1 sm:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="text-white hover:text-gold focus:outline-none"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Navigation Desktop (Left) */}
                        <nav className="hidden sm:flex sm:gap-8 flex-1">
                            <Link to="/" className="text-sm font-inter font-medium text-white/80 hover:text-gold transition-colors">All Products</Link>
                            <Link to="/about" className="text-sm font-inter font-medium text-white/80 hover:text-gold transition-colors">About Us</Link>
                        </nav>

                        {/* Logo (Center) */}
                        <div className="flex-shrink-0 flex items-center justify-center">
                            <Link to="/" className="font-display text-2xl tracking-widest uppercase text-gold text-center">
                                Tabruk
                            </Link>
                        </div>

                        {/* Actions (Right) */}
                        <div className="flex items-center justify-end gap-5 flex-1">
                            <button onClick={() => setIsSearchOpen(true)} className="text-white hover:text-gold transition-colors">
                                <Search className="h-5 w-5" />
                            </button>
                            <button onClick={() => setIsCartOpen(true)} className="text-white hover:text-gold transition-colors relative outline-none">
                                <ShoppingBag className="h-5 w-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gold text-[#111111] font-bold text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Search Overlay */}
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm sm:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed inset-y-0 left-0 w-64 bg-[#111111] z-[70] flex flex-col shadow-2xl border-r border-white/10 sm:hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <h2 className="text-xl font-display text-gold">Menu</h2>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors outline-none"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex flex-col p-6 space-y-6">
                                <Link
                                    to="/"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-inter font-medium text-white/80 hover:text-gold transition-colors block"
                                >
                                    All Products
                                </Link>
                                <Link
                                    to="/about"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-inter font-medium text-white/80 hover:text-gold transition-colors block"
                                >
                                    About Us
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
