# Sprint 1 — Optimización de Conversión
**Fecha:** 2026-04-04  
**Commit:** `f3bf5b9` — `feat(conversion): sprint 1 - hero, values, subscription, alchemist, footer cta`

---

## Objetivo
Aumentar la intención de compra y reducir la fricción cognitiva en el homepage, alineando el copy con el comportamiento real del usuario (ordenes por WhatsApp, sin carrito).

---

## Archivos modificados

### 1. `src/components/HeroSection.jsx`
- **Badge de urgencia:** "Pedidos de la semana abiertos — stock limitado por origen"
- **H1 reescrito:** "Huevos y productos de campo con sabor real a tu mesa"
- **Subtítulo:** añade escasez, despacho local y contraste con supermercado
- **Orden de CTAs invertido:** "Pedir por WhatsApp ahora" (primaria) → "Ver productos de esta semana" (secundaria)
- **Badges reescritos:** "Sin lógica industrial / Despacho local Santiago / Atención directa por WhatsApp"
- **Import:** `AlertCircle` agregado, `Sparkles` eliminado

### 2. `src/components/ValuesSection.jsx`
- **Título:** "No es supermercado. Es origen, selección y sabor real."
- **Subtítulo descriptivo** añadido
- **4 tarjetas de valor reescritas** con beneficios concretos:
  - "Más sabor, mejor textura"
  - "Origen claro, sin industria"
  - "Atención directa"
  - "Fresco y a tiempo"
- **Iconos actualizados:** `Leaf, MapPin, MessageCircle, Zap` (lucide-react)

### 3. `src/components/SubscriptionSection.jsx`
- **Badge:** "Cupos limitados cada semana" (con ícono `Clock`)
- **Título:** "Asegura tu mesa cada mes."
- **Párrafo de escasez** sobre cupos limitados añadido
- **CTA:** "Quiero asegurar mi cupo"
- **Snippet de prueba social** añadido
- **Import:** `Lock` eliminado, `Clock` agregado

### 4. `src/components/AlchemistTeaserSection.jsx`
- **Badge:** "Recetas Espaciales"
- **Título:** "Deja que El Alquimista inspire tu mesa."
- **Descripción reescrita** — enfoque en descubrimiento y recetas (no comercial)
- **CTA:** "Explorar recetas espaciales"
- **Subtexto:** "Experiencia de descubrimiento • Productos reales del catálogo"

### 5. `src/components/Footer.jsx`
- **Bloque CTA de cierre** añadido antes de `VisitorCounter`:
  - Título: "Haz tu pedido hoy."
  - Subtítulo: beneficio + facilidad + cercanía
  - Botón: "Quiero pedir ahora" → link WhatsApp
- **Imports añadidos:** `MessageSquare`, `buildWhatsAppContextUrl`

---

## Qué NO se tocó (Sprint 2 pendiente)
- `CatalogSection` — beneficios por categoría
- `SocialProof` — microprueba social distribuida cerca de CTAs
- Bloque de suscripción completo
- Bloque de confianza logística

---

## Estado del push
- Commit local: ✅  
- Push a `origin` (`git@github-renanakin:Renanakin/1_ruta.git`): ❌ SSH key no registrada en GitHub  
- Push pendiente a: `https://github.com/Renanakin/ruta_final.git`
