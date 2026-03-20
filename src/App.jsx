import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const sumCartItems = (items) =>
  (items || []).reduce((acc, item) => acc + Number(item.quantity || 0), 0);

import {
  API_BASE_URL,
  ANALYTICS_SCHEMA_VERSION,
  BRAND_NAME,
  PRICE_PLACEHOLDER,
  PRODUCTS,
  WHATSAPP_NUMBER,
  createSessionId
} from './lib/constants';
import Nav from './components/Nav';
import AccountPanel from './components/AccountPanel';
import HeroSection from './components/HeroSection';
import SocialProof from './components/SocialProof';
import CatalogSection from './components/CatalogSection';
import SubscriptionSection from './components/SubscriptionSection';
import AlchemistTeaserSection from './components/AlchemistTeaserSection';
import AlchemistView from './components/AlchemistView';
import ProductDetailModal from './components/ProductDetailModal';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import NewsletterPopup from './components/NewsletterPopup';
import CrmUnavailableView from './components/CrmUnavailableView';
import ResetPassword from './components/ResetPassword';
import ValuesSection from './components/ValuesSection';

const App = () => {
  const [pathname, setPathname] = useState(() => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname;
  });
  const [isCrmBlockedPath, setIsCrmBlockedPath] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.startsWith('/crm');
  });
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') return 'landing';
    return window.location.pathname.startsWith('/alquimista') ? 'alquimista' : 'landing';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [subscriptionEggType, setSubscriptionEggType] = useState('Mixto');

  const [showTopBanner, setShowTopBanner] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('rdn_social_banner_closed') !== '1';
  });
  const [topBannerIndex, setTopBannerIndex] = useState(0);

  const [authToken, setAuthToken] = useState('');
  const [authUser, setAuthUser] = useState(null);
  const [accountPanelOpen, setAccountPanelOpen] = useState(false);
  const [accountPanelTab, setAccountPanelTab] = useState('profile');
  const [cartCount, setCartCount] = useState(0);

  const [showNewsletter, setShowNewsletter] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const [verifyBannerDismissed, setVerifyBannerDismissed] = useState(false);
  const [verifyEmailMsg, setVerifyEmailMsg] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);
  const [isChefUnlocked, setIsChefUnlocked] = useState(false);
  const [accessCode, setAccessCode] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.sessionStorage.getItem('rdn_alchemist_code') || '';
  });
  const [codeError, setCodeError] = useState('');
  const [chefQuery, setChefQuery] = useState('');
  const [chefLoading, setChefLoading] = useState(false);
  const [chefResult, setChefResult] = useState(null);
  const [chefFallbackText, setChefFallbackText] = useState('');
  const [chefFallbackActionable, setChefFallbackActionable] = useState(false);

  const viewedProductMapRef = useRef({});
  const [analyticsSessionId] = useState(() => {
    if (typeof window === 'undefined') return 'server';
    const existing = localStorage.getItem('rdn_session_id');
    if (existing) return existing;
    const next = createSessionId();
    localStorage.setItem('rdn_session_id', next);
    return next;
  });

  const trackEvent = useCallback((eventName, payload = {}) => {
    const eventId = typeof window !== 'undefined' && window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `evt_${Math.random().toString(36).slice(2)}_${Date.now()}`;

    fetch(`${API_BASE_URL}/api/analytics/events`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && authToken !== 'cookie' ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        session_id: analyticsSessionId,
        customer_id: authUser?.id || null,
        source: 'landing',
        app_area: 'web',
        environment: import.meta.env.PROD ? 'production' : 'local',
        schema_version: ANALYTICS_SCHEMA_VERSION,
        page_path: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/',
        payload
      }),
      keepalive: true
    }).catch(() => {});
  }, [authToken, analyticsSessionId, authUser?.id]);

  useEffect(() => {
    if (!showTopBanner) return undefined;
    const id = setInterval(() => {
      setTopBannerIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(id);
  }, [showTopBanner]);

  useEffect(() => {
    const dismissed = localStorage.getItem('rdn_newsletter_dismissed');
    if (dismissed) return;
    const timer = setTimeout(() => setShowNewsletter(true), 25000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/catalog`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products?.length) {
          setProducts(data.products);
          return;
        }

        setProducts(PRODUCTS);
      })
      .catch(() => setProducts(PRODUCTS));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: 'include',
      headers: authToken && authToken !== 'cookie' ? { Authorization: `Bearer ${authToken}` } : {}
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setAuthToken('');
          setAuthUser(null);
          return;
        }
        setAuthToken((prev) => prev || 'cookie');
        setAuthUser(data.user);
      })
      .catch(() => {
        setAuthToken('');
        setAuthUser(null);
      });
  }, [authToken]);

  useEffect(() => {
    if (!authToken) return;
    fetch(`${API_BASE_URL}/api/cart`, {
      credentials: 'include',
      headers: authToken && authToken !== 'cookie' ? { Authorization: `Bearer ${authToken}` } : {}
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) return;
        const totalItems = sumCartItems(data.items);
        setCartCount(totalItems);
      })
      .catch(() => {});
  }, [authToken]);

  useEffect(() => {
    if (!selectedProduct) return;
    const key = String(selectedProduct.id);
    const now = Date.now();
    const lastSeenAt = viewedProductMapRef.current[key] || 0;
    if (now - lastSeenAt < 30000) return;
    viewedProductMapRef.current[key] = now;
    trackEvent('view_product', {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      price: selectedProduct.price,
      badge: selectedProduct.badge,
      in_stock: Boolean(selectedProduct.inStock),
      currency: 'CLP'
    });
  }, [selectedProduct, trackEvent]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      setPathname(window.location.pathname);
      setIsCrmBlockedPath(window.location.pathname.startsWith('/crm'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (pathname.startsWith('/alquimista')) {
      setActiveTab('alquimista');
      return;
    }

    if (!pathname.startsWith('/reset-password') && !pathname.startsWith('/verify-email')) {
      setActiveTab('landing');
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!pathname.startsWith('/verify-email')) return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      window.history.replaceState(null, '', '/');
      setPathname('/');
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setVerifyEmailMsg(data.success ? 'Email verificado correctamente.' : `No se pudo verificar el email: ${data.error || 'Error'}`);
        if (data.success) {
          setAuthToken('cookie');
          setAuthUser(data.user || null);
        }
        window.history.replaceState(null, '', '/');
        setPathname('/');
      })
      .catch(() => setVerifyEmailMsg('No se pudo verificar el email. Intenta de nuevo.'));
  }, [pathname]);

  const topBannerMessages = [
    'Productos frescos seleccionados para tu mesa',
    'Del campo directo a tu mesa',
    'Calidad que se siente en cada bocado'
  ];

  const closeTopBanner = () => {
    setShowTopBanner(false);
    localStorage.setItem('rdn_social_banner_closed', '1');
  };

  const addToCart = async (qty = 1, productId = null) => {
    const product = products.find((item) => item.id === Number(productId));

    if (authToken && productId) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/cart/items`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && authToken !== 'cookie' ? { Authorization: `Bearer ${authToken}` } : {})
          },
          body: JSON.stringify({ product_id: productId, quantity: qty })
        });
        const data = await res.json();
        if (res.ok) {
          const totalItems = sumCartItems(data.items);
          setCartCount(totalItems);
          trackEvent('add_to_cart', {
            product_id: Number(productId),
            product_name: product?.name || null,
            quantity: Number(qty) || 1,
            unit_price: product?.price || null,
            cart_count_after: totalItems,
            currency: 'CLP'
          });
          return;
        }
      } catch {
        // fallback local
      }
    }

    setCartCount((prev) => prev + qty);
  };

  const openAccountPanel = (tab = 'profile') => {
    setAccountPanelTab(tab);
    setAccountPanelOpen(true);
  };

  const handleAuthSuccess = (token, user) => {
    setAuthToken(token || 'cookie');
    setAuthUser(user);
  };

  const handleLogout = () => {
    fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(() => {});
    setAuthToken('');
    setAuthUser(null);
    setCartCount(0);
    setAccountPanelTab('login');
  };

  const handleOrder = (productName) => {
    const catalogSummary = products
      .map((p) => `- ${p.name}: ${PRICE_PLACEHOLDER}`)
      .join('%0A');
    const message = encodeURIComponent(
      `Hola ${BRAND_NAME}, quiero pedir: ${productName}.%0A%0A` +
      `Catalogo:%0A${catalogSummary}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleProductWhatsApp = (productName) => {
    const product = products.find((item) => item.name === productName);
    if (product?.id) addToCart(1, product.id);
    handleOrder(productName);
  };

  const handleSubscription = () => {
    // Sistema de suscripciones desactivado temporalmente.
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail, source: 'popup' })
      });
      const data = await res.json();
      setNewsletterMsg(data.message || 'Suscripcion registrada.');
      localStorage.setItem('rdn_newsletter_dismissed', '1');
    } catch {
      setNewsletterMsg('Gracias, te mantendremos informado.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendingVerification) return;
    setResendingVerification(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(authToken && authToken !== 'cookie' ? { Authorization: `Bearer ${authToken}` } : {})
      };
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        credentials: 'include',
        headers
      });
      const data = await res.json();
      setVerifyEmailMsg(data.success ? 'Email de verificacion enviado.' : `No se pudo enviar: ${data.error || 'Error'}`);
    } catch {
      setVerifyEmailMsg('No se pudo enviar el email. Intenta de nuevo.');
    } finally {
      setResendingVerification(false);
    }
  };

  const navigateTo = useCallback((nextPath) => {
    if (typeof window === 'undefined') return;

    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }

    setPathname(nextPath);
    setIsCrmBlockedPath(nextPath.startsWith('/crm'));
  }, []);

  const goHome = useCallback(() => {
    setActiveTab('landing');
    setMobileMenuOpen(false);
    navigateTo('/');
  }, [navigateTo]);

  const openAlchemist = useCallback(() => {
    setActiveTab('alquimista');
    setMobileMenuOpen(false);
    navigateTo('/alquimista');
  }, [navigateTo]);

  const scrollTo = (id) => {
    const performScroll = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    if (activeTab !== 'landing' || pathname !== '/') {
      goHome();
      setTimeout(() => {
        performScroll();
      }, 150);
    } else {
      performScroll();
    }
  };

  const verifyCode = async () => {
    const normalizedCode = accessCode.replace(/\s+/g, '').toUpperCase();

    if (!normalizedCode) {
      setCodeError('Ingresa tu codigo.');
      return;
    }

    setCodeError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/chef/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalizedCode })
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setIsChefUnlocked(false);
        setCodeError('Codigo incorrecto. Intenta de nuevo.');
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('rdn_alchemist_code');
        }
        return;
      }

      setAccessCode(normalizedCode);
      setIsChefUnlocked(true);
      setChefFallbackText('');
      setChefFallbackActionable(false);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('rdn_alchemist_code', normalizedCode);
      }
      trackEvent('ai_unlock', {
        channel: 'alquimista',
        method: 'access_code'
      });
    } catch {
      setIsChefUnlocked(false);
      setCodeError('No pudimos validar tu codigo. Intenta de nuevo.');
    }
  };

  const askChef = async () => {
    const normalizedQuery = chefQuery.trim();

    if (!normalizedQuery) {
      setChefResult(null);
      setChefFallbackText('Cuéntame qué ingredientes tienes para que El Alquimista pueda ayudarte.');
      setChefFallbackActionable(false);
      return;
    }

    setChefLoading(true);
    setChefResult(null);
    setChefFallbackText('');
    setChefFallbackActionable(false);
    setCodeError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/chef`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && authToken !== 'cookie' ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          query: normalizedQuery,
          locale: 'es-CL',
          ...(accessCode.trim() ? { code: accessCode.trim().toUpperCase() } : {})
        })
      });

      const data = await res.json();

      if (res.ok && data.success && data.data) {
        setChefResult(data.data);
        trackEvent('ai_interaction', {
          channel: 'alquimista',
          status: 'success',
          query_length: normalizedQuery.length,
          recipe_title: data.data.title
        });
        return;
      }

      if (res.status === 401 || res.status === 403) {
        setIsChefUnlocked(false);
        setChefResult(null);
        setChefFallbackText('');
        setChefFallbackActionable(false);
        setCodeError('Tu codigo ya no es valido. Verificalo nuevamente.');
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('rdn_alchemist_code');
        }
        return;
      }

      const isRateLimit = res.status === 429;
      const actionableFallback = isRateLimit || res.status >= 500 || res.status === 502;
      const fallbackMessage = res.status === 400
        ? (data.error || 'Describe mejor tus ingredientes y vuelve a intentar.')
        : isRateLimit
          ? 'Por ahora ya alcanzaste el limite del Alquimista. Podemos continuar tu consulta por WhatsApp.'
          : `${data.error || 'El Alquimista no pudo completar tu receta ahora mismo.'}${actionableFallback ? ' Podemos seguir por WhatsApp mientras tanto.' : ''}`;

      setChefResult(null);
      setChefFallbackText(fallbackMessage.trim());
      setChefFallbackActionable(actionableFallback);
      trackEvent('ai_interaction', {
        channel: 'alquimista',
        status: 'fallback',
        reason: isRateLimit ? 'rate_limit' : (res.status === 400 ? 'validation' : 'provider'),
        http_status: res.status
      });
    } catch {
      setChefResult(null);
      setChefFallbackText('La IA no esta disponible en este momento. Podemos seguir por WhatsApp y ayudarte manualmente.');
      setChefFallbackActionable(true);
      trackEvent('ai_interaction', {
        channel: 'alquimista',
        status: 'fallback',
        reason: 'network'
      });
    } finally {
      setChefLoading(false);
    }
  };

  if (isCrmBlockedPath) {
    return <CrmUnavailableView />;
  }

  if (pathname.startsWith('/reset-password')) {
    const token = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('token') : '';

    return (
      <ResetPassword
        token={token || ''}
        apiBaseUrl={API_BASE_URL}
        onSuccess={() => {
          window.history.replaceState(null, '', '/');
          setPathname('/');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full selection:bg-yolk-100 selection:text-brand-900">
      <a href="#catalogo" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-brand-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold focus:shadow-lg">
        Ir al contenido principal
      </a>

      <Nav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scrollTo={scrollTo}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onGoHome={goHome}
        onOpenAlchemist={openAlchemist}
        handleOrder={handleOrder}
        cartCount={cartCount}
        onOpenAccount={() => openAccountPanel(authToken ? 'profile' : 'login')}
        onOpenOrders={() => openAccountPanel(authToken ? 'orders' : 'login')}
        onOpenSubscription={() => openAccountPanel(authToken ? 'subscription' : 'login')}
        onOpenCart={() => openAccountPanel(authToken ? 'cart' : 'login')}
      />

      {(pathname.startsWith('/alquimista') || activeTab === 'alquimista') ? (
        <AlchemistView
          isChefUnlocked={isChefUnlocked}
          accessCode={accessCode}
          setAccessCode={setAccessCode}
          verifyCode={verifyCode}
          codeError={Boolean(codeError)}
          chefQuery={chefQuery}
          setChefQuery={setChefQuery}
          askChef={askChef}
          chefLoading={chefLoading}
          chefResult={chefResult}
          chefFallbackText={chefFallbackText}
          chefFallbackActionable={chefFallbackActionable}
        />
      ) : (
        <>
          {showTopBanner && (
            <div className="bg-brand-700 text-beige-100 text-center py-2.5 px-10 text-xs md:text-sm font-semibold tracking-wide border-b border-brand-800 relative">
              {topBannerMessages[topBannerIndex]}
              <button onClick={closeTopBanner} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10" aria-label="Cerrar banner">
                <X size={16} />
              </button>
            </div>
          )}
          
          <main className="flex-1 w-full overflow-x-hidden">
            <HeroSection scrollTo={scrollTo} handleOrder={handleOrder} />
            <CatalogSection products={products} onSelectProduct={setSelectedProduct} onProductWhatsApp={handleProductWhatsApp} />
            <ValuesSection />
            <AlchemistTeaserSection onOpenAlchemist={openAlchemist} />
            <SocialProof />
            <SubscriptionSection subscriptionEggType={subscriptionEggType} setSubscriptionEggType={setSubscriptionEggType} handleSubscription={handleSubscription} />
          </main>
        </>
      )}

      {verifyEmailMsg && (
        <div className="bg-stone-800 text-white text-center py-2.5 px-10 text-sm font-semibold relative">
          {verifyEmailMsg}
          <button onClick={() => setVerifyEmailMsg('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>
      )}

      {authUser && authUser.email_verified === false && !verifyBannerDismissed && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-center py-2.5 px-10 text-xs md:text-sm font-semibold relative flex items-center justify-center gap-3 flex-wrap">
          <span>Verifica tu email para activar todas las funciones.</span>
          <button
            onClick={handleResendVerification}
            disabled={resendingVerification}
            className="underline underline-offset-2 hover:no-underline disabled:opacity-50"
          >
            {resendingVerification ? 'Enviando...' : 'Reenviar correo'}
          </button>
          <button onClick={() => setVerifyBannerDismissed(true)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-amber-100" aria-label="Cerrar banner">
            <X size={16} />
          </button>
        </div>
      )}

      <AccountPanel
        open={accountPanelOpen}
        onClose={() => setAccountPanelOpen(false)}
        apiBaseUrl={API_BASE_URL}
        authToken={authToken}
        authUser={authUser}
        onAuthSuccess={handleAuthSuccess}
        onTrackEvent={trackEvent}
        onLogout={handleLogout}
        onCartCountChange={(count) => setCartCount(count)}
        initialTab={accountPanelTab}
      />

      <ProductDetailModal
        selectedProduct={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
        onProductWhatsApp={handleProductWhatsApp}
      />

      <NewsletterPopup
        showNewsletter={showNewsletter}
        setShowNewsletter={setShowNewsletter}
        newsletterEmail={newsletterEmail}
        setNewsletterEmail={setNewsletterEmail}
        newsletterMsg={newsletterMsg}
        newsletterLoading={newsletterLoading}
        handleNewsletterSubmit={handleNewsletterSubmit}
      />

      <Footer scrollTo={scrollTo} onOpenAlchemist={openAlchemist} handleOrder={handleOrder} activeTab={activeTab} />
    </div>
  );
};

export default App;
