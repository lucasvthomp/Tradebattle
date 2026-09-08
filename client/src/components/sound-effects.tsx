import { useEffect } from "react";
import { soundEffects, type TradebattleSound } from "@/lib/sound-effects";

function soundForControl(control: HTMLElement): TradebattleSound {
  const explicit = control.dataset.sound as TradebattleSound | undefined;
  if (explicit && ["tap", "confirm", "back", "error"].includes(explicit)) return explicit;

  const label = `${control.getAttribute("aria-label") ?? ""} ${control.textContent ?? ""}`.toLowerCase();
  if (/close|back|cancel|previous|dismiss/.test(label)) return "back";
  if (/submit|save|create|join|enter|play|open|sign up|login|redeem|deposit|withdraw|send|confirm/.test(label)) return "confirm";
  return "tap";
}

export function SoundEffects() {
  useEffect(() => {
    let lastPointerSound = 0;
    const selector = "button, a[href], [role=\"button\"]";

    const playForEvent = (event: Event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>(selector) : null;
      if (!target || target.dataset.sound === "off") return;
      if (target.getAttribute("aria-disabled") === "true") return;
      if (target instanceof HTMLButtonElement && target.disabled) return;
      soundEffects.play(soundForControl(target));
    };

    const handlePointerDown = (event: PointerEvent) => {
      lastPointerSound = performance.now();
      playForEvent(event);
    };

    const handleClick = (event: MouseEvent) => {
      if (performance.now() - lastPointerSound < 250) return;
      playForEvent(event);
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}

