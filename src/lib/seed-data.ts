export interface SeedProduct {
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  inStock: boolean;
}

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    name: "Rose Glow Vitamin C Serum",
    category: "Skincare",
    price: 34.0,
    description:
      "A brightening serum with 15% stabilised vitamin C and rosehip extract. Evens tone, softens dark spots and leaves skin with a dewy, lit-from-within glow.",
    image: img("1620916566398-39f1143ab7be"),
    inStock: true,
  },
  {
    name: "Velvet Hydrating Face Cream",
    category: "Skincare",
    price: 28.5,
    description:
      "A cushiony daily moisturiser with hyaluronic acid and shea butter that drinks into the skin without feeling heavy — 72-hour hydration.",
    image: img("1556228720-195a672e8a03"),
    inStock: true,
  },
  {
    name: "Midnight Repair Night Cream",
    category: "Skincare",
    price: 42.0,
    description:
      "An overnight treatment powered by peptides and bakuchiol that works while you sleep, so you wake up smoother, plumper and well rested.",
    image: img("1599305445671-ac291c95aaa9"),
    inStock: true,
  },
  {
    name: "Radiance Glow Face Mask",
    category: "Skincare",
    price: 16.0,
    description:
      "A five-minute clay-and-enzyme mask that melts away dullness and congestion, revealing fresh, petal-soft skin underneath.",
    image: img("1617897903246-719242758050"),
    inStock: true,
  },
  {
    name: "Hydrating Toner Mist",
    category: "Skincare",
    price: 18.0,
    description:
      "A fine rose-water mist with panthenol that rebalances skin after cleansing and preps skin for the rest of your routine. Bag-friendly.",
    image: img("1512496015851-a90fb38ba796"),
    inStock: false,
  },
  {
    name: "Silk Finish Liquid Foundation",
    category: "Makeup",
    price: 31.0,
    description:
      "Buildable medium coverage with a soft-matte finish that never cakes. 24 flexible shades designed to melt into your exact undertone.",
    image: img("1596462502278-27bfdc403348"),
    inStock: true,
  },
  {
    name: "Velvet Matte Lipstick Trio",
    category: "Makeup",
    price: 24.0,
    description:
      "Three universally flattering nudes in a weightless matte formula that stays put through coffee, conversation and everything else.",
    image: img("1631730359585-38a4935cbec4"),
    inStock: true,
  },
  {
    name: "Pro Blush & Contour Palette",
    category: "Makeup",
    price: 38.0,
    description:
      "Six silky, blendable powders for warmth, definition and a healthy flush — from subtle daytime sculpt to full editorial drama.",
    image: img("1586495777744-4413f21062fa"),
    inStock: true,
  },
  {
    name: "Precision Brush Collection",
    category: "Accessories",
    price: 45.0,
    description:
      "Eight vegan-bristle brushes with tapered handles for flawless complexion, eye and lip application. Comes in a quilted travel case.",
    image: img("1608248543803-ba4f8c70ae0b"),
    inStock: true,
  },
  {
    name: "Argan Silk Hair Elixir",
    category: "Haircare",
    price: 26.0,
    description:
      "A lightweight leave-in oil with argan and marula that tames frizz, seals split ends and adds mirror shine without any greasy weight.",
    image: img("1608571423902-eed4a5ad8108"),
    inStock: true,
  },
  {
    name: "Botanical Repair Shampoo",
    category: "Haircare",
    price: 19.5,
    description:
      "A sulfate-free lather infused with rosemary and rice protein that gently cleanses while strengthening fragile, colour-treated hair.",
    image: img("1598440947619-2c35fc9aa908"),
    inStock: true,
  },
  {
    name: "Nourishing Cocoa Body Butter",
    category: "Body Care",
    price: 22.0,
    description:
      "A rich whipped butter with cocoa butter and vitamin E that smooths rough patches and keeps skin soft for up to 24 hours.",
    image: img("1571781926291-c477ebfd024b"),
    inStock: true,
  },
  {
    name: "Floral Bloom Eau de Parfum",
    category: "Fragrance",
    price: 58.0,
    description:
      "Peony, white tea and warm musk in a modern floral that lingers beautifully from morning meetings to midnight dinners.",
    image: img("1541643600914-78b084683601"),
    inStock: true,
  },
  {
    name: "Amber Noir Eau de Parfum",
    category: "Fragrance",
    price: 62.0,
    description:
      "A magnetic night-out scent of amber, oud and black vanilla — bold, warm and unmistakably memorable.",
    image: img("1526947425960-945c6e72858f"),
    inStock: false,
  },
];
