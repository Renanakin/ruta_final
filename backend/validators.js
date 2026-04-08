import { z } from 'zod';

export const RegisterSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email invalido').max(255),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres').max(128),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Telefono invalido').optional().nullable().or(z.literal('')),
});

export const LoginSchema = z.object({
  email: z.string().email('Email invalido').max(255),
  password: z.string().min(1, 'La contrasena es requerida').max(128),
});

export const EmailSchema = z.object({
  email: z.string().email('Email invalido').max(255),
});

export const PasswordResetSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres').max(128),
  confirmPassword: z.string().min(8, 'Debe confirmar la contrasena').max(128),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: 'custom',
      path: ['confirmPassword'],
      message: 'Las contrasenas no coinciden',
    });
  }
});

export const CrmLoginSchema = z.object({
  email: z.string().email('Email invalido').max(255),
  password: z.string().min(1, 'La contrasena es requerida').max(128),
});

export const CrmUserCreateSchema = z.object({
  email: z.string().email('Email invalido').max(255),
  password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres').max(128),
  role: z.enum(['admin', 'operador']).optional(),
  local_ids: z.array(z.number().int().positive()).optional(),
  is_active: z.boolean().optional(),
});

export const CrmPasswordResetSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  new_password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres').max(128),
});

export const OrderCreateSchema = z.object({
  total_price: z.number().positive('El total debe ser mayor a 0'),
  delivery_address: z.string().min(5, 'La direccion debe tener al menos 5 caracteres').max(300),
  delivery_schedule: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const OrderUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'dispatched', 'delivered', 'cancelled']),
  cancellation_reason: z.string().max(500).optional().nullable(),
});

export const CartItemSchema = z.object({
  product_id: z.number().int().positive('product_id debe ser un entero positivo'),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1').max(1000),
});

export const CartPatchSchema = z.object({
  quantity: z.number().int().min(0, 'La cantidad no puede ser negativa').max(1000),
});

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive('El id debe ser un entero positivo'),
});

export const CheckoutSchema = z.object({
  delivery_address: z.string().min(5, 'La direccion debe tener al menos 5 caracteres').max(300),
  delivery_schedule: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const ProfileUpdateSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Telefono invalido').optional().nullable().or(z.literal('')),
});

export const SubscriptionCreateSchema = z.object({
  plan_code: z.string().min(1).max(50),
  egg_type: z.string().min(1).max(50),
  status: z.enum(['active', 'paused', 'cancelled']).default('active'),
  next_delivery_date: z.string().max(50).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const NewsletterSubscribeSchema = z.object({
  email: z.string().email('Email invalido').max(255),
  source: z.string().max(50).optional().nullable(),
  interested_product: z.string().max(120).optional().nullable(),
});

export const ChefVerifySchema = z.object({
  code: z.string().min(1, 'Debes enviar un codigo'),
});

export const ChefQuerySchema = z.object({
  query: z.string().min(1, 'La consulta es requerida').max(1000, 'La consulta es demasiado larga'),
  code: z.string().max(120).optional(),
});

const SalesAssistantSessionContextSchema = z.object({
  topic: z.enum(['recommendation', 'catalog', 'comparison', 'handoff', 'unknown']).optional().nullable(),
  category: z.string().min(2).max(80).optional().nullable(),
  currentProductId: z.number().int().positive().optional().nullable(),
  comparedProductIds: z.array(z.number().int().positive()).max(4).optional(),
  lastIntent: z.string().min(2).max(60).optional().nullable(),
  lastUserMessage: z.string().min(1).max(600).optional().nullable(),
});

const SalesAssistantQuickReplyPayloadSchema = z.object({
  prompt: z.string().min(2).max(120).optional(),
  topic: z.enum(['recommendation', 'catalog', 'comparison', 'handoff', 'unknown']).optional().nullable(),
  category: z.string().min(2).max(80).optional().nullable(),
  currentProductId: z.number().int().positive().optional().nullable(),
  comparedProductIds: z.array(z.number().int().positive()).max(4).optional(),
  highlightHuman: z.boolean().optional(),
}).partial();

const SalesAssistantQuickReplySchema = z.object({
  label: z.string().min(2).max(80),
  intent: z.string().min(2).max(60),
  payload: SalesAssistantQuickReplyPayloadSchema.optional(),
});

export const SalesAssistantMessageSchema = z.object({
  message: z.string().min(1, 'El mensaje es requerido').max(600, 'El mensaje es demasiado largo'),
  pagePath: z.string().max(140).optional(),
  locale: z.string().max(10).optional(),
  currentProductId: z.number().int().positive().optional().nullable(),
  recentProductIds: z.array(z.number().int().positive()).max(6).optional(),
  sessionContext: SalesAssistantSessionContextSchema.optional().nullable(),
  quickReply: SalesAssistantQuickReplySchema.optional().nullable(),
});

export const AiOrderSchema = z.object({
  message: z.string().min(1, 'El mensaje es requerido').max(1000),
});
