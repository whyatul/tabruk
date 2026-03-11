import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-[#0a0a0a] text-white pt-20 pb-10 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 xl:px-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

                    <div className="md:col-span-5 hidden md:block">
                        <h3 className="font-display text-2xl tracking-widest uppercase mb-6 text-gold">Tabruk</h3>
                        <p className="font-sans text-white/70 text-sm max-w-sm leading-relaxed">
                            Premium Mongra saffron, Kashmiri walnuts, and handpicked almonds curated from the Himalayan valley. Blending heritage sourcing with uncompromising quality.
                        </p>
                    </div>

                    <div className="md:col-span-3">
                        <h4 className="font-inter font-medium tracking-wide mb-6 uppercase text-sm text-gold">Quick Links</h4>
                        <ul className="space-y-4">
                            <li><Link to="/" className="text-white/70 hover:text-gold transition-colors text-sm">All Products</Link></li>
                            <li><Link to="/about" className="text-white/70 hover:text-gold transition-colors text-sm">About Us</Link></li>
                            <li><a href="#" className="text-white/70 hover:text-gold transition-colors text-sm">FAQ's</a></li>
                            <li><a href="#" className="text-white/70 hover:text-gold transition-colors text-sm">Contact Us</a></li>
                        </ul>
                    </div>

                    <div className="md:col-span-4">
                        <h4 className="font-inter font-medium tracking-wide mb-6 uppercase text-sm text-gold">Subscribe to our emails</h4>
                        <p className="text-white/70 text-sm mb-4">Be the first to know about new collections and special offers.</p>
                        <form className="flex group border border-white/20 rounded-md focus-within:border-gold transition-colors">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="bg-transparent px-4 py-3 w-full focus:outline-none text-sm text-white rounded-l-md"
                            />
                            <button
                                type="submit"
                                className="bg-gold text-[#111111] px-6 font-inter font-bold text-sm hover:bg-gold-light transition-colors uppercase tracking-wider rounded-r-md"
                            >
                                Join
                            </button>
                        </form>
                    </div>

                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-white/50 text-xs">
                        © {new Date().getFullYear()} Tabruk. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-white/50 hover:text-gold text-xs transition-colors">Privacy Policy</a>
                        <a href="#" className="text-white/50 hover:text-gold text-xs transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
