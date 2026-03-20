const ProductDetailModal = ({ selectedProduct, onClose, onAddToCart, onProductWhatsApp }) => {
  if (!selectedProduct) return null;

  const nutrition = Array.isArray(selectedProduct.nutrition) ? selectedProduct.nutrition : [];
  const reviews = Array.isArray(selectedProduct.reviews) ? selectedProduct.reviews : [];
  const description = selectedProduct.extendedDescription || selectedProduct.description || 'Producto natural seleccionado.';
  const origin = selectedProduct.origin || 'Origen natural seleccionado';

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] overflow-hidden border border-stone-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-stone-100">
            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover min-h-[340px]" width={800} height={1000} loading="lazy" />
          </div>
          <div className="p-7">
            <h3 className="text-3xl font-serif font-black text-stone-900">{selectedProduct.name}</h3>
            <p className="text-stone-600 mt-4 leading-relaxed">{description}</p>
            <p className="text-brand-700 font-black mt-5">Origen: {origin}</p>

            <div className="mt-7">
              <h4 className="text-sm uppercase tracking-[0.2em] font-black text-brand-700 mb-2">Información nutricional</h4>
              {nutrition.length > 0 ? (
                <ul className="space-y-2 text-sm text-stone-600">
                  {nutrition.map((item) => <li key={item}>* {item}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-stone-500">Información nutricional disponible pronto.</p>
              )}
            </div>

            <div className="mt-7">
              <h4 className="text-sm uppercase tracking-[0.2em] font-black text-brand-700 mb-2">Reseñas</h4>
              {reviews.length > 0 ? (
                <ul className="space-y-2 text-sm text-stone-600">
                  {reviews.map((review) => (
                    <li key={review} className="rounded-xl border border-beige-200 bg-beige-100 px-3 py-2 italic">
                      "{review}"
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-stone-500">Reseñas disponibles pronto.</p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={() => onAddToCart(1, selectedProduct.id)} className="px-4 py-3 rounded-xl bg-brand-700 text-white font-black">Agregar al carrito</button>
              <button onClick={() => onProductWhatsApp(selectedProduct.name)} className="px-4 py-3 rounded-xl bg-yolk-500 text-brand-900 font-black">Pedir por WhatsApp</button>
              <button onClick={onClose} className="px-4 py-3 rounded-xl border border-stone-200 font-black text-stone-600">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
