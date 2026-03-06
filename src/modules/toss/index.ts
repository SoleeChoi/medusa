import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import TossService from "./provider"

export default ModuleProvider(Modules.PAYMENT, {
  services: [TossService as unknown as new (...args: any[]) => any],
})
