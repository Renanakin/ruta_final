const SalesAssistantProductCards = ({ products, onOrder }) => {
  if (!products?.length) return null;

  return (
    <div className="grid grid-cols-1 gap-3">
      {products.map((product) => (
        <article key={product.id || product.name} className="rounded-[1.5rem] border border-stone-200 bg-white p-3 shadow-sm">
          <div className="flex gap-3">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="h-20 w-20 rounded-2xl object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black leading-tight text-stone-900">{product.name}</p>
              {product.reason && (
                <p className="mt-1 text-xs leading-relaxed text-stone-600">{product.reason}</p>
              )}
              {product.badge && (
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-brand-700">{product.badge}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => onOrder?.(product.name)}
            className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-brand-700 px-4 py-2.5 text-xs font-black uppercase tracking-[0.22em] text-white transition-colors hover:bg-brand-800"
          >
            Pedir este producto
          </button>
        </article>
      ))}
    </div>
  );
};

export default SalesAssistantProductCards;
