import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface EnrichmentResponse {
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  signals: Array<{
    type: string;
    description: string;
    confidence: "high" | "medium" | "low";
  }>;
  sources: Array<{
    url: string;
    timestamp: string;
  }>;
  enrichedAt: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  // Validate URL format
  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  // Only allow public HTTP/HTTPS URLs
  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    return NextResponse.json({ error: "Only HTTP/HTTPS URLs are allowed" }, { status: 400 });
  }

  try {
    // Fetch the webpage
    const response = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const timestamp = new Date().toISOString();

    // Extract text content (simple approach - remove script/style tags and get text)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 5000); // Limit to first 5000 chars

    // Use OpenAI API if available, otherwise use a simple extraction
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (openaiApiKey) {
      try {
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert at analyzing company websites and extracting structured information. Extract key information about the company from the provided website content.",
              },
              {
                role: "user",
                content: `Analyze this company website content and extract:
1. A 1-2 sentence summary of what the company does
2. 3-6 bullet points describing what they do
3. 5-10 relevant keywords
4. 2-4 derived signals (e.g., "careers page exists", "recent blog post", "changelog present", "product launch", etc.) with confidence levels

Website content (first 5000 chars):
${textContent}

Respond in JSON format:
{
  "summary": "...",
  "whatTheyDo": ["...", "..."],
  "keywords": ["...", "..."],
  "signals": [
    {"type": "...", "description": "...", "confidence": "high|medium|low"}
  ]
}`,
              },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          const content = openaiData.choices[0]?.message?.content;

          if (content) {
            try {
              const extracted = JSON.parse(content);
              const result: EnrichmentResponse = {
                summary: extracted.summary || "No summary available.",
                whatTheyDo: extracted.whatTheyDo || [],
                keywords: extracted.keywords || [],
                signals: extracted.signals || [],
                sources: [
                  {
                    url: targetUrl.toString(),
                    timestamp,
                  },
                ],
                enrichedAt: timestamp,
              };
              return NextResponse.json(result);
            } catch (parseError) {
              console.error("Failed to parse OpenAI response:", parseError);
            }
          }
        }
      } catch (openaiError) {
        console.error("OpenAI API error:", openaiError);
        // Fall through to simple extraction
      }
    }

    // Fallback: Simple extraction without AI
    const words = textContent.toLowerCase().split(/\s+/);
    const commonWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "should",
      "could",
      "may",
      "might",
      "must",
      "can",
      "this",
      "that",
      "these",
      "those",
    ]);

    const wordFreq: Record<string, number> = {};
    words.forEach((word) => {
      const clean = word.replace(/[^\w]/g, "");
      if (clean.length > 4 && !commonWords.has(clean)) {
        wordFreq[clean] = (wordFreq[clean] || 0) + 1;
      }
    });

    const keywords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    // Simple signals detection
    const signals = [];
    if (html.toLowerCase().includes("career") || html.toLowerCase().includes("job")) {
      signals.push({
        type: "Careers Page",
        description: "Company has a careers or jobs page, indicating active hiring",
        confidence: "high" as const,
      });
    }
    if (html.toLowerCase().includes("blog")) {
      signals.push({
        type: "Blog Present",
        description: "Company maintains a blog for content marketing",
        confidence: "medium" as const,
      });
    }
    if (html.toLowerCase().includes("changelog") || html.toLowerCase().includes("update")) {
      signals.push({
        type: "Product Updates",
        description: "Company publishes product updates or changelogs",
        confidence: "medium" as const,
      });
    }
    if (signals.length === 0) {
      signals.push({
        type: "Website Active",
        description: "Company website is accessible and contains content",
        confidence: "high" as const,
      });
    }

    const result: EnrichmentResponse = {
      summary: textContent.substring(0, 200) + "...",
      whatTheyDo: [
        "Provides services and solutions",
        "Maintains an active web presence",
        "Engages with customers online",
      ],
      keywords: keywords.length > 0 ? keywords : ["company", "business", "services"],
      signals,
      sources: [
        {
          url: targetUrl.toString(),
          timestamp,
        },
      ],
      enrichedAt: timestamp,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Enrichment error:", error);
    return NextResponse.json(
      {
        error: "Failed to enrich company data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
