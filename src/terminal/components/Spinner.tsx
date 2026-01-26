import { Text } from 'ink';

import { useRythm } from '@/terminal/hooks/useRythm';

const internal = 150;
const frames = [
  '⠋',
  '⠙',
  '⠹',
  '⠸',
  '⠼',
  '⠴',
  '⠦',
  '⠧',
  '⠇',
  '⠏',
];

export function Spinner() {
  const i = useRythm(internal);
  const currentFrame = frames[i % frames.length];

  return (
    <Text>
      {currentFrame}
    </Text>
  );
}
