import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface RequestBody {
  userQuery: string;
  favorites: Array<{
    title: string;
    genres: string[];
    overview: string | null;
  }>;
  watched: Array<{ title: string; genres: string[]; overview: string | null }>;
  ratings: Array<{ title: string; rating: number; genres: string[] }>;
}

serve(async (req) => {
  try {
    //CORS headers
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
        },
      });
    }

    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const body: RequestBody = await req.json();

    const favoritesText =
      body.favorites.length > 0
        ? `Favorites movies: ${body.favorites.map((f) => f.title).join(", ")}`
        : "No favorite movies yet.";

    const watchedText =
      body.watched.length > 0
        ? `Watched movies: ${body.watched.map((w) => w.title).join(", ")}`
        : "No watched movies yet.";

    const ratingsText =
      body.ratings.length > 0
        ? `Rated movies: ${body.ratings
            .map((r) => `${r.title} (${r.rating}/5)`)
            .join(", ")}`
        : "No rated movies yet.";

    const prompt = `You are a movie recommendation assistant. Based on the user's request and their movie preferences, suggest 10-15 specific movie titles.
      
      User Request: "${body.userQuery}"
      
      User's Movie Preferences:
      ${favoritesText}
      ${watchedText}
      ${ratingsText}
      
      Based on this information, recommend 10-15 specific movie titles that match the user's request and align with their preferences. Return ONLY a JSON array of movie titles, nothing else. Example format: ["Movie Title 1", "Movie Title 2", "Movie Title 3"]`;

    //Send request to Groq API
    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful movie recommendation assistant. Always respond with a valid JSON array of movie titles.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("GROQ API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get recommendation from AI" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const groqData = await groqResponse.json();
    const aiResponse = groqData.choices[0]?.message?.content || "[]";

    let recommendedMovies: string[] = [];
    try {
      // Extract JSON Array from AI response
      let jsonString = aiResponse.trim();
      
      // Find the JSON array in the response
      const jsonMatch = jsonString.match(/\[.*\]/s);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }

      // Try to fix common JSON issues
      // Remove any trailing incomplete strings
      jsonString = jsonString.replace(/,\s*"[^"]*$/g, ''); // Remove incomplete last item
      jsonString = jsonString.replace(/,\s*$/g, ''); // Remove trailing comma
      
      // Fix unterminated strings at the end
      if (jsonString.endsWith('"') === false && jsonString.includes('"')) {
        // Find the last quote and see if it's properly closed
        const lastQuoteIndex = jsonString.lastIndexOf('"');
        const afterLastQuote = jsonString.substring(lastQuoteIndex + 1);
        // If there's text after last quote but before closing bracket, it's likely incomplete
        if (afterLastQuote.includes(']') && !afterLastQuote.trim().startsWith(']')) {
          // Remove the incomplete item
          const beforeLastQuote = jsonString.substring(0, lastQuoteIndex + 1);
          jsonString = beforeLastQuote + ']';
        }
      }

      // Try to parse
      try {
        recommendedMovies = JSON.parse(jsonString);
      } catch (firstParseError) {
        // If still fails, try manual extraction
        console.warn("First parse attempt failed, trying manual extraction");
        
        // Extract all quoted strings from the array
        const stringMatches = jsonString.match(/"([^"]*)"/g);
        if (stringMatches) {
          recommendedMovies = stringMatches.map(match => 
            match.slice(1, -1) // Remove quotes
          ).filter(title => title.trim().length > 0);
        } else {
          throw firstParseError;
        }
      }

      // Validate that we got an array
      if (!Array.isArray(recommendedMovies)) {
        recommendedMovies = [];
      }

      console.log("Successfully parsed", recommendedMovies.length, "movies");
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw AI response:", aiResponse);
      
      // Last resort: try to extract movie titles manually
      try {
        const titleMatches = aiResponse.match(/"([^"]{2,})"/g);
        if (titleMatches) {
          recommendedMovies = titleMatches.map(match => match.slice(1, -1));
          console.log("Fallback: extracted", recommendedMovies.length, "titles manually");
        } else {
          throw parseError;
        }
      } catch (fallbackError) {
        return new Response(
          JSON.stringify({ 
            error: "Failed to parse AI recommendations",
            details: String(parseError)
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    }

    return new Response(JSON.stringify({ recommendedMovies }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error in AI recommendations function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
