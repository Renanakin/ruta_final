import React from 'react';
import { Search, Clock, CheckCircle, Package, XCircle } from 'lucide-react';
import clsx from 'clsx';

const CRMOrderManager = ({
  search,
  setSearch,
  filter,
  setFilter,
  filteredOrders,
  updateStatus,
  getScheduleBadge,
  getStatusColor,
  crmRole
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="p-6 border-b border-stone-100 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-stone-50 rounded-xl border-none outline-none font-medium"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'nuevo', 'confirmado', 'entregado', 'cancelado'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-4 py-2 rounded-xl font-bold text-sm transition-all",
                filter === f ? "bg-brand-700 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              )}
            >
              {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50">
            <tr>
              <th className="text-left p-4 font-black text-stone-600 text-sm">ID</th>
              <th className="text-left p-4 font-black text-stone-600 text-sm">Cliente</th>
              <th className="text-left p-4 font-black text-stone-600 text-sm">Producto</th>
              <th className="text-left p-4 font-black text-stone-600 text-sm">Cantidad</th>
              <th className="text-left p-4 font-black text-stone-600 text-sm">Total</th>
              <th className="text-left p-4 font-black text-stone-600 text-sm">Entrega</th>
              <th className="text-left p-4 font-black text-stone-600 text-sm">Origen</th>
              <th className="text-left p-4 font-black text-stone-600 text-sm">Estado</th>
              <th className="text-left p-4 font-black text-stone-600 text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!filteredOrders.length && (
              <tr className="border-t border-stone-100">
                <td className="p-8 text-center text-stone-500 font-medium" colSpan="9">
                  No hay pedidos para los filtros seleccionados.
                </td>
              </tr>
            )}
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-t border-stone-100 hover:bg-stone-50">
                <td className="p-4 font-black text-stone-900">#{order.id}</td>
                <td className="p-4">
                  <div className="font-bold text-stone-900">{order.customer_name}</div>
                  <div className="text-sm text-stone-500">{order.customer_phone}</div>
                </td>
                <td className="p-4">
                  <div className="font-bold text-stone-900">{order.product_name}</div>
                  {order.badge && (
                    <span className="text-xs bg-yolk-100 text-yolk-700 px-2 py-0.5 rounded-full">{order.badge}</span>
                  )}
                </td>
                <td className="p-4 font-medium text-stone-700">{order.quantity}</td>
                <td className="p-4 font-black text-stone-900">${Number(order.total).toLocaleString('es-CL')}</td>
                <td className="p-4">
                  {order.delivery_schedule ? (
                    <span className={clsx("px-3 py-1 rounded-full text-xs font-bold", getScheduleBadge(order.delivery_schedule))}>
                      <Clock size={12} className="inline mr-1" />
                      {order.delivery_schedule}
                    </span>
                  ) : null}
                  {order.delivery_address ? <div className="text-xs text-stone-500 mt-1">{order.delivery_address}</div> : null}
                </td>
                <td className="p-4">
                  <span className={clsx("px-2 py-1 rounded text-xs font-bold", order.source === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>
                    {order.source}
                  </span>
                  {order.local_name && (
                    <div className="text-[11px] text-stone-500 font-semibold mt-1">{order.local_name}</div>
                  )}
                </td>
                <td className="p-4">
                  <span className={clsx("px-3 py-1 rounded-full text-xs font-bold", getStatusColor(order.status))}>
                    {order.status}
                  </span>
                  {order.status === 'cancelado' && order.cancellation_reason && (
                    <div className="text-[11px] text-red-700 font-semibold mt-1">Motivo: {order.cancellation_reason}</div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {order.status === 'nuevo' && (
                      <button onClick={() => updateStatus(order.id, 'confirmado')} className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {order.status === 'confirmado' && (
                      <button onClick={() => updateStatus(order.id, 'entregado')} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                        <Package size={16} />
                      </button>
                    )}
                    {(order.status === 'nuevo' || order.status === 'confirmado') && crmRole === 'admin' && (
                      <button onClick={() => updateStatus(order.id, 'cancelado')} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CRMOrderManager;
