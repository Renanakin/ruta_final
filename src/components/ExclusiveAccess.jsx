import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame } from 'lucide-react';
import { cn } from '../lib/constants';

export default function ExclusiveAccess({
  validateLogic,
  onUnlockSuccess
}) {
  const [accessCode, setAccessCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | focus | validating | error | success
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (status === 'validating' || status === 'success') return;

    setStatus('validating');
    setErrorMsg('');

    try {
      const isValid = await validateLogic(accessCode);

      if (isValid) {
        setStatus('success');
        setTimeout(() => {
          if (onUnlockSuccess) onUnlockSuccess(accessCode);
        }, 1200);
      } else {
        setStatus('error');
        setErrorMsg('La llave no pertenece a este santuario.');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch {
      setStatus('error');
      setErrorMsg('La niebla oscurece la conexión.');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const cardVariants = {
    idle: { scale: 1, y: 0, boxShadow: "0px 0px 80px rgba(244,199,57,0.15), inset 0px 0px 40px rgba(244,199,57,0.05)" },
    focus: { scale: 1.01, y: -2, boxShadow: "0px 0px 120px rgba(244,199,57,0.25), inset 0px 0px 60px rgba(244,199,57,0.1)" },
    validating: { scale: 0.99, opacity: 0.9, filter: "blur(2px)" },
    error: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 },
      borderColor: "#B45309",
    },
    success: { scale: 1.05, opacity: 0, filter: "blur(20px)", transition: { duration: 1 } }
  };

  const glowVariants = {
    idle: { opacity: 0.5, scale: 1 },
    focus: { opacity: 0.8, scale: 1.1 },
    validating: { opacity: [0.8, 0.4, 0.8], transition: { repeat: Infinity, duration: 1 } },
    error: { opacity: 0.2 },
    success: { opacity: 0, scale: 2 }
  };

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden bg-transparent py-20 px-4">
      
      {/* CAPA 1: Luz Viva del Fogón (Fuego inmenso posterior) */}
      <motion.div
        variants={glowVariants}
        initial="idle"
        animate={status}
        className="absolute w-[80vw] max-w-[50rem] h-[50rem] bg-gradient-to-t from-orange-600/20 via-yolk-500/20 to-transparent rounded-full blur-[120px] pointer-events-none"
      />

      {/* CAPA 2: Lente de Cristal Principal (Glassmorphism Expansion / Lienzo Ancho) */}
      <motion.div
        variants={cardVariants}
        initial="idle"
        animate={status}
        className={cn(
          "relative z-10 w-full max-w-[55rem] p-10 md:p-20 rounded-[3rem] md:rounded-[4rem] backdrop-blur-[30px] bg-stone-900/40 border-2 border-yolk-500/20",
          status === 'error' && "border-red-900/50 bg-stone-900/80"
        )}
      >
        <div className="flex flex-col items-center text-center space-y-12 w-full">
          
          {/* El Sello Flotante Luminoso (Emblema Ruta del Nido) */}
          <motion.div 
             animate={{ y: [-8, 8, -8] }} 
             transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
             className="relative w-36 h-36 mx-auto group -mt-28 md:-mt-36"
          >
             {/* Destello del Nido */}
             <div className="absolute inset-0 bg-gradient-to-b from-yolk-400 to-orange-500 rounded-full blur-[40px] opacity-70 group-hover:opacity-100 transition-opacity duration-1000"></div>
             <div className="relative w-full h-full rounded-full flex items-center justify-center bg-stone-950/50 p-4 border-2 border-yolk-400/30 shadow-[0_0_50px_rgba(244,199,57,0.4)]">
               <img src="/images/RUTA_DEL_NIDO_EMBLEM.svg" alt="Sello Alquimista" className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(244,199,57,0.9)]" />
             </div>
          </motion.div>

          {/* Textos Monumentales y Storytelling */}
          <div className="space-y-8 max-w-4xl mx-auto w-full">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif text-stone-100 tracking-tight font-black leading-none drop-shadow-[0_0_30px_rgba(244,199,57,0.4)]">
              Ruta del Nido
              <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-yolk-200 via-yolk-400 to-amber-600 block mt-2 filter drop-shadow-[0_0_20px_rgba(244,199,57,0.6)]">
                El Alquimista
              </span>
            </h2>

            {/* El Relato (Storytelling Legible e Invitador) */}
            <div className="relative mt-10 p-8 rounded-3xl bg-stone-950/30 border border-white/5 shadow-inner">
               <p className="text-lg md:text-2xl text-stone-200 font-serif leading-relaxed px-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                 No estás ante una receta más, estás en el santuario de nuestra cocina artesanal chilena. 
                 Una bóveda donde nuestras maravillas del mar, exquisitos quesos sureños y <strong className="text-yolk-400 font-bold">materia prima de excelencia</strong> convergen.
                 <br/><br/>
                 <span className="text-white/80 italic">Ingresa tu sello, cuéntanos qué tienes en tu mesa, y nosotros encenderemos el fogón sagrado.</span>
               </p>
            </div>
          </div>

          {/* El Input Luminoso y Seductor */}
          <form onSubmit={handleVerify} className="w-full pt-6 max-w-2xl mx-auto">
            <div className="relative group">
              {/* Resplandor trasero del input */}
              <div className="absolute -inset-1 bg-gradient-to-r from-yolk-600 via-amber-500 to-orange-600 rounded-[2.5rem] blur opacity-40 group-focus-within:opacity-80 transition duration-1000"></div>
              
              <input
                type="password"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                onFocus={() => setStatus('focus')}
                onBlur={() => setStatus('idle')}
                placeholder="Revela tu llave aquí..."
                disabled={status === 'validating' || status === 'success'}
                className={cn(
                  "relative w-full px-8 py-6 rounded-[2.5rem] bg-stone-950/80 text-yolk-100 font-serif text-2xl md:text-3xl text-center outline-none transition-all duration-500 shadow-inner",
                  "border-2 border-yolk-500/40 focus:border-yolk-300 focus:bg-stone-900",
                  "placeholder:text-stone-500 placeholder:italic",
                  status === 'error' && "text-red-400 border-red-800/60 bg-red-950/40",
                  (status === 'validating' || status === 'success') && "opacity-50 cursor-not-allowed"
                )}
              />
              
              <button
                type="submit"
                disabled={status === 'validating' || status === 'success'}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_0_20px_rgba(244,199,57,0.5)]",
                  "bg-gradient-to-br from-yolk-300 to-amber-600 text-stone-900 hover:scale-110 active:scale-95",
                  "disabled:opacity-0 disabled:scale-50 disabled:cursor-not-allowed pointer-events-auto",
                  status === 'error' && "hidden"
                )}
              >
                {status === 'validating' ? <Flame className="w-6 h-6 animate-pulse" /> : <Sparkles className="w-6 h-6" />}
              </button>
            </div>

            <div className="h-8 flex items-center justify-center mt-4">
              <AnimatePresence>
                {status === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="text-sm md:text-base text-red-400 font-bold tracking-widest uppercase bg-red-950/50 px-6 py-2 rounded-full border border-red-900/50"
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>

        </div>
      </motion.div>
    </div>
  );
}
