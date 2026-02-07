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
    
    // Extract internal links for expandable sections (before cleanup)
    const internalLinks: Array<{text: string; url: string}> = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(markdown)) !== null) {
      const [, text, url] = match;
      // Only include links that look like topic/technique links (not navigation)
      if (url && !url.startsWith('#') && !url.includes('twitter') && !url.includes('github') && 
          !url.includes('linkedin') && text.length > 3 && text.length < 100) {
        internalLinks.push({ text: text.trim(), url });
      }
    }
    
    // Clean up the markdown content - remove ads, promotions, navigation
    const cleanupPatterns = [
      // Remove promotional banners - very aggressive patterns
      /.*🚀.*(?:Enroll|enroll|Master|Course|discount).*→?\n*/gi,
      /.*🎯.*(?:Enroll|enroll|course|discount).*\n*/gi,
      /.*Master building.*(?:Enroll|enroll).*→?\n*/gi,
      /.*Use [A-Z0-9]+ for \d+% off.*\n*/gi,
      // Remove any line with enrollment CTA
      /.*Enroll now.*→?\n*/gi,
      /.*[A-Z0-9]{6,} for \d+% off.*\n*/gi,
      // Remove "Copy page" artifacts
      /Copy page\n*/gi,
      // Remove "Sponsored by" sections
      /.*Sponsored by.*\n*/gi,
      // Remove course recommendation blocks
      /Related Learning[\s\S]*?(?=\n\n[A-Z]|\n\n#|$)/gi,
      /Course\\[\s\S]*?Browse Academy\n*/gi,
      /Explore All Courses[\s\S]*?Browse Academy\n*/gi,
      // Remove navigation breadcrumbs at start
      /^\[Prompt Engineering Guide\][^\n]*\n*/i,
      // Remove last updated timestamps
      /.*Last updated on.*\n*/gi,
      /.*Last updated.*\n*/gi,
      /.*Updated on.*\n*/gi,
      // Remove CTRL K artifacts
      /`CTRL K`\n*/g,
      // Remove video embeds and iframes (keep text description)
      /\[.*?\]\(https?:\/\/(?:www\.)?(?:youtube|vimeo|dailymotion)[^\)]+\)/gi,
      /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
      /<video[^>]*>[\s\S]*?<\/video>/gi,
      // Remove Examples of Prompts navigation links at bottom
      /Examples of Prompts[^\n]*\n*/gi,
      // Remove multiple consecutive newlines
      /\n{4,}/g,
    ];
    
    for (const pattern of cleanupPatterns) {
      markdown = markdown.replace(pattern, '\n\n');
    }
    
    // Ensure proper paragraph spacing
    markdown = markdown
      .trim()
      .replace(/\n{3,}/g, '\n\n')
      .replace(/([.!?])\n([A-Z])/g, '$1\n\n$2')
      .replace(/([^\n])\n([-*•])/g, '$1\n\n$2')
      .replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');
    
    // Clean HTML content - remove ads, banners, and topic links
    if (htmlContent) {
      const htmlCleanupPatterns = [
        // Remove promotional banners and CTAs - including purple background divs
        /<div[^>]*(?:style="[^"]*background[^"]*purple[^"]*"|class="[^"]*(?:promo|banner|ad|cta|enroll)[^"]*")[^>]*>[\s\S]*?<\/div>/gi,
        /<[^>]*class="[^"]*(?:promo|banner|ad-|ads-|advertisement|sponsor|newsletter|subscribe|cta|enrollment|discount)[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi,
        // Remove elements with background styles (promotional banners)
        /<[^>]*style="[^"]*background[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi,
        // Remove elements with promotional text
        /🚀[^<]*(?:Enroll|enroll|Master|Course|discount)[^<]*→?/gi,
        /Master building[^<]*(?:Enroll|Claude)[^<]*→?/gi,
        /Use [A-Z0-9]+ for \d+% off[^<]*/gi,
        /Enroll now[^<]*→?/gi,
        /EARLYBIRDCC3[^<]*/gi,
        /20% off[^<]*/gi,
        // Remove last updated text
        /Last updated on[^<]*/gi,
        /Last updated[^<]*/gi,
        // Remove video elements
        /<iframe[^>]*(?:youtube|vimeo|dailymotion)[^>]*>[\s\S]*?<\/iframe>/gi,
        /<video[^>]*>[\s\S]*?<\/video>/gi,
        // Remove sponsored sections
        /Sponsored by[^<]*/gi,
        // Remove navigation footer links
        /Examples of Prompts[^<]*/gi,
        // Remove topic navigation links (they'll be shown as cards)
        /<a[^>]*href="[^"]*(?:prompting|reasoning|generation|thought|chain|shot|knowledge|retrieval|reflexion|multimodal|consistency|stimulus|engineer|graph|react|aided)[^"]*"[^>]*>[^<]*<\/a>/gi,
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
