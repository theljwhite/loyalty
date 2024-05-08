import { MutableRefObject, useEffect } from "react";

//no dependency arr's needed really for these useEff's

export function useWindowEvent<Event extends keyof WindowEventMap>(
  event: Event,
  handler: (event: WindowEventMap[Event]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  useEffect(() => {
    window.addEventListener(event, handler, options);
    return () => {
      window.removeEventListener(event, handler, options);
    };
  });
}

export function useOnClickOutside<T>(
  ref: MutableRefObject<HTMLDivElement | null>,
  handler: (...args: any[]) => any,
): void {
  const listener = (event: any) => {
    if (!ref.current || ref.current.contains(event.target)) {
      return;
    }
    handler(event);
  };

  useEffect(() => {
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  });
}
export default useOnClickOutside;
