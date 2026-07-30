/**
 * Som de notificação sintetizado via Web Audio API — sem arquivos de áudio.
 *
 * Navegadores bloqueiam áudio automático até o primeiro gesto do usuário
 * (clique/tecla). Por isso o AudioContext é criado de forma lazy e "destravado"
 * no primeiro pointerdown/keydown; se ainda estiver suspenso quando uma
 * notificação chegar, o som é simplesmente ignorado (sem erros no console).
 */

let ctx: AudioContext | null = null;

function isBrowser() {
  return typeof window !== "undefined";
}

type AudioContextCtor = new () => AudioContext;

function obterContexto(): AudioContext | null {
  if (!isBrowser()) return null;
  if (ctx) return ctx;
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  const Ctor = w.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
  } catch {
    ctx = null;
  }
  return ctx;
}

function tentarRetomar() {
  const c = obterContexto();
  if (c && c.state === "suspended") {
    void c.resume().catch(() => {});
  }
}

// Destrava o áudio no primeiro gesto do usuário (política de autoplay).
if (isBrowser()) {
  window.addEventListener("pointerdown", tentarRetomar, { passive: true });
  window.addEventListener("keydown", tentarRetomar);
}

/**
 * Toca um "ding-dong" curto e suave (duas notas senoidais com decay).
 * Não faz nada se o áudio ainda estiver bloqueado pelo navegador.
 */
export function tocarSomNotificacao() {
  const c = obterContexto();
  if (!c || c.state !== "running") return;

  const t0 = c.currentTime + 0.01;
  const master = c.createGain();
  master.gain.setValueAtTime(0.22, t0);
  master.connect(c.destination);

  // Lá5 → Ré6: intervalo agradável de "notificação".
  const notas: Array<{ freq: number; inicio: number; duracao: number }> = [
    { freq: 880, inicio: 0, duracao: 0.16 },
    { freq: 1174.66, inicio: 0.13, duracao: 0.42 },
  ];

  for (const nota of notas) {
    const inicio = t0 + nota.inicio;
    const osc = c.createOscillator();
    const env = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(nota.freq, inicio);
    env.gain.setValueAtTime(0.0001, inicio);
    env.gain.exponentialRampToValueAtTime(1, inicio + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0001, inicio + nota.duracao);
    osc.connect(env);
    env.connect(master);
    osc.start(inicio);
    osc.stop(inicio + nota.duracao + 0.05);
  }
}
