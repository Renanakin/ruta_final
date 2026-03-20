import { useCallback, useEffect, useState } from 'react';
import {
  X,
  LogOut,
  ReceiptText,
  IdCard,
  Mail,
  ArrowLeft,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { cn, PRICE_PLACEHOLDER } from '../lib/constants';

const formatClp = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return PRICE_PLACEHOLDER;
  return `$${Number(value).toLocaleString('es-CL')}`;
};

const AccountPanel = ({
  open,
  onClose,
  apiBaseUrl,
  authToken,
  authUser,
  onAuthSuccess,
  onTrackEvent,
  onLogout,
  onCartCountChange,
  initialTab = 'profile'
}) => {
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false); // pantalla post-registro

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false); // pantalla post-envÃ­o de reset

  const [profileName, setProfileName] = useState(authUser?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(authUser?.phone || '');

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({ total_items: 0, subtotal: 0 });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    delivery_schedule: '09:00',
    delivery_address: authUser?.phone ? '' : '',
    notes: '',
    use_subscription: false,
    subscription_id: ''
  });

  const [subscription, setSubscription] = useState(null);
  const [subscriptionForm, setSubscriptionForm] = useState({
    plan_code: 'home_chef',
    egg_type: 'gallina_libre',
    status: 'active',
    next_delivery_date: '',
    notes: ''
  });

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, open]);

  useEffect(() => {
    setProfileName(authUser?.full_name || '');
    setProfilePhone(authUser?.phone || '');
  }, [authUser]);

  useEffect(() => {
    setCheckoutForm((prev) => ({ ...prev, delivery_address: prev.delivery_address || '' }));
  }, [authUser]);

  const fetchOrders = useCallback(() => {
    if (!authToken) return;
    const headers = authToken && authToken !== 'cookie' ? { Authorization: `Bearer ${authToken}` } : {};
    fetch(`${apiBaseUrl}/api/customer/orders`, { headers, credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]));
  }, [authToken, apiBaseUrl]);

  const fetchCart = useCallback(() => {
    if (!authToken) return;
    const headers = authToken && authToken !== 'cookie' ? { Authorization: `Bearer ${authToken}` } : {};
    fetch(`${apiBaseUrl}/api/cart`, { headers, credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const items = data.items || [];
        setCartItems(items);
        setCartSummary(data.summary || { total_items: 0, subtotal: 0 });
        onCartCountChange?.((data.summary || {}).total_items || 0);
      })
      .catch(() => {
        setCartItems([]);
        setCartSummary({ total_items: 0, subtotal: 0 });
      });
  }, [authToken, apiBaseUrl, onCartCountChange]);

  useEffect(() => {
    if (!open || !authToken) return;

    const headers = authToken && authToken !== 'cookie' ? { Authorization: `Bearer ${authToken}` } : {};

    if (tab === 'orders') {
      fetchOrders();
    }

    if (tab === 'subscription') {
      fetch(`${apiBaseUrl}/api/customer/subscription`, { headers, credentials: 'include' })
        .then((r) => r.json())
        .then((data) => {
          setSubscription(data.subscription || null);
          if (data.subscription) {
            setSubscriptionForm({
              plan_code: data.subscription.plan_code,
              egg_type: data.subscription.egg_type,
              status: data.subscription.status,
              next_delivery_date: data.subscription.next_delivery_date || '',
              notes: data.subscription.notes || ''
            });
          }
        })
        .catch(() => setSubscription(null));
    }

    if (tab === 'cart') {
      fetchCart();
    }
  }, [open, tab, authToken, apiBaseUrl, fetchOrders, fetchCart]);

  if (!open) return null;

  const authHeaders = authToken
    ? {
      'Content-Type': 'application/json',
      ...(authToken !== 'cookie' ? { Authorization: `Bearer ${authToken}` } : {})
    }
    : { 'Content-Type': 'application/json' };

  const handleLogin = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar sesión');
      onAuthSuccess(data.token || 'cookie', data.user);
      onTrackEvent?.('login', { channel: 'account_panel' });
      setTab('profile');
      setMessage('Sesión iniciada correctamente.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          full_name: registerName,
          email: registerEmail,
          phone: registerPhone,
          password: registerPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo registrar cliente');
      // La cuenta requiere verificación de email — NO hacer auto-login
      onTrackEvent?.('create_account', { channel: 'account_panel' });
      setRegisterSuccess(true);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) { setMessage('Ingresa tu email.'); return; }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar el email');
      setForgotSent(true);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${apiBaseUrl}/api/customer/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({ full_name: profileName, phone: profilePhone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar el perfil');
      onAuthSuccess(authToken, data.profile);
      setMessage('Perfil actualizado.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSubscription = async () => {
    setLoading(true);
    setMessage('');
    try {
      const endpoint = subscription
        ? `${apiBaseUrl}/api/customer/subscription/${subscription.id}`
        : `${apiBaseUrl}/api/customer/subscription`;
      const method = subscription ? 'PATCH' : 'POST';
      const res = await fetch(endpoint, {
        method,
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify(subscriptionForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar la suscripción');
      setSubscription(data.subscription);
      onTrackEvent?.('subscription_interest', {
        channel: 'account_panel',
        plan_code: subscriptionForm.plan_code,
        egg_type: subscriptionForm.egg_type,
        status: subscriptionForm.status
      });
      setMessage('Suscripción guardada correctamente.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCartQuantity = async (itemId, quantity) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${apiBaseUrl}/api/cart/items/${itemId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({ quantity })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar cantidad');
      fetchCart();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCartItem = async (itemId) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${apiBaseUrl}/api/cart/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo eliminar item');
      fetchCart();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setMessage('');
    try {
      const payload = {
        delivery_schedule: checkoutForm.delivery_schedule,
        delivery_address: checkoutForm.delivery_address,
        notes: checkoutForm.notes,
        ...(checkoutForm.use_subscription && checkoutForm.subscription_id
          ? { subscription_id: Number(checkoutForm.subscription_id) }
          : {})
      };

      const res = await fetch(`${apiBaseUrl}/api/cart/checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo finalizar checkout');

      onTrackEvent?.('purchase', {
        channel: 'account_panel',
        orders_count: data.orders_count || 0,
        order_id: data.order_id || null,
        use_subscription: Boolean(checkoutForm.use_subscription),
        delivery_schedule: checkoutForm.delivery_schedule
      });
      setMessage(`Checkout completado: ${data.orders_count || 1} pedido(s) creados. Valor final ${formatClp(cartSummary.subtotal)}.`);
      fetchCart();
      fetchOrders();
      setTab('orders');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const tabButton = (key, label) => (
    <button
      onClick={() => setTab(key)}
      className={cn(
        'px-3 py-2 rounded-xl text-xs md:text-sm font-black transition-colors',
        tab === key ? 'bg-brand-700 text-white' : 'bg-beige-100 text-stone-700 hover:bg-beige-200'
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[95] bg-black/50 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] border border-beige-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-beige-200 px-6 py-4">
          <h3 className="text-2xl font-serif font-black text-brand-800">Ãrea de Cliente</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-beige-100"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {!authUser ? (
            <div className="flex flex-wrap gap-2">
              {tabButton('login', 'Iniciar sesión')}
              {tabButton('register', 'Crear cuenta')}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 items-center">
              {tabButton('profile', 'Mi Cuenta')}
              {tabButton('cart', 'Mi Carrito')}
              {tabButton('orders', 'Mis Pedidos')}
              {tabButton('subscription', 'Mi Suscripción')}
              <button onClick={onLogout} className="ml-auto px-3 py-2 rounded-xl bg-red-50 text-red-700 text-xs md:text-sm font-black inline-flex items-center gap-1"><LogOut size={14} /> Cerrar sesión</button>
            </div>
          )}

          {message && <div className="rounded-xl border border-beige-200 bg-beige-100 px-4 py-3 text-sm font-semibold text-stone-700">{message}</div>}

          {!authUser && tab === 'login' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email" type="email" className="px-4 py-3 rounded-xl border border-beige-200 md:col-span-2" />
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Contraseña" className="px-4 py-3 rounded-xl border border-beige-200 md:col-span-2" />
                <button onClick={handleLogin} disabled={loading} className="md:col-span-2 px-4 py-3 rounded-xl bg-brand-700 text-white font-black disabled:opacity-50 inline-flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Validando...</> : 'Entrar'}
                </button>
              </div>
              {/* Link recuperar contraseña */}
              <div className="text-center">
                <button
                  onClick={() => { setTab('forgot'); setMessage(''); }}
                  className="text-sm text-brand-700 hover:text-brand-800 font-semibold underline underline-offset-2 hover:no-underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>
          )}

          {/* Registro â€” pantalla post-Ã©xito o formulario */}
          {!authUser && tab === 'register' && (
            registerSuccess ? (
              /* Pantalla de confirmaciÃ³n post-registro */
              <div className="text-center space-y-5 py-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle size={32} className="text-emerald-500" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <p className="font-black text-stone-800 text-lg">Â¡Cuenta creada!</p>
                  <p className="text-stone-500 text-sm mt-1">
                    Te enviamos un correo a <strong className="text-stone-700">{registerEmail}</strong>.<br />
                    Haz clic en el link para activar tu cuenta.
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 font-semibold">
                  📩 Revisa también tu carpeta de spam si no lo ves en unos minutos.
                </div>
                <button
                  onClick={() => { setTab('login'); setRegisterSuccess(false); setMessage(''); }}
                  className="w-full py-3 rounded-xl bg-brand-700 text-white font-black hover:bg-brand-800 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Ir a iniciar sesiÃ³n
                </button>
              </div>
            ) : (
              /* Formulario de registro */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={registerName} onChange={(e) => setRegisterName(e.target.value)} placeholder="Nombre completo" className="px-4 py-3 rounded-xl border border-beige-200" />
                <input value={registerPhone} onChange={(e) => setRegisterPhone(e.target.value)} placeholder="Teléfono" className="px-4 py-3 rounded-xl border border-beige-200" />
                <input value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} placeholder="Email" type="email" className="px-4 py-3 rounded-xl border border-beige-200 md:col-span-2" />
                <input type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} placeholder="Contraseña (mínimo 8 caracteres)" className="px-4 py-3 rounded-xl border border-beige-200 md:col-span-2" />
                <button onClick={handleRegister} disabled={loading} className="md:col-span-2 px-4 py-3 rounded-xl bg-brand-700 text-white font-black disabled:opacity-50 inline-flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Creando...</> : 'Crear cuenta'}
                </button>
              </div>
            )
          )}

          {/* Recuperar contraseÃ±a */}
          {!authUser && tab === 'forgot' && (
            forgotSent ? (
              /* ConfirmaciÃ³n post-envÃ­o */
              <div className="text-center space-y-5 py-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center">
                    <Mail size={32} className="text-brand-700" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <p className="font-black text-stone-800 text-lg">Revisa tu correo</p>
                  <p className="text-stone-500 text-sm mt-2">
                    Si <strong className="text-stone-700">{forgotEmail}</strong> está registrado,
                    recibirás un link para restablecer tu contraseña en los próximos minutos.
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 font-semibold">
                  📩 Revisa también tu carpeta de spam si no lo ves en unos minutos.
                </div>
                <button
                  onClick={() => { setTab('login'); setForgotSent(false); setForgotEmail(''); setMessage(''); }}
                  className="w-full py-3 rounded-xl bg-brand-700 text-white font-black hover:bg-brand-800 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Volver al login
                </button>
              </div>
            ) : (
              /* Formulario forgot password */
              <div className="space-y-4">
                <div>
                  <p className="text-stone-600 text-sm font-semibold mb-3">
                    Ingresa el correo con el que creaste tu cuenta y te enviaremos un link para restablecer tu contraseña.
                  </p>
                  <input
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border border-beige-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  onClick={handleForgotPassword}
                  disabled={loading || !forgotEmail}
                  className="w-full py-3 rounded-xl bg-brand-700 text-white font-black disabled:opacity-50 inline-flex items-center justify-center gap-2 hover:bg-brand-800 transition-colors"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : <><Mail size={16} /> Enviar instrucciones</>}
                </button>
                <div className="text-center">
                  <button
                    onClick={() => { setTab('login'); setMessage(''); }}
                    className="text-sm text-stone-500 hover:text-brand-700 font-semibold transition-colors inline-flex items-center gap-1"
                  >
                    <ArrowLeft size={14} /> Volver al inicio de sesión
                  </button>
                </div>
              </div>
            )
          )}

          {authUser && tab === 'profile' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-beige-200 p-4 bg-beige-100/60">
                <p className="text-xs uppercase tracking-wider font-black text-brand-700">Email</p>
                <p className="text-stone-700 font-semibold mt-1">{authUser?.email}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Nombre completo" className="px-4 py-3 rounded-xl border border-beige-200" />
                <input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="Teléfono" className="px-4 py-3 rounded-xl border border-beige-200" />
              </div>
              <button onClick={handleProfileSave} disabled={loading} className="px-4 py-3 rounded-xl bg-brand-700 text-white font-black disabled:opacity-50 inline-flex items-center gap-2"><IdCard size={16} /> Guardar perfil</button>
            </div>
          )}

          {authUser && tab === 'orders' && (
            <div className="space-y-3">
              {!orders.length && <p className="text-stone-500">Aún no tienes pedidos registrados.</p>}
              {orders.map((order) => (
                <button key={order.id} onClick={() => setSelectedOrder(order)} className="w-full text-left rounded-2xl border border-beige-200 px-4 py-3 hover:bg-beige-100/60">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black text-stone-800 inline-flex items-center gap-2"><ReceiptText size={15} /> Pedido #{order.id}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-brand-100 text-brand-700 font-black">{order.status}</span>
                  </div>
                  <p className="text-sm text-stone-600 mt-1">{order.product_name || 'Producto no asignado'} · {order.quantity} bandeja(s)</p>
                  <p className="text-sm text-stone-500">Total: {formatClp(order.total_price)} · Entrega: {order.delivery_schedule || 'Por confirmar'}</p>
                </button>
              ))}
              {selectedOrder && (
                <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
                  <p className="font-black text-brand-800">Detalle pedido #{selectedOrder.id}</p>
                  <p className="text-sm text-stone-700 mt-1">Producto: {selectedOrder.product_name || 'No asignado'}</p>
                  <p className="text-sm text-stone-700">Dirección: {selectedOrder.delivery_address || 'Sin dirección'}</p>
                  <p className="text-sm text-stone-700">Notas: {selectedOrder.notes || 'Sin notas'}</p>
                </div>
              )}
            </div>
          )}

          {authToken && tab === 'cart' && (
            <div className="space-y-4">
              {!cartItems.length && <p className="text-stone-500">Tu carrito está vacío.</p>}

              {!!cartItems.length && (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-beige-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-stone-900">{item.product_name}</p>
                          <p className="text-sm text-stone-600">{formatClp(item.price)}</p>
                        </div>
                        <button onClick={() => handleRemoveCartItem(item.id)} className="px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-black">Eliminar</button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleCartQuantity(item.id, Math.max(1, Number(item.quantity) - 1))} className="w-8 h-8 rounded-lg border border-beige-200">-</button>
                          <span className="min-w-8 text-center font-black">{item.quantity}</span>
                          <button onClick={() => handleCartQuantity(item.id, Number(item.quantity) + 1)} className="w-8 h-8 rounded-lg border border-beige-200">+</button>
                        </div>
                        <p className="font-black text-brand-800">{formatClp(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}

                  <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-700 font-semibold">Items</span>
                      <span className="font-black text-brand-800">{cartSummary.total_items}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-700 font-semibold">Subtotal</span>
                      <span className="font-black text-brand-800">{formatClp(cartSummary.subtotal)}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <select value={checkoutForm.delivery_schedule} onChange={(e) => setCheckoutForm((prev) => ({ ...prev, delivery_schedule: e.target.value }))} className="px-3 py-2 rounded-xl border border-beige-200">
                        <option value="09:00">Entrega 09:00</option>
                        <option value="14:00">Entrega 14:00</option>
                      </select>
                      <input value={checkoutForm.delivery_address} onChange={(e) => setCheckoutForm((prev) => ({ ...prev, delivery_address: e.target.value }))} placeholder="Dirección de entrega" className="px-3 py-2 rounded-xl border border-beige-200" />
                      <label className="md:col-span-2 inline-flex items-center gap-2 text-sm text-stone-700">
                        <input type="checkbox" checked={checkoutForm.use_subscription} onChange={(e) => setCheckoutForm((prev) => ({ ...prev, use_subscription: e.target.checked }))} />
                        Asociar checkout a mi suscripción activa
                      </label>
                      {checkoutForm.use_subscription && (
                        <input value={checkoutForm.subscription_id} onChange={(e) => setCheckoutForm((prev) => ({ ...prev, subscription_id: e.target.value }))} placeholder="ID Suscripción" className="md:col-span-2 px-3 py-2 rounded-xl border border-beige-200" />
                      )}
                      <textarea value={checkoutForm.notes} onChange={(e) => setCheckoutForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Notas de despacho" className="md:col-span-2 min-h-20 px-3 py-2 rounded-xl border border-beige-200" />
                    </div>

                    <button onClick={handleCheckout} disabled={checkoutLoading} className="w-full py-3 rounded-xl bg-brand-700 text-white font-black disabled:opacity-50">
                      {checkoutLoading ? 'Procesando checkout...' : 'Finalizar compra'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {authUser && tab === 'subscription' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select value={subscriptionForm.plan_code} onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, plan_code: e.target.value }))} className="px-4 py-3 rounded-xl border border-beige-200">
                  <option value="personal">Personal</option>
                  <option value="home_chef">Home Chef</option>
                  <option value="resto_pro">Resto-Pro</option>
                </select>
                <select value={subscriptionForm.egg_type} onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, egg_type: e.target.value }))} className="px-4 py-3 rounded-xl border border-beige-200">
                  <option value="blanco_extra">Blanco Extra</option>
                  <option value="gallina_libre">Gallina Libre</option>
                  <option value="omega_3">Omega 3</option>
                </select>
                <select value={subscriptionForm.status} onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, status: e.target.value }))} className="px-4 py-3 rounded-xl border border-beige-200">
                  <option value="active">Activa</option>
                  <option value="paused">Pausada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
                <input type="date" value={subscriptionForm.next_delivery_date || ''} onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, next_delivery_date: e.target.value }))} className="px-4 py-3 rounded-xl border border-beige-200" />
              </div>
              <textarea value={subscriptionForm.notes} onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Notas de suscripción" className="w-full min-h-24 px-4 py-3 rounded-xl border border-beige-200" />
              <button onClick={handleSaveSubscription} disabled={loading} className="px-4 py-3 rounded-xl bg-brand-700 text-white font-black disabled:opacity-50">{subscription ? 'Actualizar suscripción' : 'Crear suscripción'}</button>
              {subscription && <p className="text-sm text-stone-600">Plan actual: <strong>{subscription.plan_code}</strong> · Estado: <strong>{subscription.status}</strong> · Mensual: <strong>{formatClp(subscription.monthly_price)}</strong></p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPanel;


