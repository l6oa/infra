import { Box } from 'ink';
import { reject } from 'lodash-es';

import { BaseCommand } from '@/commands/BaseCommand';
import { CommandItem } from '@/terminal/components/CommandItem';

type CommandListProps = {
  commands: BaseCommand[];
};

export function CommandList({ commands }: CommandListProps) {
  const activeCommands = reject(commands, { status: 'inactive' });

  return (
    <Box flexDirection="column">
      {activeCommands.map((command) => (
        <CommandItem
          key={command.resourceName}
          command={command}
        />
      ))}
    </Box>
  );
}
