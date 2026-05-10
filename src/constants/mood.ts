import { MoodKey } from '@/types';

export const MOOD_OPTIONS: { key: MoodKey; emoji: string; label: string }[] = [
  { key: 'great', emoji: '🥰', label: '좋아' },
  { key: 'good', emoji: '😊', label: '괜찮아' },
  { key: 'soso', emoji: '😐', label: '그냥' },
  { key: 'tired', emoji: '😴', label: '피곤' },
  { key: 'sad', emoji: '😢', label: '울적' },
];

export const MOOD_EMOJI: Record<MoodKey, string> = MOOD_OPTIONS.reduce(
  (acc, m) => ({ ...acc, [m.key]: m.emoji }),
  {} as Record<MoodKey, string>,
);

export const MOOD_LABEL: Record<MoodKey, string> = MOOD_OPTIONS.reduce(
  (acc, m) => ({ ...acc, [m.key]: m.label }),
  {} as Record<MoodKey, string>,
);
