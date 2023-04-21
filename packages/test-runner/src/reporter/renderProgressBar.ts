import { gray, white } from 'nanocolors';

const PROGRESS_BLOCKS = [' ', '▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];
const PROGRESS_WIDTH = 30;

function createProgressBlocks(value: number, total: number) {
  if (value >= total) {
    return PROGRESS_BLOCKS[8].repeat(PROGRESS_WIDTH);
  }

  const count = (PROGRESS_WIDTH * value) / total;
  const floored = Math.floor(count);
  const partialBlock =
    PROGRESS_BLOCKS[Math.floor((count - floored) * (PROGRESS_BLOCKS.length - 1))];
  return `${PROGRESS_BLOCKS[8].repeat(floored)}${partialBlock}${' '.repeat(
    PROGRESS_WIDTH - floored - 1,
  )}`;
}

export function renderProgressBar(finished: number, active: number, total: number) {
  const progressBlocks = createProgressBlocks(finished + active, total);
  const finishedBlockCount = Math.floor((PROGRESS_WIDTH * finished) / total);

  const finishedBlocks = white(progressBlocks.slice(0, finishedBlockCount));
  const scheduledBlocks = gray(progressBlocks.slice(finishedBlockCount));
  return `|${finishedBlocks}${scheduledBlocks}|`;
}
