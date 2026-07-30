/**
 * Wrapper do `toast` do sonner que toca o som de notificação do sistema
 * sempre que um toast é exibido. Use no lugar de `import { toast } from "@/lib/toast"`.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast as sonnerToast } from "sonner";

import { tocarSomToast } from "./toast-som";

function comSom<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: any[]) => {
    tocarSomToast();
    return fn(...args);
  }) as T;
}

export const toast = Object.assign(comSom(sonnerToast as (...args: any[]) => any), {
  success: comSom(sonnerToast.success),
  error: comSom(sonnerToast.error),
  info: comSom(sonnerToast.info),
  warning: comSom(sonnerToast.warning),
  message: comSom(sonnerToast.message),
  custom: comSom(sonnerToast.custom),
  loading: comSom(sonnerToast.loading),
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
}) as unknown as typeof sonnerToast;
