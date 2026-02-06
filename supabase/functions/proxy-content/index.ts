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
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Proxying content from: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`Failed to fetch URL: ${response.status}`);
      return new Response(
        JSON.stringify({ error: `Failed to fetch content: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    
    // Extract readable content from the HTML
    const extractedContent = extractReadableContent(html, url);

    return new Response(
      JSON.stringify({ 
        html: extractedContent,
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

function extractReadableContent(html: string, baseUrl: string): string {
  const urlObj = new URL(baseUrl);
  const baseHref = `${urlObj.protocol}//${urlObj.host}`;
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Article';
  
  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : '';

  // Try to find main content areas (common patterns)
  let mainContent = '';
  
  // Look for article, main, or content divs
  const contentPatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    /<main[^>]*>([\s\S]*?)<\/main>/gi,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<div[^>]*id="content"[^>]*>([\s\S]*?)<\/div>/gi,
  ];

  for (const pattern of contentPatterns) {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      // Take the largest match as it's likely the main content
      const largest = matches.reduce((a, b) => a.length > b.length ? a : b);
      if (largest.length > mainContent.length) {
        mainContent = largest;
      }
    }
  }

  // If no main content found, extract all paragraphs and headings
  if (!mainContent || mainContent.length < 500) {
    const paragraphs: string[] = [];
    
    // Extract headings
    const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
    let match;
    while ((match = headingRegex.exec(html)) !== null) {
      const text = stripHtml(match[2]).trim();
      if (text.length > 3 && !isNavigationText(text)) {
        paragraphs.push(`<h${match[1]}>${text}</h${match[1]}>`);
      }
    }

    // Extract paragraphs
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    while ((match = pRegex.exec(html)) !== null) {
      const text = stripHtml(match[1]).trim();
      if (text.length > 30 && !isNavigationText(text)) {
        paragraphs.push(`<p>${text}</p>`);
      }
    }

    // Extract list items with content
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    while ((match = liRegex.exec(html)) !== null) {
      const text = stripHtml(match[1]).trim();
      if (text.length > 20 && !isNavigationText(text)) {
        paragraphs.push(`<li>${text}</li>`);
      }
    }

    if (paragraphs.length > 0) {
      mainContent = paragraphs.join('\n');
    }
  } else {
    // Clean the main content
    mainContent = cleanHtml(mainContent);
  }

  // Build the final HTML
  const finalHtml = `
    <div class="proxied-content" style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.7; max-width: 100%; padding: 1rem;">
      <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb;">
        <h1 style="font-size: 1.75rem; font-weight: 600; margin-bottom: 0.5rem; color: inherit;">${escapeHtml(title)}</h1>
        ${description ? `<p style="color: #6b7280; font-size: 0.95rem; margin: 0;">${escapeHtml(description)}</p>` : ''}
        <a href="${baseUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 0.75rem; font-size: 0.875rem; color: #3b82f6; text-decoration: none;">
          View original article →
        </a>
      </div>
      <div class="article-content" style="color: inherit;">
        ${mainContent || '<p style="color: #6b7280;">Could not extract content. Please view the original article using the link above.</p>'}
      </div>
      <style>
        .proxied-content * { user-select: text !important; -webkit-user-select: text !important; }
        .proxied-content ::selection { background-color: #fef08a !important; }
        .proxied-content h1, .proxied-content h2, .proxied-content h3 { margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 600; }
        .proxied-content h2 { font-size: 1.375rem; }
        .proxied-content h3 { font-size: 1.125rem; }
        .proxied-content p { margin-bottom: 1rem; }
        .proxied-content ul, .proxied-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
        .proxied-content li { margin-bottom: 0.5rem; }
        .proxied-content a { color: #3b82f6; }
        .proxied-content code { background: #f3f4f6; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; }
        .proxied-content pre { background: #1f2937; color: #e5e7eb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; }
        .proxied-content blockquote { border-left: 3px solid #d1d5db; padding-left: 1rem; margin: 1rem 0; font-style: italic; }
      </style>
    </div>
  `;

  return finalHtml;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanHtml(html: string): string {
  return html
    // Remove scripts and styles
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    // Remove navigation, header, footer
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    // Remove forms and buttons
    .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '')
    .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '')
    // Remove iframes
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    // Remove inline event handlers
    .replace(/\s+on\w+="[^"]*"/gi, '')
    .replace(/\s+on\w+='[^']*'/gi, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

function isNavigationText(text: string): boolean {
  const navPatterns = [
    /^(home|menu|navigation|sign in|sign up|log in|log out|subscribe|follow|share|tweet|facebook)/i,
    /^(next|previous|back|forward|skip|close|cancel|submit|search)$/i,
    /^(cookie|privacy|terms|policy)/i,
    /^\d+\s*(min|sec|hour|day|week|month|year)/i,
  ];
  return navPatterns.some(p => p.test(text));
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
