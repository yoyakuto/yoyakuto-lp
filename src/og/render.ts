/// <reference types="node" />
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '../consts';

const FONT_NAME = 'Shippori Mincho';
const FONT_WEIGHT = 500;
const COLOR_BACKGROUND = '#F6F5F1';
const COLOR_TEXT = '#1A1D2B';
const COLOR_SUB = '#806440';
const COLOR_ACCENT = '#B39566';
const COLOR_FRAME = '#E2DED4';
const COLOR_FRAME_INNER = '#ECE8E0';
const FRAME_INSET = 11;
const HEADING_FONT_SIZE = 56;
const HEADING_LINE_HEIGHT = 1.6;
const HEADING_LETTER_SPACING = '0.08em';
const LABEL_FONT_SIZE = 28;
const LABEL_LETTER_SPACING = '0.3em';
const CONTENT_GAP = 40;
const ORNAMENT_LINE_WIDTH = 96;
const ORNAMENT_LINE_HEIGHT = 2;
const ORNAMENT_DIAMOND_SIZE = 12;
const ORNAMENT_GAP = 20;
const CONTENT_PADDING_X = 120;

// モジュール内で 1 回だけ読む。カレントディレクトリ基準にするのは、ビルド後の import.meta.url が位置を保たないため
let fontData: Promise<Buffer> | undefined;
function loadFont() {
  fontData ??= readFile(resolve('src/assets/fonts/ShipporiMincho-Medium.ttf'));
  return fontData;
}

function box(style: Record<string, unknown>, children?: unknown) {
  return { type: 'div', props: { style: { display: 'flex', ...style }, children } };
}

function layout(label: string, headingLines: string[]) {
  const line = () => box({ width: ORNAMENT_LINE_WIDTH, height: ORNAMENT_LINE_HEIGHT, background: COLOR_ACCENT });
  const ornament = box({ alignItems: 'center', gap: ORNAMENT_GAP }, [
    line(),
    box({
      width: ORNAMENT_DIAMOND_SIZE,
      height: ORNAMENT_DIAMOND_SIZE,
      background: COLOR_ACCENT,
      transform: 'rotate(45deg)',
    }),
    line(),
  ]);

  return box(
    {
      width: '100%',
      height: '100%',
      background: COLOR_BACKGROUND,
      fontFamily: FONT_NAME,
      color: COLOR_TEXT,
      position: 'relative',
    },
    [
      box({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: `1px solid ${COLOR_FRAME}` }),
      box({
        position: 'absolute',
        top: FRAME_INSET,
        left: FRAME_INSET,
        right: FRAME_INSET,
        bottom: FRAME_INSET,
        border: `1px solid ${COLOR_FRAME_INNER}`,
      }),
      box(
        {
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: CONTENT_GAP,
          width: '100%',
          height: '100%',
          padding: `0 ${CONTENT_PADDING_X}px`,
        },
        [
          box({ fontSize: LABEL_FONT_SIZE, letterSpacing: LABEL_LETTER_SPACING, color: COLOR_SUB }, label),
          ornament,
          // satori は日本語を文節で折り返せないため、改行位置は呼び出し側で行ごとに渡す
          box(
            {
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: HEADING_FONT_SIZE,
              lineHeight: HEADING_LINE_HEIGHT,
              letterSpacing: HEADING_LETTER_SPACING,
            },
            headingLines.map((line) => box({}, line)),
          ),
        ],
      ),
    ],
  );
}

export async function renderOgImage(label: string, headingLines: string[]): Promise<Uint8Array<ArrayBuffer>> {
  const svg = await satori(layout(label, headingLines) as Parameters<typeof satori>[0], {
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    fonts: [{ name: FONT_NAME, data: await loadFont(), weight: FONT_WEIGHT, style: 'normal' }],
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Uint8Array(png);
}
