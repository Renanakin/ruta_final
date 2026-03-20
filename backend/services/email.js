import { Resend } from 'resend';
import { logger } from '../src/lib/logger.js';

// Inicialización lazy: no falla al importar en tests sin API key
let _resend = null;
const getResend = () => {
    const key = process.env.RESEND_API_KEY;
    if (!key || key === 'test_key' || key === 'off') return null;

    if (!_resend) {
        _resend = new Resend(key);
    }
    return _resend;
};

const FROM = process.env.REPORT_EMAIL_FROM || 'noreply@rutadelnido.cl';

/**
 * Helper para loggear el email en lugar de enviarlo si Resend está desactivado.
 */
const logEmailInstead = (type, to, url) => {
    logger.info({ 
        bypass: true,
        type,
        to,
        url 
    }, '📧 EMAIL BYPASS (RESEND STANDBY)');
};

/**
 * Envia email de verificación de cuenta al cliente.
 * @param {string} to - Email del destinatario
 * @param {string} token - Token de verificación
 * @param {string} appBaseUrl - URL base de la app (ej: https://rutadelnido.cl)
 */
export async function sendVerificationEmail(to, token, appBaseUrl) {
  const url = `${appBaseUrl}/verify-email?token=${token}`;
  const resend = getResend();

  if (!resend) {
    logEmailInstead('VERIFICACIÓN DE CUENTA', to, url);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Verifica tu correo — Ruta del Nido',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#166534;">Verifica tu correo electrónico</h2>
        <p>Hola, gracias por registrarte en <strong>Ruta del Nido</strong>.</p>
        <p>Haz clic en el botón para verificar tu correo:</p>
        <a href="${url}"
           style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;
                  border-radius:6px;text-decoration:none;font-weight:bold;">
          Verificar correo
        </a>
        <p style="margin-top:24px;font-size:13px;color:#6b7280;">
          Si no puedes hacer clic, copia este enlace en tu navegador:<br/>
          <span style="color:#2563eb;">${url}</span>
        </p>
        <p style="font-size:12px;color:#9ca3af;">Este enlace expira en 24 horas.</p>
      </div>
    `,
  });
}

/**
 * Envia email de restablecimiento de contraseña CRM.
 * @param {string} to
 * @param {string} token
 * @param {string} appBaseUrl
 */
export async function sendPasswordResetEmail(to, token, appBaseUrl) {
  const url = `${appBaseUrl}/crm/reset-password?token=${token}`;
  const resend = getResend();

  if (!resend) {
    logEmailInstead('RESET PASSWORD (CRM)', to, url);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Restablecer contraseña — Ruta del Nido CRM',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#166534;">Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta CRM.</p>
        <a href="${url}"
           style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;
                  border-radius:6px;text-decoration:none;font-weight:bold;">
          Restablecer contraseña
        </a>
        <p style="margin-top:24px;font-size:13px;color:#6b7280;">
          Si no solicitaste esto, ignora este correo.<br/>
          Enlace: <span style="color:#2563eb;">${url}</span>
        </p>
        <p style="font-size:12px;color:#9ca3af;">Este enlace expira en 1 hora.</p>
      </div>
    `,
  });
}

/**
 * Envia email de restablecimiento de contraseña para clientes del sitio web.
 * El link apunta al frontend (/reset-password), NO al CRM.
 * @param {string} to
 * @param {string} token
 * @param {string} appBaseUrl
 */
export async function sendCustomerPasswordResetEmail(to, token, appBaseUrl) {
  const url = `${appBaseUrl}/reset-password?token=${token}`;
  const resend = getResend();

  if (!resend) {
    logEmailInstead('RESET PASSWORD (WEB)', to, url);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Restablecer contraseña — Ruta del Nido',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#166534;">¿Olvidaste tu contraseña?</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Ruta del Nido</strong>.</p>
        <a href="${url}"
           style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;
                  border-radius:6px;text-decoration:none;font-weight:bold;">
          Restablecer mi contraseña
        </a>
        <p style="margin-top:24px;font-size:13px;color:#6b7280;">
          Si no solicitaste esto, puedes ignorar este correo. Tu contraseña no cambiará.<br/>
          Enlace: <span style="color:#2563eb;">${url}</span>
        </p>
        <p style="font-size:12px;color:#9ca3af;">Este enlace expira en 1 hora.</p>
      </div>
    `,
  });
}

/**
 * Envia confirmación de pedido al cliente.
 * @param {string} to
 * @param {{ orderId: number, customerName: string, total: number, items: Array }} orderData
 */
export async function sendOrderConfirmationEmail(to, orderData) {
  const { orderId, customerName, total } = orderData;
  const resend = getResend();

  if (!resend) {
    logEmailInstead('CONFIRMACIÓN DE PEDIDO', to, `#${orderId} - Total: ${total}`);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Pedido #${orderId} confirmado — Ruta del Nido`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2 style="color:#166534;">¡Pedido recibido!</h2>
        <p>Hola ${customerName}, tu pedido <strong>#${orderId}</strong> fue registrado.</p>
        <p>Total: <strong>$${Number(total).toLocaleString('es-CL')}</strong></p>
        <p style="font-size:13px;color:#6b7280;">Te avisaremos cuando esté en camino.</p>
      </div>
    `,
  });
}
