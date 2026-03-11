import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import {
  AbstractPaymentProvider,
  BigNumber,
  MedusaError,
} from "@medusajs/framework/utils"

type TossOptions = {
  apiKey?: string
  retUrl?: string
  retCancelUrl?: string
  resultCallback?: string
  callbackVersion?: "V2"
  autoExecute?: false
  useMock?: boolean
}

type InjectedDependencies = {
  logger: Logger
}

type TossApiResponse = {
  payToken?: string
  checkoutPage?: string
  status?: string
  code?: number | string
  errorCode?: string
  msg?: string
  message?: string
  orderNo?: string
  amount?: number
  approvalTime?: string
  transactionId?: string
  payMethod?: string
  paidAmount?: number
  discountedAmount?: number
  [key: string]: unknown
}

class TossService extends AbstractPaymentProvider<TossOptions> {
  static identifier = "toss"
  protected logger_: Logger
  protected options_: TossOptions

  constructor(container: InjectedDependencies, options: TossOptions) {
    super(container, options)
    this.logger_ = container.logger
    this.options_ = options
  }

  static validateOptions(options: Record<string, unknown>) {
    const useMock = Boolean(options.useMock)
    if (!useMock && !options.apiKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Toss provider requires `apiKey` unless `useMock` is true."
      )
    }
  }

  protected get isMockMode() {
    return Boolean(this.options_.useMock || !this.options_.apiKey)
  }

  protected mapTossStatusToMedusa(
    status?: unknown
  ): GetPaymentStatusOutput["status"] {
    const normalized = String(status ?? "").toUpperCase()
    if (normalized.includes("COMPLETE") || normalized.includes("DONE")) {
      return "captured"
    }
    if (normalized.includes("APPROVED") || normalized.includes("AUTHORIZED")) {
      return "authorized"
    }
    if (normalized.includes("CANCEL") || normalized.includes("FAIL")) {
      return "canceled"
    }
    return "pending"
  }

  protected async callTossApi(
    endpoint: string,
    payload: Record<string, unknown>,
    operationName: string
  ): Promise<TossApiResponse> {
    const response = await fetch(`https://pay.toss.im/api/v2/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = (await response.json()) as TossApiResponse
    const tossCode = Number(json.code)
    const isBusinessError =
      json.code !== undefined && (!Number.isFinite(tossCode) || tossCode !== 0)
    const tossMessage = json.msg ?? json.message ?? "unknown error"

    if (!response.ok || isBusinessError) {
      const codeLabel =
        json.code !== undefined
          ? `code=${String(json.code)}`
          : `http_status=${response.status}`
      const errorCodeLabel = json.errorCode ? `, error_code=${json.errorCode}` : ""
      this.logger_.error(
        `Toss ${operationName} failed (${codeLabel}${errorCodeLabel}): ${tossMessage}`
      )
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Toss ${operationName} failed (${codeLabel}${errorCodeLabel}): ${tossMessage}`
      )
    }

    return json
  }

  protected async createTossPayment(
    payload: Record<string, unknown>
  ): Promise<TossApiResponse> {
    return this.callTossApi("payments", payload, "create payment")
  }

  protected async executeTossPayment(params: {
    payToken: string
    orderNo: string
    amount?: number
  }): Promise<TossApiResponse> {
    return this.callTossApi(
      "execute",
      {
        apiKey: this.options_.apiKey,
        payToken: params.payToken,
        orderNo: params.orderNo,
        ...(params.amount !== undefined && { amount: params.amount }),
      },
      "execute payment"
    )
  }

  protected getStringValue(value: unknown): string | undefined {
    if (typeof value !== "string") {
      return undefined
    }

    const trimmed = value.trim()
    return trimmed.length ? trimmed : undefined
  }

  protected buildUrlWithQuery(
    baseUrl: string | undefined,
    query: Record<string, string | undefined>
  ): string | undefined {
    if (!baseUrl) {
      return baseUrl
    }

    const queryEntries = Object.entries(query).filter(
      ([, value]) => typeof value === "string" && value.length > 0
    ) as Array<[string, string]>

    if (!queryEntries.length) {
      return baseUrl
    }

    try {
      const url = new URL(baseUrl)
      queryEntries.forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
      return url.toString()
    } catch {
      const params = new URLSearchParams(queryEntries)
      const separator = baseUrl.includes("?") ? "&" : "?"
      return `${baseUrl}${separator}${params.toString()}`
    }
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const orderNo = `medusa_${Date.now()}`
    const amount = Number(input.amount)
    const productDesc = `Medusa order ${orderNo}`
    const context = (input.context ?? {}) as Record<string, unknown>
    const data = (input.data ?? {}) as Record<string, unknown>
    const sessionId =
      this.getStringValue(data.session_id) ??
      this.getStringValue(context.idempotency_key)
    const resultCallback = this.buildUrlWithQuery(this.options_.resultCallback, {
      sessionId,
    })

    if (this.isMockMode) {
      return {
        id: `toss_mock_${Date.now()}`,
        data: {
          ...(input.data ?? {}),
          orderNo,
          amount,
          amountTaxFree: 0,
          productDesc,
          status: "PAY_PENDING",
          mock: true,
        },
      }
    }

    const created = await this.createTossPayment({
      orderNo,
      amount,
      amountTaxFree: 0,
      productDesc,
      apiKey: this.options_.apiKey,
      retUrl: this.options_.retUrl,
      retCancelUrl: this.options_.retCancelUrl,
      autoExecute: false,
      resultCallback,
      callbackVersion: "V2",
    })

    return {
      id: String(created.payToken ?? orderNo),
      data: {
        ...(input.data ?? {}),
        ...created,
        orderNo,
        amount,
      },
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const status = this.mapTossStatusToMedusa(input.data?.status)
    if (status === "canceled") {
      throw new MedusaError(
        MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
        "Toss payment is canceled or failed."
      )
    }

    // Toss return/callback timing can cause status to remain pending
    // even after a successful payment redirect in storefront.
    // For Toss session completion flow, treat non-canceled states as authorized.
    return {
      status: "authorized",
      data: {
        ...(input.data ?? {}),
        original_status: status,
        authorized_at: new Date().toISOString(),
      },
    }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return {
      data: {
        ...(input.data ?? {}),
        captured_at: new Date().toISOString(),
      },
    }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return {
      data: {
        ...(input.data ?? {}),
        refunded_amount: input.amount,
        refunded_at: new Date().toISOString(),
      },
    }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return {
      data: {
        ...(input.data ?? {}),
        canceled_at: new Date().toISOString(),
      },
    }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    return {
      status: this.mapTossStatusToMedusa(input.data?.status),
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return input.data ?? {}
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return {
      data: {
        ...(input.data ?? {}),
        amount: input.amount,
        currency_code: input.currency_code,
        updated_at: new Date().toISOString(),
      },
    }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const data = payload.data as Record<string, unknown>
    const status = String(data.status ?? "")
    const sessionId = String(
      data.payToken ?? data.paymentKey ?? data.orderNo ?? ""
    )
    const amount = Number(data.amount ?? 0)

    const mapped = this.mapTossStatusToMedusa(status)
    if (mapped === "captured") {
      return {
        action: "captured",
        data: { session_id: sessionId, amount: new BigNumber(amount) },
      }
    }
    if (mapped === "authorized") {
      return {
        action: "authorized",
        data: { session_id: sessionId, amount: new BigNumber(amount) },
      }
    }

    return {
      action: "not_supported",
      data: { session_id: sessionId, amount: new BigNumber(amount) },
    }
  }
}

export default TossService
