import { useCallback, useEffect, useState } from "react";
import { audio } from "@/hooks/useAudio";

export type SfxName = Parameters<typeof audio.sfx>[0];

export function useAudioEngine() {
  const [status, setStatus] = useState({ supported: false, running: false });

  useEffect(() => {
    const unsubscribe = audio.subscribe(setStatus);
    return () => {
      unsubscribe();
    };
  }, []);

  const start = useCallback(() => void audio.start(), []);
  const stop = useCallback(() => audio.stop(), []);
  const sfx = useCallback((n: SfxName) => audio.sfx(n), []);

  return { ...status, start, stop, sfx };
}
