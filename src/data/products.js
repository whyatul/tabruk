import imgKaju from '../assets/img/kaju.jpg';
import imgGreenKishmish from '../assets/img/green kishmish.jpg';
import imgBlackKishmish from '../assets/img/black kishmish.jpeg';
import imgCaliforniaBadam from '../assets/img/CaliforniaBadan.jpg';
import imgAmericanBadam from '../assets/img/americanBadam.jpg';
import imgKashmiriMamra from '../assets/img/KashmiriMamraBadan.jpg';
import imgKashmiriCurvedMamra from '../assets/img/KashmiricurvedMamraalmond.jpg';
import imgAfghaniCurvedBadam from '../assets/img/AfghadiCurvedBadam.jpg';
import imgWalnutSnowWhite from '../assets/img/kashmiri-walnut-snow-white-halves.webp';
import imgNatrajPista from '../assets/img/NatrajPista.jpg';
import imgDriedApricot from '../assets/img/DriedApricot.jpg';
import imgDriedMango from '../assets/img/DriedMango.jpg';
import imgKashmiriSaffron from '../assets/img/KashmiriSaffron.jpg';
import imgHimalayanShilajit from '../assets/img/HimaliyanShilajit.jpg';
import imgBlueberry from '../assets/img/blueberry.jpg';
import imgDryFruitMixture from '../assets/img/highprotienmix.jpeg';
import imgSafedMusli from '../assets/img/safed musli.jpeg';
import imgMixFruit from '../assets/img/mix fruit.jpeg';
import imgMedjhoolDates from '../assets/img/medjhool dates.jpeg';
import imgKiwi from '../assets/img/kiwi.jpeg';
import imgKalmiDates from '../assets/img/kalmi dates.jpeg';
import imgAshwaganda from '../assets/img/ashwaganda.jpeg';
import imgTurkishApricot from '../assets/img/turkish_apricot.png';
import imgDriedAnjeer from '../assets/img/afgani-anjeer.jpeg';
import imgDriedCherry from '../assets/img/dried_cherry.png';
import imgKashmiriMamraBadamGenerated from '../assets/img/kashmiri_mamra_badam.png';
import imgWalnutGiriSnowWhiteGenerated from '../assets/img/walnut_giri_snow_white.png';
import imgTabrukShilajitBranded from '../assets/img/tabruk_shilajit_branded.png';

export const products = [
    {
        id: "kaju",
        name: "Premium Kaju",
        category: "dry-fruits",
        image: imgKaju,
        description: "Delightfully crunchy and rich premium cashew nuts. A perfect blend of taste and health.",
        features: ["100% Natural", "Rich in healthy fats", "No preservatives", "Premium grading"],
        variations: [
            { weight: "1/2kg", price: 600, originalPrice: 800 },
            { weight: "1kg", price: 1050, originalPrice: 1300 },
            { weight: "5kg", price: 5000, originalPrice: 6000 }
        ]
    },
    {
        id: "green-kishmish",
        name: "Green Kishmish",
        category: "dry-fruits",
        image: imgGreenKishmish,
        description: "Naturally sweet and juicy green raisins, sun-dried to preserve their natural flavor and nutrients.",
        features: ["Sun-dried naturally", "High in antioxidants", "No added sugar", "Soft texture"],
        variations: [
            { weight: "1/2kg", price: 300, originalPrice: 400 },
            { weight: "1kg", price: 500, originalPrice: 700 },
            { weight: "5kg", price: 2250, originalPrice: 3000 }
        ]
    },
    {
        id: "black-kishmish",
        name: "Black Kishmish",
        category: "dry-fruits",
        image: imgBlackKishmish,
        description: "Premium black raisins with a deep, rich flavor. Excellent source of iron and natural energy.",
        features: ["Rich in Iron", "Natural sweetness", "Bone health builder", "Dark and chewy"],
        variations: [
            { weight: "1/2kg", price: 300, originalPrice: 400 },
            { weight: "1kg", price: 500, originalPrice: 700 },
            { weight: "5kg", price: 2250, originalPrice: 3000 }
        ]
    },
    {
        id: "california-badam",
        name: "California Badam",
        category: "dry-fruits",
        image: imgCaliforniaBadam,
        description: "High-quality California almonds known for their consistent size, light color, and sweet flavor.",
        features: ["Imported Quality", "High Protein", "Brain Food", "Versatile usage"],
        variations: [
            { weight: "1/2kg", price: 450, originalPrice: 600 },
            { weight: "1kg", price: 800, originalPrice: 1100 },
            { weight: "5kg", price: 3900, originalPrice: 5000 }
        ]
    },
    {
        id: "american-badam",
        name: "American Badam",
        category: "dry-fruits",
        image: imgAmericanBadam,
        description: "Premium selected American almonds bursting with essential nutrients and a crisp crunch.",
        features: ["Zero Trans Fat", "Vitamin E rich", "Heart healthy", "Crispy texture"],
        variations: [
            { weight: "1/2kg", price: 480, originalPrice: 650 },
            { weight: "1kg", price: 850, originalPrice: 1200 },
            { weight: "5kg", price: 4100, originalPrice: 5500 }
        ]
    },
    {
        id: "kashmiri-mamra-badam",
        name: "Kashmiri Mamra Badam",
        category: "dry-fruits",
        image: imgKashmiriMamraBadamGenerated,
        description: "The absolute pinnacle of almonds. Mamra almonds are prized for their rich essential oils and immense health benefits.",
        features: ["High Essential Oils", "Cholesterol Free", "Boosts Immunity", "Authentic Kashmiri"],
        variations: [
            { weight: "1/2kg", price: 600, originalPrice: 850 },
            { weight: "1kg", price: 1150, originalPrice: 1500 },
            { weight: "5kg", price: 4100, originalPrice: 5500 }
        ]
    },
    {
        id: "kashmiri-curved-mamra-badam",
        name: "Kashmiri Curved Mamra Badam",
        category: "dry-fruits",
        image: imgKashmiriCurvedMamra,
        description: "Specially selected curved Kashmiri Mamra, possessing an even higher concentration of natural almond oil.",
        features: ["Unique Curved Shape", "Highest Oil Content", "Superior Taste", "Premium Grade"],
        variations: [
            { weight: "1/2kg", price: 700, originalPrice: 1000 },
            { weight: "1kg", price: 1300, originalPrice: 1800 },
            { weight: "5kg", price: 6250, originalPrice: 8000 }
        ]
    },
    {
        id: "afghani-curved-badam",
        name: "Afghani Curved Badam",
        category: "dry-fruits",
        image: imgAfghaniCurvedBadam,
        description: "Authentic Afghani curved almonds. Renowned for their incredible sweetness and crunchy texture.",
        features: ["Afghani Origin", "Naturally Sweet", "Crisp Crunch", "Unpolished"],
        variations: [
            { weight: "1/2kg", price: 650, originalPrice: 850 },
            { weight: "1kg", price: 1200, originalPrice: 1600 },
            { weight: "5kg", price: 5500, originalPrice: 7000 }
        ]
    },
    {
        id: "walnut-giri-snow-white",
        name: "Walnut Giri Snow White 2pc",
        category: "dry-fruits",
        image: imgWalnutGiriSnowWhiteGenerated,
        description: "Beautifully intact snow-white walnut halves. These pristine Kashmiri walnuts offer an unmatched buttery flavor.",
        features: ["Snow White Halves", "High Omega-3", "Perfect 2pc Intact", "No Bleaching"],
        variations: [
            { weight: "1/2kg", price: 700, originalPrice: 950 },
            { weight: "1kg", price: 1300, originalPrice: 1800 },
            { weight: "5kg", price: 6250, originalPrice: 8500 }
        ]
    },
    {
        id: "walnut-giri-half-white",
        name: "Walnut Giri Half White",
        category: "dry-fruits",
        image: imgWalnutSnowWhite, // Reused image
        description: "Premium half-white walnut kernels. Excellent source of brain-boosting nutrients and natural oils.",
        features: ["Half White Grade", "Naturally Dried", "Rich in Antioxidants", "Kashmiri Origin"],
        variations: [
            { weight: "1/2kg", price: 600, originalPrice: 800 },
            { weight: "1kg", price: 1100, originalPrice: 1500 },
            { weight: "5kg", price: 5250, originalPrice: 7000 }
        ]
    },
    {
        id: "natraj-pista",
        name: "Natraj Pista",
        category: "dry-fruits",
        image: imgNatrajPista,
        description: "Premium salted and lightly roasted pistachios from Natraj. The perfect guilt-free savory snack.",
        features: ["Perfectly Roasted", "Lightly Salted", "Easy to open shells", "High Dietary Fiber"],
        variations: [
            { weight: "1/2kg", price: 600, originalPrice: 800 },
            { weight: "1kg", price: 1150, originalPrice: 1500 },
            { weight: "5kg", price: 5500, originalPrice: 7000 }
        ]
    },
    {
        id: "dried-apricot",
        name: "Dried Apricot",
        category: "dry-fruits",
        image: imgDriedApricot,
        description: "Sweet, tangy, and naturally dried apricots. A perfect healthy snack loaded with Vitamin A.",
        features: ["Sun-Dried", "No Preservatives", "Rich in Vitamin A", "Sweet & Tangy"],
        variations: [
            { weight: "1/2kg", price: 450, originalPrice: 650 },
            { weight: "1kg", price: 800, originalPrice: 1100 },
            { weight: "5kg", price: 3900, originalPrice: 5000 }
        ]
    },
    {
        id: "dried-mango",
        name: "Dried Mango",
        category: "dry-fruits",
        image: imgDriedMango,
        description: "Succulent slices of naturally dried mango. Enjoy the tropical taste of mangoes all year round.",
        features: ["Tropical Sweetness", "Chewy Texture", "Vitamin C dense", "Natural Sugars"],
        variations: [
            { weight: "1/2kg", price: 350, originalPrice: 500 },
            { weight: "1kg", price: 600, originalPrice: 850 },
            { weight: "5kg", price: 2900, originalPrice: 4000 }
        ]
    },
    {
        id: "kashmiri-saffron",
        name: "Kashmiri Saffron",
        category: "saffron",
        image: imgKashmiriSaffron,
        description: "Experience the pure essence of Kashmir with our premium Mongra saffron. Handpicked for unparalleled color and aroma.",
        features: ["100% Pure Mongra", "Deep Red Threads", "High Crocin Content", "Ethically Sourced"],
        variations: [
            { weight: "1g", price: 300, originalPrice: 400 },
            { weight: "5g", price: 600, originalPrice: 800 },
            { weight: "10g", price: 2600, originalPrice: 3500 }
        ]
    },
    {
        id: "himalayan-shilajit-liquid",
        name: "Himalyan Shilajit Liquid",
        category: "wellness",
        image: imgTabrukShilajitBranded,
        description: "Pure Himalayan Shilajit naturally concentrated in liquid form for ultimate potency. Traditionally used for vitality.",
        features: ["Pure Extract", "High Fulvic Acid", "Lab Tested", "Boosts Energy"],
        variations: [
            { weight: "25g", price: 1250, originalPrice: 1600 },
            { weight: "50g", price: 2300, originalPrice: 3000 },
            { weight: "100g", price: 4300, originalPrice: 5500 }
        ]
    },
    {
        id: "blueberry",
        name: "Dried Blueberry",
        category: "dry-fruits",
        image: imgBlueberry,
        description: "Premium dried blueberries packed with antioxidants and bursting with sweet-tart flavor.",
        features: ["Superfood", "High Antioxidants", "Perfect for Baking", "Natural Snack"],
        variations: [
            { weight: "1/2kg", price: 1100, originalPrice: 1350 },
            { weight: "1kg", price: 2000, originalPrice: 2700 },
            { weight: "5kg", price: 9500, originalPrice: 11000 }
        ]
    },
    {
        id: "dry-fruit-mixture",
        name: "Dry Fruit Mixture",
        category: "mixes",
        image: imgDryFruitMixture,
        description: "A balanced and healthy trail mix featuring premium almonds, cashews, raisins, and walnuts.",
        features: ["Energy Booster", "Perfect Balance", "Roasted Nuts", "Healthy Snacking"],
        variations: [
            { weight: "1/2kg", price: 700, originalPrice: 900 },
            { weight: "1kg", price: 1300, originalPrice: 1700 },
            { weight: "5kg", price: 6250, originalPrice: 8000 }
        ]
    },
    {
        id: "12-varieties-mixture",
        name: "12 Varieties Mixture",
        category: "mixes",
        image: imgMixFruit,
        description: "The ultimate 12-in-1 power mix containing assorted nuts, seeds, and dried berries for complete nutrition.",
        features: ["12 Ingredients", "Nutrient Dense", "Seeds & Nuts Blend", "Immunity Builder"],
        variations: [
            { weight: "1/2kg", price: 400, originalPrice: 550 },
            { weight: "1kg", price: 700, originalPrice: 950 },
            { weight: "5kg", price: 3250, originalPrice: 4200 }
        ]
    },
    {
        id: "cherry",
        name: "Dried Cherry",
        category: "dry-fruits",
        image: imgDriedCherry, 
        description: "Sweet and tart premium dried cherries. A delightful snack loaded with natural flavor.",
        features: ["Naturally Sweet", "Rich in Antioxidants", "Chewy Texture", "Premium Quality"],
        variations: [
            { weight: "1/2kg", price: 600, originalPrice: 800 },
            { weight: "1kg", price: 1100, originalPrice: 1500 },
            { weight: "5kg", price: 5000, originalPrice: 6500 }
        ]
    },
    {
        id: "medjhool-dates",
        name: "Medjhool Dates",
        category: "dry-fruits",
        image: imgMedjhoolDates,
        description: "Large, sweet, and succulent Medjhool dates known as the king of dates.",
        features: ["Jumbo Size", "Natural Caramel Flavor", "High in Fiber", "Energy Booster"],
        variations: [
            { weight: "1/2kg", price: 700, originalPrice: 950 },
            { weight: "1kg", price: 1350, originalPrice: 1800 },
            { weight: "5kg", price: 6200, originalPrice: 8000 }
        ]
    },
    {
        id: "aner",
        name: "Afgani Anjeer",
        category: "dry-fruits",
        image: imgDriedAnjeer,
        description: "Premium Afghani dried figs (Anjeer) packed with natural sweetness and nutritional benefits.",
        features: ["Sun-Dried", "High Fiber", "Promotes Digestion", "Rich in Calcium"],
        variations: [
            { weight: "1/2kg", price: 650, originalPrice: 850 },
            { weight: "1kg", price: 1200, originalPrice: 1600 },
            { weight: "5kg", price: 5500, originalPrice: 7500 }
        ]
    },
    {
        id: "safed-musli",
        name: "Safed Musli",
        category: "wellness",
        image: imgSafedMusli,
        description: "Premium Safed Musli, a rare ayurvedic herb known for vitality and strength.",
        features: ["100% Pure", "Ayurvedic Herb", "Boosts Vitality", "Natural Supplement"],
        variations: [
            { weight: "250g", price: 800, originalPrice: 1100 },
            { weight: "500g", price: 1400, originalPrice: 1900 },
            { weight: "1kg", price: 2500, originalPrice: 3400 }
        ]
    },
    {
        id: "kiwi",
        name: "Dried Kiwi",
        category: "dry-fruits",
        image: imgKiwi,
        description: "Deliciously sweet and tangy dried kiwi slices, perfectly preserved to retain nutrients.",
        features: ["Vitamin C Rich", "Sweet & Tangy", "Chewy Texture", "Healthy Snack"],
        variations: [
            { weight: "1/2kg", price: 400, originalPrice: 550 },
            { weight: "1kg", price: 700, originalPrice: 950 },
            { weight: "5kg", price: 3000, originalPrice: 4200 }
        ]
    },
    {
        id: "kalmi-dates",
        name: "Kalmi Dates",
        category: "dry-fruits",
        image: imgKalmiDates,
        description: "Premium Safawi (Kalmi) dates from Saudi Arabia, famous for their dark color and rich flavor.",
        features: ["Imported Quality", "Dark & Chewy", "Iron Rich", "Natural Sweetener"],
        variations: [
            { weight: "1/2kg", price: 450, originalPrice: 600 },
            { weight: "1kg", price: 800, originalPrice: 1100 },
            { weight: "5kg", price: 3500, originalPrice: 5000 }
        ]
    },
    {
        id: "ashwagandha",
        name: "Ashwagandha",
        category: "wellness",
        image: imgAshwaganda,
        description: "Pure Ashwagandha root known for its stress-relieving adaptogenic properties.",
        features: ["Stress Relief", "Adaptogenic Herb", "Ayurvedic Quality", "Improves Sleep"],
        variations: [
            { weight: "250g", price: 400, originalPrice: 550 },
            { weight: "500g", price: 700, originalPrice: 950 },
            { weight: "1kg", price: 1200, originalPrice: 1600 }
        ]
    },
    {
        id: "turkish",
        name: "Turkish Anjerr",
        category: "dry-fruits",
        image: imgTurkishApricot,
        description: "Premium Turkish dry fruit imports, offering the quintessential taste and texture.",
        features: ["Imported from Turkey", "Premium Grade", "Naturally Sweetened", "Healthy Snack"],
        variations: [
            { weight: "1/2kg", price: 700, originalPrice: 950 },
            { weight: "1kg", price: 1300, originalPrice: 1800 },
            { weight: "5kg", price: 6000, originalPrice: 8000 }
        ]
    }
];
