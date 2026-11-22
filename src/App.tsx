import React, { useEffect, useState } from 'react';
import { CartItem, Currency, Lang, Product } from './types';
import { FLAGSHIP_KITS, PRODUCTS } from './data/products';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CinematicKitShowcase } from './components/CinematicKitShowcase';
import { VirtualShowroom3D } from './components/three/VirtualShowroom3D';
import { CatalogSection } from './components/CatalogSection';
import { ScenarioFinder } from './components/ScenarioFinder';
import { FaqAndFooter } from './components/FaqAndFooter';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';

const CART_STORAGE_KEY = 'calmo_kit_cart_v1';

export default function App() {
  const [lang, setLang] = useState<Lang>('es');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [stripeReturnOrderRef, setStripeReturnOrderRef] = useState<string | null>(
    null
  );

  // Handle Stripe Checkout return (?checkout=success&ref=CK-... or ?checkout=cancelled)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('checkout');
    const ref = params.get('ref');
    if (status === 'success') {
      setCartItems([]);
      setStripeReturnOrderRef(ref || 'CK-PAID');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (status === 'cancelled') {
      setCartOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      const parsed: { productId: string; variantId: string; quantity: number }[] =
        JSON.parse(saved);
      return parsed
        .map((entry) => {
          const product = PRODUCTS.find((p) => p.id === entry.productId);
          if (!product) return null;
          return {
            product,
            variantId: entry.variantId,
            quantity: entry.quantity,
          };
        })
        .filter((x): x is CartItem => x !== null);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const compact = cartItems.map((i) => ({
        productId: i.product.id,
        variantId: i.variantId,
        quantity: i.quantity,
      }));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(compact));
    } catch {
      // Ignore storage quota errors
    }
  }, [cartItems]);

  const handleAddToCart = (
    product: Product,
    variantId?: string,
    quantity = 1
  ) => {
    const chosenVariant = variantId ?? product.variants[0]?.id ?? 'default';
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (item) =>
          item.product.id === product.id && item.variantId === chosenVariant
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, { product, variantId: chosenVariant, quantity }];
    });
    setCartOpen(true);
  };

  const handleAddBundle = (bundleProducts: Product[]) => {
    setCartItems((prev) => {
      const next = [...prev];
      bundleProducts.forEach((product) => {
        const chosenVariant = product.variants[0]?.id ?? 'default';
        const idx = next.findIndex(
          (item) =>
            item.product.id === product.id && item.variantId === chosenVariant
        );
        if (idx > -1) {
          next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        } else {
          next.push({ product, variantId: chosenVariant, quantity: 1 });
        }
      });
      return next;
    });
    setCartOpen(true);
  };

  const handleUpdateQty = (
    productId: string,
    variantId: string,
    delta: number
  ) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId && item.variantId === variantId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemove = (productId: string, variantId: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.variantId === variantId)
      )
    );
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const upsellProduct = PRODUCTS.find((p) => p.id === 'gear-water-filter');

  return (
    <div className="min-h-screen bg-[#080B10] text-white">
      <Navbar
        lang={lang}
        setLang={setLang}
        currency={currency}
        setCurrency={setCurrency}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onQuickSearch={(term) => setSearchQuery(term)}
      />

      <main>
        {/* 1. Full-Bleed Cinematic Alpine Hero (Video 3) */}
        <HeroSection lang={lang} />

        {/* 2. Color-Adaptive Cinematic Flagship Kit Switcher (Video 3 + Live 3D Toggle) */}
        <CinematicKitShowcase
          kits={FLAGSHIP_KITS}
          lang={lang}
          currency={currency}
          onAddToCart={(p, v) => handleAddToCart(p, v, 1)}
          onInspectProduct={(p) => setSelectedProduct(p)}
        />

        {/* 3. Interactive Dark Tactical 3D Virtual Showroom (Video 1: KALLE HUD + WebGL) */}
        <VirtualShowroom3D
          products={PRODUCTS}
          lang={lang}
          currency={currency}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />

        {/* 4. Minimalist Clean Light Storefront Grid (Video 2: Your Next Store) */}
        <CatalogSection
          products={PRODUCTS}
          lang={lang}
          currency={currency}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onAddToCart={(p) => handleAddToCart(p)}
        />

        {/* 5. Interactive Situation Finder / Recommended Loadouts */}
        <ScenarioFinder
          products={PRODUCTS}
          lang={lang}
          currency={currency}
          onInspectProduct={(p) => setSelectedProduct(p)}
          onAddBundle={handleAddBundle}
        />

        {/* 6. FAQ + Dark Flagship Footer */}
        <FaqAndFooter lang={lang} />
      </main>

      {/* Interactive 3D Product Detail Modal (Video 2 PDP) */}
      <ProductDetailModal
        product={selectedProduct}
        lang={lang}
        currency={currency}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-out Shopping Bag */}
      <CartDrawer
        open={cartOpen}
        items={cartItems}
        upsellProduct={upsellProduct}
        lang={lang}
        currency={currency}
        onClose={() => setCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemove}
        onAddUpsell={(p) => handleAddToCart(p)}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Express Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        items={cartItems}
        lang={lang}
        currency={currency}
        onClose={() => setCheckoutOpen(false)}
        onOrderComplete={() => setCartItems([])}
      />

      {/* Stripe Return Order Confirmed Toast/Modal */}
      {stripeReturnOrderRef && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
          onClick={() => setStripeReturnOrderRef(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white text-slate-950 p-8 text-center shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 font-bold text-2xl mx-auto">
              ✓
            </div>
            <h3 className="font-display text-2xl font-bold">
              {lang === 'pt'
                ? 'Pagamento confirmado!'
                : lang === 'es'
                ? '¡Pago confirmado!'
                : 'Payment confirmed!'}
            </h3>
            <p className="text-sm text-slate-600">
              {lang === 'pt'
                ? 'Recebemos o teu pedido na CalmoKit. Para dúvidas: hola@calmokit.eu.'
                : lang === 'es'
                ? 'Hemos recibido tu pedido en CalmoKit. Cualquier duda: hola@calmokit.eu.'
                : 'Your CalmoKit order is confirmed. Questions? Email hola@calmokit.eu.'}
            </p>
            <div className="inline-block rounded-full bg-slate-100 px-4 py-1.5 font-mono text-xs font-bold text-slate-800">
              Ref: {stripeReturnOrderRef}
            </div>
            <div>
              <button
                type="button"
                onClick={() => setStripeReturnOrderRef(null)}
                className="mt-2 rounded-full bg-slate-950 text-white px-7 py-3 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
