"""
PRISM E-Commerce Catalogs, Geographical Weightings & Brazilian Market Distributions
"""

from typing import List, Dict, Tuple, Any

# ==================== GEOGRAPHY & DEMOGRAPHICS ====================
REGIONS_WEIGHTED = [
    ("Southeast", 0.55),
    ("South", 0.20),
    ("Northeast", 0.14),
    ("Central-West", 0.07),
    ("North", 0.04),
]

STATES_BY_REGION: Dict[str, List[Tuple[str, str, float]]] = {
    "Southeast": [
        ("SP", "São Paulo", 0.60),
        ("RJ", "Rio de Janeiro", 0.22),
        ("MG", "Belo Horizonte", 0.14),
        ("ES", "Vitória", 0.04),
    ],
    "South": [
        ("RS", "Porto Alegre", 0.40),
        ("PR", "Curitiba", 0.38),
        ("SC", "Florianópolis", 0.22),
    ],
    "Northeast": [
        ("BA", "Salvador", 0.35),
        ("PE", "Recife", 0.28),
        ("CE", "Fortaleza", 0.22),
        ("RN", "Natal", 0.15),
    ],
    "Central-West": [
        ("DF", "Brasília", 0.45),
        ("GO", "Goiânia", 0.35),
        ("MT", "Cuiabá", 0.20),
    ],
    "North": [
        ("AM", "Manaus", 0.55),
        ("PA", "Belém", 0.45),
    ],
}

# ==================== CUSTOMER SEGMENTS ====================
CUSTOMER_SEGMENTS_WEIGHTED = [
    ("Regular", 0.60),
    ("VIP / High-LTV", 0.15),
    ("Bargain Hunter", 0.15),
    ("At-Risk", 0.10),
]

FIRST_NAMES = [
    "Lucas", "Mariana", "Gabriel", "Beatriz", "Thiago", "Camila", "Rafael", "Juliana",
    "Felipe", "Larissa", "Bruno", "Fernanda", "Rodrigo", "Amanda", "Gustavo", "Carolina",
    "Matheus", "Letícia", "Leonardo", "Aline", "Vinícius", "Natália", "Diego", "Bruna",
    "Guilherme", "Patrícia", "Eduardo", "Vanessa", "Caio", "Renata", "Marcelo", "Débora",
    "André", "Tatiana", "Danilo", "Sabrina", "Alexandre", "Priscila", "Fábio", "Paula",
]

LAST_NAMES = [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira",
    "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes",
    "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha", "Dias", "Nascimento", "Andrade",
    "Moreira", "Nunes", "Marques", "Machado", "Mendes", "Freitas", "Cardoso", "Ramos",
]

EMAIL_DOMAINS = ["gmail.com", "outlook.com", "uol.com.br", "terra.com.br", "yahoo.com.br", "icloud.com"]

# ==================== CATEGORIES & PRODUCT SPECS ====================
CATEGORY_SPECS: Dict[str, Dict[str, Any]] = {
    "Electronics": {
        "subcategories": ["Smartphones", "Laptops", "Audio & Headphones", "Smart Home", "Accessories"],
        "price_range": (89.0, 3899.0),
        "margin_range": (0.22, 0.38),
        "aov_weight": 2.2,
        "items": [
            ("Smartphone Galaxy Pro 128GB", "Smartphones", 2499.0, 1750.0),
            ("Smartphone iPhone Plus 256GB", "Smartphones", 3899.0, 2900.0),
            ("Wireless Noise Canceling Headphones", "Audio & Headphones", 649.0, 420.0),
            ("Bluetooth Portable Speaker Max", "Audio & Headphones", 299.0, 180.0),
            ("Laptop Ultrabook 16GB 512GB SSD", "Laptops", 3499.0, 2600.0),
            ("Smart Watch Active Pro", "Smart Home", 499.0, 310.0),
            ("Fast USB-C 65W GaN Charger", "Accessories", 129.0, 65.0),
            ("Mechanical RGB Gaming Keyboard", "Accessories", 349.0, 190.0),
            ("Wireless Ergonomic Mouse", "Accessories", 189.0, 95.0),
            ("Smart Wi-Fi Security Camera HD", "Smart Home", 229.0, 130.0),
        ]
    },
    "Home & Living": {
        "subcategories": ["Kitchen Appliances", "Bed & Bath", "Furniture", "Decor", "Lighting"],
        "price_range": (45.0, 1299.0),
        "margin_range": (0.42, 0.58),
        "aov_weight": 1.4,
        "items": [
            ("Digital Air Fryer 5.5L Inox", "Kitchen Appliances", 449.0, 220.0),
            ("Espresso Coffee Maker Automatic", "Kitchen Appliances", 899.0, 480.0),
            ("Egyptian Cotton Bedding Set King", "Bed & Bath", 389.0, 170.0),
            ("Robot Vacuum Cleaner Smart Sensor", "Kitchen Appliances", 1199.0, 620.0),
            ("Ergonomic Mesh Office Chair", "Furniture", 749.0, 360.0),
            ("Minimalist Scandinavian Floor Lamp", "Lighting", 229.0, 95.0),
            ("Ceramic Non-Stick Cookware Set 5pcs", "Kitchen Appliances", 359.0, 160.0),
            ("Microfiber Luxury Bath Towel 4-Pack", "Bed & Bath", 149.0, 60.0),
        ]
    },
    "Beauty & Health": {
        "subcategories": ["Skincare", "Haircare", "Fragrances", "Makeup", "Personal Care"],
        "price_range": (29.0, 450.0),
        "margin_range": (0.60, 0.78),
        "aov_weight": 0.8,
        "items": [
            ("Hyaluronic Acid Hydrating Facial Serum", "Skincare", 89.0, 22.0),
            ("Vitamin C Radiant Glow Facial Cream", "Skincare", 119.0, 28.0),
            ("Deep Repair Argan Oil Hair Mask", "Haircare", 79.0, 18.0),
            ("Eau de Parfum Velvet Rose 100ml", "Fragrances", 289.0, 75.0),
            ("Matte Long-Lasting Foundation SPF30", "Makeup", 95.0, 24.0),
            ("Professional Ionic Hair Dryer 2200W", "Haircare", 249.0, 90.0),
            ("Sonic Electric Toothbrush Rechargeable", "Personal Care", 179.0, 45.0),
        ]
    },
    "Fashion & Apparel": {
        "subcategories": ["Men's Clothing", "Women's Clothing", "Footwear", "Sportswear", "Bags"],
        "price_range": (39.0, 699.0),
        "margin_range": (0.52, 0.68),
        "aov_weight": 1.1,
        "items": [
            ("Premium Pima Cotton T-Shirt", "Men's Clothing", 99.0, 32.0),
            ("High-Waist Performance Yoga Leggings", "Sportswear", 149.0, 48.0),
            ("Classic Denim Jacket Dark Wash", "Women's Clothing", 279.0, 95.0),
            ("Breathable Lightweight Running Shoes", "Footwear", 399.0, 150.0),
            ("Genuine Leather Minimalist Backpack", "Bags", 489.0, 180.0),
            ("Casual Linen Long Sleeve Shirt", "Men's Clothing", 189.0, 65.0),
            ("Seamless Comfort Sports Bra", "Sportswear", 89.0, 28.0),
        ]
    },
    "Sports & Outdoors": {
        "subcategories": ["Fitness Equipment", "Outdoor & Camping", "Cycling", "Athletic Accessories"],
        "price_range": (35.0, 1899.0),
        "margin_range": (0.45, 0.62),
        "aov_weight": 1.3,
        "items": [
            ("Adjustable Dumbbell Set 20kg", "Fitness Equipment", 399.0, 180.0),
            ("Thermal Water Bottle 1000ml Insulated", "Athletic Accessories", 79.0, 26.0),
            ("Foldable Mountain Bike 21-Speed", "Cycling", 1699.0, 920.0),
            ("Waterproof Camping Tent 4-Person", "Outdoor & Camping", 549.0, 240.0),
            ("High-Density Anti-Slip Yoga Mat 6mm", "Fitness Equipment", 119.0, 42.0),
        ]
    },
    "Gaming & Tech": {
        "subcategories": ["Consoles & Handhelds", "Gaming Peripherals", "Virtual Reality", "Games"],
        "price_range": (149.0, 4299.0),
        "margin_range": (0.18, 0.32),
        "aov_weight": 2.5,
        "items": [
            ("Next-Gen Gaming Console 1TB", "Consoles & Handhelds", 3999.0, 3100.0),
            ("Wireless Pro Gaming Controller", "Gaming Peripherals", 449.0, 290.0),
            ("7.1 Surround Sound Gaming Headset", "Gaming Peripherals", 389.0, 220.0),
            ("All-in-One VR Headset 256GB", "Virtual Reality", 2899.0, 2100.0),
        ]
    },
    "Accessories": {
        "subcategories": ["Watches", "Eyewear", "Wallets & Small Leather", "Jewelry"],
        "price_range": (49.0, 899.0),
        "margin_range": (0.58, 0.75),
        "aov_weight": 0.9,
        "items": [
            ("Polarized UV400 Classic Sunglasses", "Eyewear", 159.0, 42.0),
            ("Automatic Chronograph Stainless Watch", "Watches", 699.0, 220.0),
            ("Slim RFID-Blocking Leather Wallet", "Wallets & Small Leather", 89.0, 24.0),
            ("Sterling Silver Minimalist Bracelet", "Jewelry", 189.0, 52.0),
        ]
    }
}

# ==================== CHANNELS & PAYMENT METHODS ====================
CHANNELS_WEIGHTED = [
    ("Organic Search", 0.32),
    ("Paid Search (Google)", 0.28),
    ("Paid Social (Meta/TikTok)", 0.18),
    ("Email Marketing", 0.10),
    ("Direct", 0.07),
    ("Referral", 0.03),
    ("Affiliate", 0.02),
]

PAYMENT_METHODS_WEIGHTED = [
    ("PIX", 0.52),
    ("Credit Card", 0.40),
    ("Boleto", 0.08),
]

DEVICE_TYPES_WEIGHTED = [
    ("Mobile iOS", 0.42),
    ("Mobile Android", 0.36),
    ("Desktop", 0.20),
    ("Tablet", 0.02),
]

BROWSERS_BY_DEVICE = {
    "Mobile iOS": [("Mobile Safari", 0.88), ("Chrome Mobile", 0.12)],
    "Mobile Android": [("Chrome Mobile", 0.82), ("Samsung Internet", 0.18)],
    "Desktop": [("Chrome", 0.68), ("Safari", 0.14), ("Edge", 0.12), ("Firefox", 0.06)],
    "Tablet": [("Mobile Safari", 0.70), ("Chrome Mobile", 0.30)],
}
