export interface OnboardingPage {
  title: string;
  description: string;
  gradient: [string, string, ...string[]];
}

export interface BreathingExerciseConfig {
  textGroups: string[][];
  breathingCycle: {
    inhaleTime: number;
    holdTime: number;
    exhaleTime: number;
  };
  instructions: {
    inhale: string;
    hold: string;
    exhale: string;
  };
  continueHint: string;
}

// Using app's default color scheme for consistency
const defaultGradient: [string, string, ...string[]] = ['#0A2647', '#144272', '#205295'];

export const onboardingPages: OnboardingPage[] = [
  {
    title: "Welcome to Somnio",
    description: "Your personal wellness companion for better sleep, focus, and relaxation",
    gradient: defaultGradient,
  },
  {
    title: "Stay Focused",
    description: "Boost your productivity with focus timers and concentration exercises",
    gradient: defaultGradient,
  },
  {
    title: "Relax & Unwind",
    description: "Take a break with breathing exercises and stretching routines",
    gradient: defaultGradient,
  },
];

export const breathingExerciseConfig: BreathingExerciseConfig = {
  textGroups: [
    [
      "Take a moment to pause...",
      "Leave behind the restlessness,"
    ],
    [
      "and embrace the quiet calm within you.",
      "Let's breathe together."
    ]
  ],
  breathingCycle: {
    inhaleTime: 4000,
    holdTime: 4000,
    exhaleTime: 4000,
  },
  instructions: {
    inhale: "Breathe in...",
    hold: "Hold...",
    exhale: "Breathe out...",
  },
  continueHint: "This exercise will continue in the background",
};

// Breathing exercise uses a calming gradient variation
export const breathingGradient: [string, string, ...string[]] = ['#0A2647', '#1a3a5c', '#2d5a8f'];

export const onboardingConfig = {
  pages: onboardingPages,
  breathingExercise: breathingExerciseConfig,
  // Index after which breathing exercise should appear (0 means after first page)
  breathingExerciseAfterPageIndex: 0,
};