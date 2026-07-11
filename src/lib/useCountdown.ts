import { useEffect, useRef, useState } from "react";

export function useCountdown(totalSec: number, active: boolean, onExpire: () => void) {
  const [remainingSec, setRemainingSec] = useState(totalSec);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemainingSec(totalSec);
  }, [totalSec]);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setRemainingSec((sec) => {
        if (sec <= 1) {
          clearInterval(interval);
          onExpireRef.current();
          return 0;
        }
        return sec - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active]);

  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;
  const label = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return { remainingSec, label };
}
