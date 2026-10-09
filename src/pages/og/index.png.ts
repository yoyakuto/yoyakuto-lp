import { SITE_NAME } from '../../consts';
import { renderOgImage } from '../../og/render';

const OG_HEADING_LINES = ['チームの空き時間を、', 'そのまま予約ページに。'];

export async function GET() {
  return new Response(await renderOgImage(SITE_NAME, OG_HEADING_LINES), { headers: { 'Content-Type': 'image/png' } });
}
