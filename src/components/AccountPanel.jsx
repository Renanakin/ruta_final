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
import { PRICE_PLACEHOLDER } from '../lib/constants';

const AccountPanel = ({
  open,
  onClose,
  apiBaseUrl,
  authToken,
  authUser,
  onAuthSuccess,
  onTrackEvent,
  onDirectOrder,
  onLogout,
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
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [profileName, setProfileName] = useState(authUser?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(authUser?.phone || '');

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const fetchOrders = useCallback(() => {
    if (!authToken) return;
    const headers = authToken && authToken !== 'cookie' ? { Authorization: `Bearer ${authToken}` } : {};
    fetch(`${apiBaseUrl}/api/customer/orders`, { headers, credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]));
  }, [authToken, apiBaseUrl]);

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
  }, [open, tab, authToken, apiBaseUrl, fetchOrders]);

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
      onTrackEvent?.('create_account', { channel: 'account_panel' });
      setRegisterSuccess(true);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setMessage('Ingresa tu email.');
      return;
    }

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

  const tabButton = (key, label) => (
    <button
      onClick={() => setTab(key)}
      className={
        tab === key
          ? 'px-3 py-2 rounded-xl text-xs md:text-sm font-black transition-colors bg-brand-700 text-white'
          : 'px-3 py-2 rounded-xl text-xs md:text-sm font-black transition-colors bg-beige-100 text-stone-700 hover:bg-beige-200'
      }
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[95] bg-black/50 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] border border-beige-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-beige-200 px-6 py-4">
          <h3 className="text-2xl font-serif font-black text-brand-800">Área de Cliente</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-beige-100" aria-label="Cerrar panel">
            <X size={18} />
          </button>
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
              {tabButton('orders', 'Mis Pedidos')}
              {tabButton('subscription', 'Mi Suscripción')}
              <button onClick={onLogout} className="ml-auto px-3 py-2 rounded-xl bg-red-50 text-red-700 text-xs md:text-sm font-black inline-flex items-center gap-1">
                <LogOut size={14} /> Cerrar sesión
              </button>
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

          {!authUser && tab === 'register' && (
            registerSuccess ? (
              <div className="text-center space-y-5 py-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle size={32} className="text-emerald-500" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <p className="font-black text-stone-800 text-lg">¡Cuenta creada!</p>
                  <p className="text-stone-500 text-sm mt-1">
                    Te enviamos un correo a <strong className="text-stone-700">{registerEmail}</strong>.<br />
                    Haz clic en el link para activar tu cuenta.
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 font-semibold">
                  Revisa también tu carpeta de spam si no lo ves en unos minutos.
                </div>
                <button
                  onClick={() => { setTab('login'); setRegisterSuccess(false); setMessage(''); }}
                  className="w-full py-3 rounded-xl bg-brand-700 text-white font-black hover:bg-brand-800 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Ir a iniciar sesión
                </button>
              </div>
            ) : (
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

          {!authUser && tab === 'forgot' && (
            forgotSent ? (
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
                  Revisa también tu carpeta de spam si no lo ves en unos minutos.
                </div>
                <button
                  onClick={() => { setTab('login'); setForgotSent(false); setForgotEmail(''); setMessage(''); }}
                  className="w-full py-3 rounded-xl bg-brand-700 text-white font-black hover:bg-brand-800 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Volver al login
                </button>
              </div>
            ) : (
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
              <button onClick={handleProfileSave} disabled={loading} className="px-4 py-3 rounded-xl bg-brand-700 text-white font-black disabled:opacity-50 inline-flex items-center gap-2">
                <IdCard size={16} /> Guardar perfil
              </button>
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
                  <p className="text-sm text-stone-500">Total: {order.total_price ? `$${Number(order.total_price).toLocaleString('es-CL')}` : PRICE_PLACEHOLDER} · Entrega: {order.delivery_schedule || 'Por confirmar'}</p>
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

          {authUser && tab === 'cart' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 space-y-3">
                <p className="font-black text-brand-800">Pedidos online aún no habilitados</p>
                <p className="text-sm text-stone-700">
                  Por ahora todos los pedidos se coordinan por WhatsApp para confirmar stock, despacho y detalles.
                </p>
                <button
                  onClick={() => {
                    onDirectOrder?.('Consulta General');
                    onClose?.();
                  }}
                  className="w-full py-3 rounded-xl bg-brand-700 text-white font-black"
                >
                  Pedir por WhatsApp
                </button>
              </div>
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
              <button onClick={handleSaveSubscription} disabled={loading} className="px-4 py-3 rounded-xl bg-brand-700 text-white font-black disabled:opacity-50">
                {subscription ? 'Actualizar suscripción' : 'Crear suscripción'}
              </button>
              {subscription && (
                <p className="text-sm text-stone-600">
                  Plan actual: <strong>{subscription.plan_code}</strong> · Estado: <strong>{subscription.status}</strong> · Mensual: <strong>{subscription.monthly_price ? `$${Number(subscription.monthly_price).toLocaleString('es-CL')}` : PRICE_PLACEHOLDER}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPanel;
