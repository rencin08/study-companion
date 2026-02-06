import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL with Firecrawl:', formattedUrl);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true, // Focus on main content, exclude navigation
        waitFor: 5000, // Wait 5s for JS content to fully render
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let markdown = data.data?.markdown || data.markdown || '';
    
    // Clean up the markdown content - remove ads, promotions, navigation
    const cleanupPatterns = [
      // Remove promotional banners
      /🚀[^\n]*(?:Enroll|enroll)[^\n]*→?\n*/gi,
      /Use \*?\*?[A-Z0-9]+\*?\*? for \d+% off[^\n]*\n*/gi,
      // Remove "Copy page" artifacts
      /Copy page\n*/gi,
      // Remove "Sponsored by" sections
      /Sponsored by[^\n]*\n*/gi,
      // Remove course recommendation blocks
      /Related Learning[\s\S]*?(?=\n\n[A-Z]|\n\n#|$)/gi,
      /Course\\[\s\S]*?Browse Academy\n*/gi,
      /Explore All Courses[\s\S]*?Browse Academy\n*/gi,
      // Remove navigation breadcrumbs at start
      /^\[Prompt Engineering Guide\][^\n]*\n*/i,
      // Remove last updated and navigation
      /Last updated on[^\n]*\n*/gi,
      // Remove CTRL K artifacts
      /`CTRL K`\n*/g,
      // Remove multiple consecutive newlines
      /\n{4,}/g,
    ];
    
    for (const pattern of cleanupPatterns) {
      markdown = markdown.replace(pattern, '\n\n');
    }
    
    // Trim and clean up extra whitespace
    markdown = markdown.trim().replace(/\n{3,}/g, '\n\n');

    console.log('Scrape successful, cleaned content length:', markdown.length);
    
    // Return both markdown and metadata
    return new Response(
      JSON.stringify({
        success: true,
        markdown,
        html: data.data?.html || data.html,
        metadata: data.data?.metadata || data.metadata,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
