import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div className="bg-[#111111] pt-32 pb-24 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <header className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-display text-gold mb-6 drop-shadow-md pb-4"
                    >
                        About Us
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm font-inter text-white/50 uppercase tracking-[0.3em]"
                    >
                        A Legacy of Purity, Health & Kashmiri Heritage
                    </motion.p>
                </header>

                <div className="mx-auto font-sans leading-loose text-white/80">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16 space-y-6 text-lg"
                    >
                        <p className="text-xl md:text-3xl font-display text-gold mb-10 leading-relaxed text-center">
                            Tabruk was born in the heart of Kashmir — a land where purity isn’t a promise, it’s a way of life.
                        </p>
                        <p className="text-white/70">
                            Our journey began with a simple intention: to bring the untouched, nutrient-rich taste of the valley to people who value health, authenticity, and refined living.
                        </p>
                        <p className="text-white/70">
                            Our products are sourced directly from small, generational family farms across the Himalayan belt. Every walnut, every almond, every dry fruit is handpicked, sun-dried naturally, and checked for purity — exactly the way Kashmiri households have done for centuries.
                        </p>
                    </motion.div>

                    {/* Feature List block */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#0a0a0a] p-8 md:p-12 mb-16 border-l-2 border-gold rounded-r-md shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
                            </svg>
                        </div>

                        <h2 className="text-3xl font-display text-gold mb-8">Why Tabruk?</h2>
                        <ul className="space-y-6 font-inter text-white/80">
                            <li className="flex items-center gap-4">
                                <span className="text-gold font-bold text-xl drop-shadow-[0_0_8px_rgba(212,175,55,1)]">•</span>
                                <span>Premium, naturally grown Kashmiri produce</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="text-gold font-bold text-xl drop-shadow-[0_0_8px_rgba(212,175,55,1)]">•</span>
                                <span>Zero additives, zero chemicals, zero compromise</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="text-gold font-bold text-xl drop-shadow-[0_0_8px_rgba(212,175,55,1)]">•</span>
                                <span>Health-driven products backed by heritage farming methods</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="text-gold font-bold text-xl drop-shadow-[0_0_8px_rgba(212,175,55,1)]">•</span>
                                <span>Small-batch sourcing for maximum flavour & nutrients</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <span className="text-gold font-bold text-xl drop-shadow-[0_0_8px_rgba(212,175,55,1)]">•</span>
                                <span>Ethical and sustainable partnerships with local families</span>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-12 rounded-sm border border-gold/10"
                    >
                        <p className="mb-8 text-white/80 text-lg max-w-2xl mx-auto">
                            At Tabruk, we blend Kashmir’s timeless tradition with modern luxury and scientific processing. This is not just dry fruit — this is nourishment crafted with care, purity and dignity.
                        </p>
                        <h3 className="text-3xl md:text-4xl font-display text-gold italic mb-12">
                            Taste the valley. Live the legacy.
                        </h3>

                        <Link to="/" className="inline-block bg-gold text-[#111111] font-bold px-12 py-4 text-sm font-inter uppercase tracking-widest hover:bg-gold-light transition-colors duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                            Shop Collections
                        </Link>
                    </motion.div>

                </div>

            </div>
        </div>
    );
}
