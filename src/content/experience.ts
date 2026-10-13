/**
 * ------------------------------------------------------------------
 * ALL EDITABLE COPY LIVES HERE.
 * Change anything in this file to personalise the experience.
 * Nothing below this file contains hardcoded personal details.
 * ------------------------------------------------------------------
 */

export const content = {
  /** The person this world was made for. Leave "" if you prefer no name shown. */
  recipientName: "", // e.g. "Amara"

  occasion: {
    /** Shown as the small museum-label above the opening line. */
    eyebrow: "For you — a birthday",
    /** Optional: "twenty-seven", "the eighteenth of June" … leave "" to hide. */
    dateLine: "",
  },

  intro: {
    headline: "There's a little something waiting for you.",
    supporting:
      "Take your time. This little world was made just for you — nothing here is in a hurry.",
    cta: "Open your surprise",
    hint: "Move around — the gift notices",
  },

  gift: {
    openedLabel: "It's open",
    transitionLine: "The ribbon gives. The light doesn't stop.",
  },

  cake: {
    eyebrow: "Before anything else…",
    headline: "Make a little wish.",
    supporting:
      "Close your eyes for a second. You're allowed to want something purely for yourself.",
    cta: "Blow out the candles",
    micCta: "Blow into your microphone",
    micHint: "Optional — your microphone is never recorded or sent anywhere.",
    micFailed: "No microphone — that's fine. Use the button instead.",
    outLine: "There. The whole room just changed.",
  },

  keepsakes: {
    eyebrow: "A few things I kept",
    headline: "Look closer.",
    supporting: "Four small objects. Each one is hiding something short.",
    allDone: "That's all of them — something else is glowing now.",
    hint: "Take a closer look",
    followCta: "Follow the light →",
    skipCta: "Or wander over to the desk →",
  },

  discoveries: [
    {
      id: "mirror",
      label: "The hand mirror",
      title: "A reflection, honestly taken",
      message: "There's more to you than you sometimes realise.",
    },
    {
      id: "rose",
      label: "The preserved rose",
      title: "Pressed and kept",
      message: "Never forget how much beauty you bring into the little things.",
    },
    {
      id: "note",
      label: "The folded note",
      title: "Written in a hurry, meant slowly",
      message:
        "You are allowed to be proud of how far you've come — even on the days when it doesn't feel like far.",
    },
    {
      id: "keepsake",
      label: "The little locket",
      title: "Something that still glows",
      message:
        "Whatever this year asks of you, you won't be meeting it empty-handed.",
    },
  ],

  /** Shown when all three hidden stars are found. */
  bonus: {
    title: "You found all three.",
    message:
      "Three small lights, hidden where you weren't looking. That's rather like the year ahead — the good parts rarely announce themselves.",
  },

  letter: {
    eyebrow: "One more thing, on the desk",
    headline: "Open your letter.",
    supporting: "It's been written for a while. It would like to be read.",
    cta: "Open the envelope",
    revealCta: "Reveal the rest",
    replayCta: "Read it again",
    closeCta: "Fold it away",
    salutation: "Happy birthday,",
    paragraphs: [
      "You deserve a day that feels as special as the happiness you bring into the world — and I hope this one does, right from the first hour of it.",
      "I hope this new year of your life brings you peaceful mornings, unexpected reasons to smile, memories you'll keep retelling, and the courage to chase the things that actually matter to you.",
      "Take a moment today to celebrate yourself. Not the things you do for everyone else — you, sitting still, being celebrated for no productive reason at all.",
      "You deserve kindness, happiness, and so many good things still ahead.",
    ],
    signoff: "Happy birthday, always.",
    signature: "— with love", // e.g. "— Me"
    sealLabel: "Seal the letter and look up",
  },

  finale: {
    eyebrow: "The room opens",
    headline: "Happy birthday, beautiful soul.",
    supporting:
      "I hope this year is gentle with you, generous with happiness, and full of moments that remind you how special life is.",
    constellationHint: "Touch the lit star",
    traceAll: "Trace the whole constellation",
    finalNote: "Made for you, and only you.",
    replay: "Experience it again",
  },

  /** Small interface strings. */
  ui: {
    listening: "Listening…",
    confirmRestart: "Tap again to start over",
    musicOn: "Pause the music",
    musicOff: "Play the music",
    mute: "Mute sound effects",
    unmute: "Unmute sound effects",
    hiddenStar: "A hidden star — touch it",
    close: "Close",
  },

  /** Optional local audio. Leave empty to use the built-in ambient score. */
  audio: {
    musicSrc: "", // e.g. "/assets/audio/score.mp3"
  },

  /** Optional personal photographs — leave arrays empty to show none. */
  photos: [] as { src: string; caption: string }[],
};

export const discoveries = content.discoveries;
export type Discovery = (typeof content.discoveries)[number];

export const STAR_IDS = ["star-one", "star-two", "star-three"] as const;

/** Opening line used in the accessible document title / announcement. */
export const worldTitle = "A little world";
