import { Text } from 'ink';

import { useRythm } from '@/terminal/hooks/useRythm';

type DurationProps = {
  startDate: Date | null;
  endDate: Date | null;
};

export function Duration({
  startDate,
  endDate,
}: DurationProps) {
  useRythm(150, { active: !endDate });

  const time = (endDate?.getTime() ?? Date.now()) - startDate!.getTime();
  const formattedTime = (time / 1000).toFixed(1);
  const color = endDate ? 'blue' : undefined;

  return (
    <Text color={color}>
      {`${formattedTime}s`}
    </Text>
  );
}
