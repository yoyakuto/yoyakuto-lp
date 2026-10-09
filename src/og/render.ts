/// <reference types="node" />
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '../consts';

const FONT_NAME = 'IBM Plex Sans JP';
const FONT_WEIGHT = 700;
const COLOR_BACKGROUND = '#F7F8FA';
const COLOR_GRID = '#ECEFF5';
const COLOR_TEXT = '#152033';
const COLOR_SUB = '#566176';
const COLOR_FREE = '#0F7B6C';
const COLOR_FREE_SOFT = '#E2F3EF';
const COLOR_SURFACE = '#FFFFFF';
const GRID_ROW = 48;
const GRID_COLUMN = 96;
const ACCENT_BAR_WIDTH = 16;
const PADDING_X = 96;
const PADDING_Y = 80;
const LABEL_FONT_SIZE = 30;
const HEADING_FONT_SIZE = 64;
const HEADING_LINE_HEIGHT = 1.4;
const CHIP_FONT_SIZE = 26;
const CHIP_PADDING_Y = 10;
const CHIP_PADDING_X = 22;
const CHIP_RADIUS = 10;
const CHIP_GAP = 14;
const SECTION_GAP = 44;

// モジュール内で 1 回だけ読む。カレントディレクトリ基準にするのは、ビルド後の import.meta.url が位置を保たないため
let fontData: Promise<Buffer> | undefined;
function loadFont() {
  fontData ??= readFile(resolve('src/assets/fonts/IBMPlexSansJP-Bold.ttf'));
  return fontData;
}

function box(style: Record<string, unknown>, children?: unknown) {
  return { type: 'div', props: { style: { display: 'flex', ...style }, children } };
}

function layout(label: string, headingLines: string[], slots: string[]) {
  const chip = (slot: string) =>
    box(
      {
        padding: `${CHIP_PADDING_Y}px ${CHIP_PADDING_X}px`,
        border: `2px solid ${COLOR_FREE}`,
        borderRadius: CHIP_RADIUS,
        background: COLOR_SURFACE,
        color: COLOR_FREE,
        fontSize: CHIP_FONT_SIZE,
      },
      slot,
    );

  return box(
    {
      width: '100%',
      height: '100%',
      fontFamily: FONT_NAME,
      color: COLOR_TEXT,
      backgroundColor: COLOR_BACKGROUND,
      backgroundImage: `linear-gradient(${COLOR_GRID} 1px, transparent 1px), linear-gradient(90deg, ${COLOR_GRID} 1px, transparent 1px)`,
      backgroundSize: `${GRID_COLUMN}px ${GRID_ROW}px`,
    },
    [
      box({ width: ACCENT_BAR_WIDTH, height: '100%', background: COLOR_FREE }),
      box(
        {
          flexDirection: 'column',
          justifyContent: 'center',
          gap: SECTION_GAP,
          flexGrow: 1,
          padding: `${PADDING_Y}px ${PADDING_X}px`,
        },
        [
          box({ fontSize: LABEL_FONT_SIZE, color: COLOR_SUB }, label),
          // satori は日本語を文節で折り返せないため、改行位置は呼び出し側で行ごとに渡す
          box(
            { flexDirection: 'column', fontSize: HEADING_FONT_SIZE, lineHeight: HEADING_LINE_HEIGHT },
            headingLines.map((line) => box({}, line)),
          ),
          box(
            { gap: CHIP_GAP, padding: CHIP_GAP, borderRadius: CHIP_RADIUS, background: COLOR_FREE_SOFT, alignSelf: 'flex-start' },
            slots.map(chip),
          ),
        ],
      ),
    ],
  );
}

export async function renderOgImage(
  label: string,
  headingLines: string[],
  slots: string[],
): Promise<Uint8Array<ArrayBuffer>> {
  const svg = await satori(layout(label, headingLines, slots) as Parameters<typeof satori>[0], {
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    fonts: [{ name: FONT_NAME, data: await loadFont(), weight: FONT_WEIGHT, style: 'normal' }],
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Uint8Array(png);
}
