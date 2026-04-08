import { useState } from 'react';
import { KeyRound, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

/**
 * Pantalla de restablecimiento de contraseña.
 * Se muestra cuando el usuario llega desde el link del email (/reset-password?token=...).
 *
 * Props:
 *  - token: string — token extraído de la URL
 *  - apiBaseUrl: string — URL base del backend
 *  - onSuccess: () => void — callback al completar con éxito (redirige al login)
 */
const ResetPassword = ({ token, apiBaseUrl, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error'
    const [message, setMessage] = useState('');

    const strength = (() => {
        if (password.length === 0) return 0;
        let s = 0;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return s;
    })();

    const strengthLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][strength];
    const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500'][strength];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 8) {
            setStatus('error');
            setMessage('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        setLoading(true);
        setStatus(null);
        setMessage('');

        try {
            const res = await fetch(`${apiBaseUrl}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password, confirmPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                setStatus('error');
                setMessage(data.error || 'No se pudo restablecer la contraseña.');
            } else {
                setStatus('success');
                setMessage(data.message || '¡Contraseña restablecida! Ya puedes iniciar sesión.');
            }
        } catch {
            setStatus('error');
            setMessage('Error de conexión. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-beige-50 to-brand-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-700 text-white mb-4 shadow-lg">
                        <KeyRound size={28} />
                    </div>
                    <h1 className="text-2xl font-serif font-black text-brand-800">Nueva contraseña</h1>
                    <p className="text-stone-500 text-sm mt-1">Elige una contraseña segura para tu cuenta</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl border border-beige-200 shadow-xl p-8">
                    {status === 'success' ? (
                        /* ── Estado éxito ── */
                        <div className="text-center space-y-5">
                            <div className="flex justify-center">
                                <CheckCircle size={56} className="text-emerald-500" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="font-black text-stone-800 text-lg">{message}</p>
                                <p className="text-stone-500 text-sm mt-1">Ahora puedes acceder con tu nueva contraseña.</p>
                            </div>
                            <button
                                onClick={onSuccess}
                                className="w-full py-3 rounded-xl bg-brand-700 text-white font-black hover:bg-brand-800 transition-colors inline-flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={16} />
                                Ir a iniciar sesión
                            </button>
                        </div>
                    ) : (
                        /* ── Formulario ── */
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {status === 'error' && (
                                <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                                    <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                                    <p className="text-sm font-semibold text-red-700">{message}</p>
                                </div>
                            )}

                            {/* Campo contraseña */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-stone-600">
                                    Nueva contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        id="reset-password"
                                        type={showPass ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mínimo 8 caracteres"
                                        required
                                        className="w-full px-4 py-3 pr-11 rounded-xl border border-beige-200 bg-beige-50 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all text-stone-800 placeholder-stone-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                        aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    >
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Barra de fortaleza */}
                                {password.length > 0 && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-stone-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className={`text-xs font-semibold ${
                                            strength <= 1 ? 'text-red-500' :
                                            strength === 2 ? 'text-amber-500' :
                                            strength === 3 ? 'text-blue-500' : 'text-emerald-500'
                                        }`}>
                                            Contraseña {strengthLabel}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirmar contraseña */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-stone-600">
                                    Confirmar contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        id="reset-confirm-password"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repite tu nueva contraseña"
                                        required
                                        className={`w-full px-4 py-3 pr-11 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all text-stone-800 placeholder-stone-400 bg-beige-50 ${
                                            confirmPassword && password !== confirmPassword
                                                ? 'border-red-300'
                                                : confirmPassword && password === confirmPassword
                                                ? 'border-emerald-300'
                                                : 'border-beige-200'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                        aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    >
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-xs text-red-500 font-semibold">Las contraseñas no coinciden</p>
                                )}
                                {confirmPassword && password === confirmPassword && (
                                    <p className="text-xs text-emerald-500 font-semibold">✓ Contraseñas coinciden</p>
                                )}
                            </div>

                            {/* Botón enviar */}
                            <button
                                type="submit"
                                disabled={loading || !password || !confirmPassword}
                                className="w-full py-3.5 rounded-xl bg-brand-700 text-white font-black text-base hover:bg-brand-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                                {loading ? (
                                    <><Loader2 size={18} className="animate-spin" /> Restableciendo...</>
                                ) : (
                                    <><KeyRound size={18} /> Restablecer contraseña</>
                                )}
                            </button>

                            {/* Link volver */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={onSuccess}
                                    className="text-sm text-stone-500 hover:text-brand-700 font-semibold transition-colors inline-flex items-center gap-1"
                                >
                                    <ArrowLeft size={14} />
                                    Volver al inicio
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-stone-400 mt-6">
                    Ruta del Nido · Productos del campo a tu mesa
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
