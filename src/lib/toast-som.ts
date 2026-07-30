/**
 * Som dos toasts do sistema (arquivo MP3 hospedado na CDN).
 *
 * Segue o mesmo mecanismo do som do sininho: o áudio é criado de forma lazy
 * e "destravado" no primeiro gesto do usuário (pointerdown/keydown) por causa
 * da política de autoplay dos navegadores. Se ainda estiver bloqueado, o
 * play() falha silenciosamente.
 */

import toastSomAsset from "@/assets/notificacao-toast.mp3.asset.json";

const SOM_URL = toastSomAsset.url;

let audio: HTMLAudioElement | null = null;
let desbloqueado = false;

function isBrowser() {
  return typeof window !== "undefined";
}

function obterAudio(): HTMLAudioElement | null {
  if (!isBrowser()) return null;
  if (audio) return audio;
  try {
    audio = new Audio(SOM_URL);
    audio.preload = "auto";
    audio.volume = 0.55;
  } catch {
    audio = null;
  }
  return audio;
}

function tentarDesbloquear() {
  if (desbloqueado) return;
  const a = obterAudio();
  if (!a) return;
  a.muted = true;
  a.play()
    .then(() => {
      a.pause();
      a.currentTime = 0;
      a.muted = false;
      desbloqueado = true;
    })
    .catch(() => {
      a.muted = false;
    });
}

if (isBrowser()) {
  window.addEventListener("pointerdown", tentarDesbloquear, { passive: true });
  window.addEventListener("keydown", tentarDesbloquear);
}

/** Toca o som dos toasts. Falha silenciosamente se ainda estiver bloqueado. */
export function tocarSomToast() {
  const a = obterAudio();
  if (!a) return;
  try {
    a.currentTime = 0;
    void a.play().catch(() => {});
  } catch {
    // Ignora falhas de reprodução (áudio bloqueado/indisponível).
  }
}
