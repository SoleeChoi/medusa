import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { completeCartWorkflow } from "@medusajs/medusa/core-flows"

const getString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

/**
 * Toss resultCallback handler (backup mechanism).
 *
 * Primary flow: storefront calls POST /store/carts/{id}/complete
 * which triggers authorizePayment → Toss execute API.
 *
 * This endpoint handles cases where the storefront flow didn't
 * complete (e.g., user closed popup before postMessage).
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const query = (req.query ?? {}) as Record<string, unknown>
  const body = (req.body ?? {}) as Record<string, unknown>
  /** 
   * body example
    {
        status: 'PAY_APPROVED',
        payToken: 'GZ0zSAV3GMAse7dJo4g5c0',
        orderNo: 'medusa_1772806709595',
        paidTs: '2026-03-06 23:18:29',
        payMethod: 'CARD',
        amount: '40000',
        discountedAmount: '0',
        paidAmount: '40000',
        paidPoint: '0'
    }
   */
  const sessionId = getString(query.sessionId)

  if (!sessionId) {
    return res.status(400).json({
      ok: false,
      message: "Missing sessionId in callback request.",
    })
  }

  const status = getString(body.status)
  if (status !== "PAY_APPROVED") {
    return res.status(200).json({
      ok: true,
      message: `Ignored callback with status=${status}. Only PAY_APPROVED triggers order completion.`,
    })
  }

  const queryService = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: sessions } = await queryService.graph({
    entity: "payment_session",
    fields: ["id", "payment_collection_id"],
    filters: { id: sessionId },
  })
  const paymentCollectionId = sessions?.[0]?.payment_collection_id as
    | string
    | undefined

  if (!paymentCollectionId) {
    return res.status(404).json({
      ok: false,
      message: `No payment_session found for sessionId=${sessionId}.`,
    })
  }

  const { data: cartLinks } = await queryService.graph({
    entity: "cart_payment_collection",
    fields: ["cart_id"],
    filters: { payment_collection_id: paymentCollectionId },
  })
  const cartId = cartLinks?.[0]?.cart_id as string | undefined

  if (!cartId) {
    return res.status(404).json({
      ok: false,
      message: `No cart mapped to payment_collection_id=${paymentCollectionId}.`,
    })
  }

  try {
    const { result } = await completeCartWorkflow(req.scope).run({
      input: { id: cartId },
    })

    return res.status(200).json({
      ok: true,
      session_id: sessionId,
      cart_id: cartId,
      order_id: result?.id ?? null,
    })
  } catch (error) {
    const message = error instanceof MedusaError ? error.message : String(error)
    return res.status(422).json({
      ok: false,
      message: `Failed to complete cart: ${message}`,
    })
  }
}
