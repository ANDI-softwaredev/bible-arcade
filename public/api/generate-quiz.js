
export function GET(req) {
  return Response.redirect('https://oaffdjrvewnpeghuykoc.functions.supabase.co/generate-quiz');
}

export function POST(req) {
  return Response.redirect('https://oaffdjrvewnpeghuykoc.functions.supabase.co/generate-quiz');
}

export function OPTIONS(req) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
