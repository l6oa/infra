import { Box, Text } from 'ink';

import { BaseCommand } from '@/commands/BaseCommand';
import { Duration } from '@/terminal/components/Duration';
import { Spinner } from '@/terminal/components/Spinner';

type CommandItemProps = {
  command: BaseCommand;
};

export function CommandItem({ command }: CommandItemProps) {
  const [
    icon,
    iconColor,
    textColor,
  ] = (() => {
    const status = (
      command.status === 'failed' && command.aborted
        ? 'aborted-then-failed'
        : command.status
    );

    switch (status) {
      case 'pending': return [<Spinner />];
      case 'succeeded': return ['✔', 'green'];
      case 'failed': return ['✘', 'red', 'red'];
      case 'aborted': return ['■', 'gray', 'gray'];
      case 'aborted-then-failed': return ['✘', 'gray', 'gray'];
      default: return ['?', 'gray', 'gray'];
    }
  })();

  return (
    <Box>
      <Box width={2}>
        <Text color={iconColor}>{icon}</Text>
      </Box>
      <Box flexGrow={1} marginRight={1}>
        <Text color={textColor}>
          {command.resourceName}
        </Text>
        {command.stepName && (
          <Text color={textColor ?? 'yellow'}>
            {` > ${command.stepName}`}
          </Text>
        )}
      </Box>
      <Duration
        startDate={command.startDate}
        endDate={command.endDate}
      />
    </Box>
  );
}
