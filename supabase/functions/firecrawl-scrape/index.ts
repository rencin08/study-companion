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
        formats: ['markdown', 'html', 'rawHtml'],
        onlyMainContent: true,
        waitFor: 5000,
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
    let htmlContent = data.data?.html || data.html || data.data?.rawHtml || data.rawHtml || null;
    
    // Clean up the markdown content - remove ads, promotions, navigation
    const cleanupPatterns = [
      // Remove promotional banners with emojis and enrollment CTAs
      /🚀[^\n]*(?:Enroll|enroll)[^\n]*→?\n*/gi,
      /🎯[^\n]*(?:Enroll|enroll|course|discount)[^\n]*\n*/gi,
      /Use \*?\*?[A-Z0-9]+\*?\*? for \d+% off[^\n]*\n*/gi,
      /Master building[^\n]*Enroll now[^\n]*→?\n*/gi,
      // Remove discount codes and enrollment CTAs
      /Use [A-Z0-9]+ for \d+% off[^\n]*\n*/gi,
      /Enroll now →?\n*/gi,
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
      // Remove last updated timestamps
      /Last updated on[^\n]*\n*/gi,
      /Last updated[^\n]*\n*/gi,
      /Updated on[^\n]*\n*/gi,
      // Remove CTRL K artifacts
      /`CTRL K`\n*/g,
      // Remove video embeds and iframes (keep text description)
      /\[.*?\]\(https?:\/\/(?:www\.)?(?:youtube|vimeo|dailymotion)[^\)]+\)/gi,
      /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
      /<video[^>]*>[\s\S]*?<\/video>/gi,
      // Remove multiple consecutive newlines
      /\n{4,}/g,
    ];
    
    for (const pattern of cleanupPatterns) {
      markdown = markdown.replace(pattern, '\n\n');
    }
    
    // Ensure proper paragraph spacing - add double newlines after sentences that end paragraphs
    markdown = markdown
      // Trim and clean up extra whitespace
      .trim()
      .replace(/\n{3,}/g, '\n\n')
      // Ensure paragraphs have proper spacing
      .replace(/([.!?])\n([A-Z])/g, '$1\n\n$2')
      // Fix lists that got squished
      .replace(/([^\n])\n([-*•])/g, '$1\n\n$2')
      // Ensure headers have spacing
      .replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');
    
    // Clean HTML content similarly
    if (htmlContent) {
      const htmlCleanupPatterns = [
        // Remove promotional banners
        /<[^>]*class="[^"]*(?:promo|banner|ad-|ads-|advertisement|sponsor|newsletter|subscribe|cta|enrollment)[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi,
        // Remove elements with promotional text
        /🚀[^<]*(?:Enroll|enroll)[^<]*→?/gi,
        /Master building[^<]*Enroll now[^<]*→?/gi,
        /Use [A-Z0-9]+ for \d+% off[^<]*/gi,
        // Remove last updated text
        /Last updated on[^<]*/gi,
        /Last updated[^<]*/gi,
        // Remove video elements
        /<iframe[^>]*(?:youtube|vimeo|dailymotion)[^>]*>[\s\S]*?<\/iframe>/gi,
        /<video[^>]*>[\s\S]*?<\/video>/gi,
        // Remove sponsored sections
        /Sponsored by[^<]*/gi,
      ];
      
      for (const pattern of htmlCleanupPatterns) {
        htmlContent = htmlContent.replace(pattern, '');
      }
    }

    console.log('Scrape successful, markdown length:', markdown.length, ', html length:', htmlContent?.length || 0);
    
    // Return both markdown, html, and metadata
    return new Response(
      JSON.stringify({
        success: true,
        markdown,
        html: htmlContent,
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
