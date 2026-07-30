/**
 * Wrapper do `toast` do sonner que toca o som de notificação do sistema
 * sempre que um toast é exibido. Use no lugar de `import { toast } from "sonner"`.
 */

import { toast as sonnerToast } from "sonner";

import { tocarSomToast } from "./toast-som";

type Fn = (...args: never[]) => unknown;

function comSom<T extends Fn>(fn: T): T {
  return ((...args: Parameters<T>) => {
    tocarSomToast();
    return fn(...args);
  }) as T;
}

const base = sonnerToast as unknown as Fn & Record<string, Fn>;

export const toast = Object.assign(comSom(base.bind(sonnerToast)), {
  success: comSom(sonnerToast.success),
  error: comSom(sonnerToast.error),
  info: comSom(sonnerToast.info),
  warning: comSom(sonnerToast.warning),
  message: comSom(sonnerToast.message),
  custom: comSom(sonnerToast.custom),
  loading: comSom(sonnerToast.loading),
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
}) as typeof sonnerToast;
