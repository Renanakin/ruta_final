import { buildWhatsAppContextUrl } from '../lib/constants';

const WhatsAppFloat = () => (
  <a
    href={buildWhatsAppContextUrl('hacer un pedido')}
    target="_blank"
    rel="noreferrer"
    className="fixed right-5 bottom-5 z-[9999] group"
    aria-label="Pedir por WhatsApp"
  >
    <span className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-2 rounded-xl bg-brand-800 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
      Pide por WhatsApp ahora →
    </span>
    <span className="w-14 h-14 rounded-full bg-[#25D366] shadow-2xl flex items-center justify-center border-4 border-white">
      <svg viewBox="0 0 32 32" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 3.2C9 3.2 3.3 8.8 3.3 15.8c0 2.2.6 4.3 1.7 6.1L3 28.8l7-1.9c1.7.9 3.7 1.4 5.8 1.4 7 0 12.7-5.6 12.7-12.6S23 3.2 16 3.2Zm0 22.9c-1.8 0-3.5-.5-5-1.3l-.4-.2-4.1 1.1 1.1-4-.3-.4c-.9-1.5-1.4-3.2-1.4-5.1 0-5.5 4.5-10 10.1-10 5.6 0 10.1 4.5 10.1 10 0 5.5-4.5 10-10.1 10Zm5.5-7.5c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.5-2-.2-.3 0-.4.1-.5.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-1-2.2-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3.1 4.8 4.3.7.3 1.3.5 1.8.6.8.2 1.5.1 2 .1.6-.1 1.8-.7 2.1-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3Z" fill="white" />
      </svg>
    </span>
  </a>
);

export default WhatsAppFloat;
