import * as ordersService from './orders.service.js';

/**
 * Controlador para órdenes de compra.
 */

export const createOrder = async (req, res, next) => {
    try {
        const order = await ordersService.createOrder(req.user.id, req.body);
        res.status(201).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await ordersService.getUserOrders(req.user.id);
        res.status(200).json({ success: true, orders });
    } catch (error) {
        next(error);
    }
};

export const getAllOrders = async (req, res, next) => {
    try {
        const orders = await ordersService.getAllOrders();
        res.status(200).json({ success: true, orders });
    } catch (error) {
        next(error);
    }
};

export const updateOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await ordersService.updateOrderStatus(id, req.body);
        res.status(200).json({ 
            success: true, 
            message: `Pedido ${id} actualizado a ${result.status}` 
        });
    } catch (error) {
        next(error);
    }
};
