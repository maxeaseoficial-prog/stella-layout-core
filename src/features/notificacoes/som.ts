/**
 * Som de notificação do sistema (arquivo MP3 hospedado na CDN).
 *
 * Navegadores bloqueiam áudio automático até o primeiro gesto do usuário
 * (clique/tecla). Por isso o elemento de áudio é criado de forma lazy e
 * "destravado" no primeiro pointerdown/keydown; se ainda estiver bloqueado
 * quando uma notificação chegar, o play() falha silenciosamente.
 */

import somAsset from "@/assets/notificacao-som.mp3.asset.json";

const SOM_URL = somAsset.url;

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
    audio.volume = 0.6;
  } catch {
    audio = null;
  }
  return audio;
}

function tentarDesbloquear() {
  if (desbloqueado) return;
  const a = obterAudio();
  if (!a) return;
  // "Aquece" o áudio dentro de um gesto do usuário: toca mudo e pausa,
  // liberando reproduções futuras (política de autoplay).
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

// Destrava o áudio no primeiro gesto do usuário (política de autoplay).
if (isBrowser()) {
  window.addEventListener("pointerdown", tentarDesbloquear, { passive: true });
  window.addEventListener("keydown", tentarDesbloquear);
}

/**
 * Toca o som de notificação do sistema.
 * Não faz nada (sem erros) se o áudio ainda estiver bloqueado pelo navegador.
 */
export function tocarSomNotificacao() {
  const a = obterAudio();
  if (!a) return;
  try {
    a.currentTime = 0;
    void a.play().catch(() => {});
  } catch {
    // Ignora falhas de reprodução (áudio bloqueado/indisponível).
  }
}
