import { SITE_NAME } from '../../consts';
import { renderOgImage } from '../../og/render';

const OG_LABEL = `${SITE_NAME} チームの日程調整サービス`;
const OG_HEADING_LINES = ['チームの空き時間を、', 'そのまま予約ページに。'];
const OG_SLOTS = ['14:00', '14:30', '16:00', '17:30'];

export async function GET() {
  return new Response(await renderOgImage(OG_LABEL, OG_HEADING_LINES, OG_SLOTS), {
    headers: { 'Content-Type': 'image/png' },
  });
}
