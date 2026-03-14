import { useCallback, useRef, useState } from "react";

export type BehaviorProfile = "Calibrating" | "Generic" | "Non-Generic";

interface DigitalSmileState {
  profile: BehaviorProfile;
  swipeBaseline?: number;
  typingBaseline?: number;
  navBaseline?: number;
  swipeCurrent?: number;
  typingCurrent?: number;
  navCurrent?: number;
}

const SWIPE_BUFFER_SIZE = 5;
const TYPING_BUFFER_SIZE = 10;
const NAV_BUFFER_SIZE = 5;
const DEVIATION_THRESHOLD = 0.4; // 40%

function computeAverage(buffer: number[]): number {
  if (buffer.length === 0) return 0;
  return buffer.reduce((a, b) => a + b, 0) / buffer.length;
}

function isDeviant(current: number, baseline: number): boolean {
  if (baseline === 0) return false;
  return Math.abs(current - baseline) / baseline > DEVIATION_THRESHOLD;
}

export function useDigitalSmile() {
  // Swipe tracking
  const swipeBuffer = useRef<number[]>([]);
  const swipeBaselineRef = useRef<number | undefined>(undefined);

  // Typing tracking
  const typingBuffer = useRef<number[]>([]);
  const typingBaselineRef = useRef<number | undefined>(undefined);

  // Nav tracking
  const navBuffer = useRef<number[]>([]);
  const navBaselineRef = useRef<number | undefined>(undefined);
  const lastNavTimestampRef = useRef<number | undefined>(undefined);

  // Published state
  const [state, setState] = useState<DigitalSmileState>({
    profile: "Calibrating",
  });

  const classify = useCallback(
    (
      swipeFlagged: boolean,
      typingFlagged: boolean,
      navFlagged: boolean,
      hasSwipeBaseline: boolean,
      hasTypingBaseline: boolean,
      hasNavBaseline: boolean,
      swipeCurr?: number,
      typingCurr?: number,
      navCurr?: number,
    ) => {
      // Need all 3 baselines to exit Calibrating
      if (!hasSwipeBaseline || !hasTypingBaseline || !hasNavBaseline) {
        setState((prev) => ({
          ...prev,
          profile: "Calibrating",
          swipeCurrent: swipeCurr,
          typingCurrent: typingCurr,
          navCurrent: navCurr,
          swipeBaseline: swipeBaselineRef.current,
          typingBaseline: typingBaselineRef.current,
          navBaseline: navBaselineRef.current,
        }));
        return;
      }

      const flagCount = [swipeFlagged, typingFlagged, navFlagged].filter(
        Boolean,
      ).length;
      const profile: BehaviorProfile =
        flagCount >= 2 ? "Non-Generic" : "Generic";

      setState({
        profile,
        swipeBaseline: swipeBaselineRef.current,
        typingBaseline: typingBaselineRef.current,
        navBaseline: navBaselineRef.current,
        swipeCurrent: swipeCurr,
        typingCurrent: typingCurr,
        navCurrent: navCurr,
      });
    },
    [],
  );

  const recordSwipe = useCallback(
    (deltaY: number, durationMs: number) => {
      if (durationMs <= 0) return;
      const velocity = Math.abs(deltaY) / durationMs; // px/ms

      const buf = swipeBuffer.current;
      buf.push(velocity);
      if (buf.length > SWIPE_BUFFER_SIZE * 3) {
        buf.splice(0, buf.length - SWIPE_BUFFER_SIZE * 3);
      }

      // Establish baseline from first 5 samples
      if (
        swipeBaselineRef.current === undefined &&
        buf.length >= SWIPE_BUFFER_SIZE
      ) {
        swipeBaselineRef.current = computeAverage(
          buf.slice(0, SWIPE_BUFFER_SIZE),
        );
      }

      const recentSwipe = buf.slice(-SWIPE_BUFFER_SIZE);
      const currentAvg = computeAverage(recentSwipe);
      const flagged =
        swipeBaselineRef.current !== undefined &&
        isDeviant(currentAvg, swipeBaselineRef.current);

      const typingBuf = typingBuffer.current;
      const typingCurr =
        typingBuf.length > 0
          ? computeAverage(typingBuf.slice(-TYPING_BUFFER_SIZE))
          : undefined;
      const typingFlagged =
        typingBaselineRef.current !== undefined && typingCurr !== undefined
          ? isDeviant(typingCurr, typingBaselineRef.current)
          : false;

      const navBuf = navBuffer.current;
      const navCurr =
        navBuf.length > 0
          ? computeAverage(navBuf.slice(-NAV_BUFFER_SIZE))
          : undefined;
      const navFlagged =
        navBaselineRef.current !== undefined && navCurr !== undefined
          ? isDeviant(navCurr, navBaselineRef.current)
          : false;

      classify(
        flagged,
        typingFlagged,
        navFlagged,
        swipeBaselineRef.current !== undefined,
        typingBaselineRef.current !== undefined,
        navBaselineRef.current !== undefined,
        currentAvg,
        typingCurr,
        navCurr,
      );
    },
    [classify],
  );

  const recordKeystroke = useCallback(
    (intervalMs: number) => {
      if (intervalMs <= 0 || intervalMs > 5000) return; // ignore gaps > 5s
      const buf = typingBuffer.current;
      buf.push(intervalMs);
      if (buf.length > TYPING_BUFFER_SIZE * 3) {
        buf.splice(0, buf.length - TYPING_BUFFER_SIZE * 3);
      }

      // Establish baseline from first 10 samples
      if (
        typingBaselineRef.current === undefined &&
        buf.length >= TYPING_BUFFER_SIZE
      ) {
        typingBaselineRef.current = computeAverage(
          buf.slice(0, TYPING_BUFFER_SIZE),
        );
      }

      const recentTyping = buf.slice(-TYPING_BUFFER_SIZE);
      const currentAvg = computeAverage(recentTyping);
      const flagged =
        typingBaselineRef.current !== undefined &&
        isDeviant(currentAvg, typingBaselineRef.current);

      const swipeBuf = swipeBuffer.current;
      const swipeCurr =
        swipeBuf.length > 0
          ? computeAverage(swipeBuf.slice(-SWIPE_BUFFER_SIZE))
          : undefined;
      const swipeFlagged =
        swipeBaselineRef.current !== undefined && swipeCurr !== undefined
          ? isDeviant(swipeCurr, swipeBaselineRef.current)
          : false;

      const navBuf = navBuffer.current;
      const navCurr =
        navBuf.length > 0
          ? computeAverage(navBuf.slice(-NAV_BUFFER_SIZE))
          : undefined;
      const navFlagged =
        navBaselineRef.current !== undefined && navCurr !== undefined
          ? isDeviant(navCurr, navBaselineRef.current)
          : false;

      classify(
        swipeFlagged,
        flagged,
        navFlagged,
        swipeBaselineRef.current !== undefined,
        typingBaselineRef.current !== undefined,
        navBaselineRef.current !== undefined,
        swipeCurr,
        currentAvg,
        navCurr,
      );
    },
    [classify],
  );

  const recordNavigation = useCallback(() => {
    const now = Date.now();
    const last = lastNavTimestampRef.current;
    lastNavTimestampRef.current = now;

    if (last === undefined) return; // first nav, no gap yet
    const gap = now - last;
    if (gap > 60000) return; // ignore gaps > 1 min (idle session)

    const buf = navBuffer.current;
    buf.push(gap);
    if (buf.length > NAV_BUFFER_SIZE * 3) {
      buf.splice(0, buf.length - NAV_BUFFER_SIZE * 3);
    }

    // Establish baseline from first 5 samples
    if (navBaselineRef.current === undefined && buf.length >= NAV_BUFFER_SIZE) {
      navBaselineRef.current = computeAverage(buf.slice(0, NAV_BUFFER_SIZE));
    }

    const recentNav = buf.slice(-NAV_BUFFER_SIZE);
    const currentAvg = computeAverage(recentNav);
    const flagged =
      navBaselineRef.current !== undefined &&
      isDeviant(currentAvg, navBaselineRef.current);

    const swipeBuf = swipeBuffer.current;
    const swipeCurr =
      swipeBuf.length > 0
        ? computeAverage(swipeBuf.slice(-SWIPE_BUFFER_SIZE))
        : undefined;
    const swipeFlagged =
      swipeBaselineRef.current !== undefined && swipeCurr !== undefined
        ? isDeviant(swipeCurr, swipeBaselineRef.current)
        : false;

    const typingBuf = typingBuffer.current;
    const typingCurr =
      typingBuf.length > 0
        ? computeAverage(typingBuf.slice(-TYPING_BUFFER_SIZE))
        : undefined;
    const typingFlagged =
      typingBaselineRef.current !== undefined && typingCurr !== undefined
        ? isDeviant(typingCurr, typingBaselineRef.current)
        : false;

    classify(
      swipeFlagged,
      typingFlagged,
      flagged,
      swipeBaselineRef.current !== undefined,
      typingBaselineRef.current !== undefined,
      navBaselineRef.current !== undefined,
      swipeCurr,
      typingCurr,
      currentAvg,
    );
  }, [classify]);

  return {
    profile: state.profile,
    swipeBaseline: state.swipeBaseline,
    typingBaseline: state.typingBaseline,
    navBaseline: state.navBaseline,
    swipeCurrent: state.swipeCurrent,
    typingCurrent: state.typingCurrent,
    navCurrent: state.navCurrent,
    recordSwipe,
    recordKeystroke,
    recordNavigation,
  };
}
