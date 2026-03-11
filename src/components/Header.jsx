import { Link } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import SearchModal from './SearchModal';

export default function Header() {
    const { cartCount, setIsCartOpen } = useCart();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <>
            <header className="fixed w-full top-0 z-50 bg-[#111111]/90 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">

                        {/* Mobile menu button */}
                        <div className="flex items-center sm:hidden">
                            <button className="text-white hover:text-gold focus:outline-none">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="hidden sm:flex sm:gap-8">
                            <Link to="/" className="text-sm font-inter font-medium text-white/80 hover:text-gold transition-colors">All Products</Link>
                            <Link to="/about" className="text-sm font-inter font-medium text-white/80 hover:text-gold transition-colors">About Us</Link>
                        </nav>

                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center justify-center">
                            <Link to="/" className="font-display text-2xl tracking-widest uppercase text-gold text-center">
                                Tabruk
                            </Link>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-5">
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
        </>
    );
}
