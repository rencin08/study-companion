import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Proxying content from: ${url}`);

    // Fetch the external content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StudyFlow/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch URL: ${response.status}`);
      return new Response(
        JSON.stringify({ error: `Failed to fetch content: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentType = response.headers.get('content-type') || 'text/html';
    const html = await response.text();

    // Process HTML to make it work in our context
    // Remove scripts that might cause issues, fix relative URLs, etc.
    const processedHtml = processHtml(html, url);

    return new Response(
      JSON.stringify({ 
        html: processedHtml,
        contentType,
        originalUrl: url 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function processHtml(html: string, baseUrl: string): string {
  const url = new URL(baseUrl);
  const baseHref = `${url.protocol}//${url.host}`;
  
  // Add base tag for relative URLs
  let processed = html;
  
  // If there's no base tag, add one
  if (!/<base\s/i.test(processed)) {
    processed = processed.replace(
      /<head[^>]*>/i,
      `$&<base href="${baseHref}/">`
    );
  }
  
  // Remove potentially problematic scripts
  processed = processed.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Fix relative URLs in images
  processed = processed.replace(
    /src=["'](?!http|\/\/|data:)([^"']+)["']/gi,
    `src="${baseHref}/$1"`
  );
  
  // Fix relative URLs in links (for stylesheets)
  processed = processed.replace(
    /href=["'](?!http|\/\/|#|javascript:|mailto:)([^"']+\.css[^"']*)["']/gi,
    `href="${baseHref}/$1"`
  );
  
  // Add styles for better readability and text selection
  const styleOverrides = `
    <style>
      * { user-select: text !important; -webkit-user-select: text !important; }
      body { max-width: 100% !important; overflow-x: hidden !important; }
      ::selection { background-color: #fef08a !important; }
    </style>
  `;
  
  processed = processed.replace('</head>', `${styleOverrides}</head>`);
  
  return processed;
}
