import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { STAR_IDS } from "@/content/experience";

export type Scene = "arrival" | "cake" | "keepsakes" | "letter" | "finale";

export const SCENE_ORDER: Scene[] = ["arrival", "cake", "keepsakes", "letter", "finale"];

/** Number of segments in the finale heart constellation (see FinaleConstellation). */
export const CONSTELLATION_STEPS = 12;

export interface State {
  scene: Scene;
  /** true while a major environmental transition is running */
  busy: boolean;
  giftOpened: boolean;
  candlesOut: boolean;
  discovered: string[];
  stars: string[];
  letterOpen: boolean;
  letterRevealed: boolean;
  finaleBegun: boolean;
  /** index of the last connected constellation node */
  constellation: number;
  constellationComplete: boolean;
  musicOn: boolean;
  muted: boolean;
  reduced: boolean;
  micTried: boolean;
  micAvailable: boolean;
  announce: string;
}

export const initialState: State = {
  scene: "arrival",
  busy: false,
  giftOpened: false,
  candlesOut: false,
  discovered: [],
  stars: [],
  letterOpen: false,
  letterRevealed: false,
  finaleBegun: false,
  constellation: 0,
  constellationComplete: false,
  musicOn: false,
  muted: false,
  reduced: false,
  micTried: false,
  micAvailable: false,
  announce: "",
};

export type Action =
  | { type: "OPEN_GIFT" }
  | { type: "GIFT_SETTLED" }
  | { type: "BLOW_CANDLES" }
  | { type: "CANDLES_SETTLED" }
  | { type: "DISCOVER"; id: string; message: string }
  | { type: "COLLECT_STAR"; id: string }
  | { type: "OPEN_LETTER" }
  | { type: "CLOSE_LETTER" }
  | { type: "LETTER_REVEALED" }
  | { type: "BEGIN_FINALE" }
  | { type: "TO_LETTER" }
  | { type: "ADVANCE_CONSTELLATION" }
  | { type: "TRACE_CONSTELLATION" }
  | { type: "SET_MUSIC"; on: boolean }
  | { type: "SET_MUTED"; on: boolean }
  | { type: "SET_REDUCED"; on: boolean }
  | { type: "MIC_RESULT"; ok: boolean }
  | { type: "GOTO"; scene: Scene }
  | { type: "RESET" }
  | { type: "SAY"; text: string };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN_GIFT":
      if (state.giftOpened || state.busy) return state;
      return { ...state, busy: true, giftOpened: true, musicOn: true, announce: "The gift is opening." };

    case "GIFT_SETTLED":
      if (state.scene !== "arrival") return state;
      return { ...state, busy: false, scene: "cake", announce: "A birthday cake appears in the room." };

    case "BLOW_CANDLES":
      if (state.candlesOut || state.busy) return state;
      return { ...state, busy: true, candlesOut: true, announce: "The candles go out." };

    case "CANDLES_SETTLED":
      if (state.scene !== "cake") return state;
      return { ...state, busy: false, scene: "keepsakes", announce: "The room darkens. Four keepsakes appear." };

    case "DISCOVER": {
      if (state.discovered.includes(action.id)) return state;
      const discovered = [...state.discovered, action.id];
      const all = discovered.length === 4;
      return {
        ...state,
        discovered,
        announce: all
          ? "All four keepsakes found. The letter on the desk begins to glow."
          : `Opened: ${action.message}`,
      };
    }

    case "COLLECT_STAR": {
      if (state.stars.includes(action.id)) return state;
      const stars = [...state.stars, action.id];
      return {
        ...state,
        stars,
        announce:
          stars.length === STAR_IDS.length
            ? "All three hidden stars found. A bonus message unlocked."
            : `Hidden star found. ${stars.length} of 3.`,
      };
    }

    case "OPEN_LETTER":
      if (state.letterOpen) return state;
      return { ...state, letterOpen: true, scene: "letter", announce: "The envelope opens." };

    case "CLOSE_LETTER":
      return { ...state, letterOpen: false, letterRevealed: false };

    case "LETTER_REVEALED":
      return { ...state, letterRevealed: true };

    case "BEGIN_FINALE":
      if (state.finaleBegun) return state;
      return { ...state, finaleBegun: true, scene: "finale", busy: false, announce: "The room opens into a night sky." };

    case "TO_LETTER": {
      if (state.busy || state.scene !== "keepsakes") return state;
      return { ...state, scene: "letter", announce: "You walk over to the writing desk." };
    }

    case "ADVANCE_CONSTELLATION": {
      if (state.constellationComplete) return state;
      const constellation = state.constellation + 1;
      const complete = constellation >= CONSTELLATION_STEPS;
      return {
        ...state,
        constellation,
        constellationComplete: complete,
        announce: complete ? "The constellation is complete." : "Another star connects.",
      };
    }

    case "TRACE_CONSTELLATION":
      return {
        ...state,
        constellation: CONSTELLATION_STEPS,
        constellationComplete: true,
        announce: "The constellation is complete.",
      };

    case "SET_MUSIC":
      return { ...state, musicOn: action.on };

    case "SET_MUTED":
      return { ...state, muted: action.on, musicOn: action.on ? false : state.musicOn };

    case "SET_REDUCED":
      return { ...state, reduced: action.on };

    case "MIC_RESULT":
      return { ...state, micTried: true, micAvailable: action.ok };

    case "GOTO": {
      // Only allowed to move backwards, and never mid-transition.
      if (state.busy) return state;
      const from = SCENE_ORDER.indexOf(state.scene);
      const to = SCENE_ORDER.indexOf(action.scene);
      if (to >= from) return state;
      return { ...state, scene: action.scene, letterOpen: false, announce: `Back to ${action.scene}.` };
    }

    case "SAY":
      return { ...state, announce: action.text };

    case "RESET":
      return { ...initialState, reduced: state.reduced, announce: "Starting again." };

    default:
      return state;
  }
}

const StateCtx = createContext<State>(initialState);
const DispatchCtx = createContext<Dispatch<Action>>(() => {});

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => state, [state]);
  const d = useMemo(() => dispatch, [dispatch]);
  return (
    <StateCtx.Provider value={value}>
      <DispatchCtx.Provider value={d}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export const useExperience = () => useContext(StateCtx);
export const useExperienceDispatch = () => useContext(DispatchCtx);
