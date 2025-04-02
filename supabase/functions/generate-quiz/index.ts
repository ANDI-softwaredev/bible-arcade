
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { v4 as uuidv4 } from "https://esm.sh/uuid@11.0.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { content, title, numQuestions, quizType } = await req.json()

    if (!content || !title || !numQuestions || !quizType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Get API key from environment variable
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Generate system prompt based on quiz type
    let systemPrompt = `You are a Bible study quiz creator. Create ${numQuestions} `

    switch (quizType) {
      case "multiple-choice":
        systemPrompt += `multiple-choice questions about the following Bible content. 
        For each question, provide 4 options (A, B, C, D) with one correct answer. 
        Format each question as a JSON object with: id, questionText, options (array), 
        correctAnswer (the full text of the correct option), explanation, and if applicable: 
        book, chapter, verse, category, topic, and difficultyLevel.`
        break
      
      case "true-false":
        systemPrompt += `true/false questions about the following Bible content.
        Format each question as a JSON object with: id, questionText, options (array with just "True" and "False"),
        correctAnswer (either "True" or "False"), explanation, and if applicable:
        book, chapter, verse, category, topic, and difficultyLevel.`
        break
        
      case "fill-in-blanks":
        systemPrompt += `fill-in-the-blank questions about the following Bible content.
        Format each question as a JSON object with: id, questionText (with a blank indicated by _____),
        correctAnswer (the word or phrase that belongs in the blank), explanation, and if applicable:
        book, chapter, verse, category, topic, and difficultyLevel.`
        break
        
      default:
        systemPrompt += `questions about the following Bible content.
        Format each question as a JSON object with appropriate fields.`
    }

    systemPrompt += `\nReturn ONLY a valid JSON array containing the questions, with no additional text.`

    // Call OpenAI API to generate questions
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: content
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json()
      console.error("OpenAI API Error:", errorData)
      return new Response(
        JSON.stringify({ error: "Failed to generate questions", details: errorData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const openAIData = await openAIResponse.json()
    
    // Extract the generated questions from the response
    let questions = []
    try {
      const contentText = openAIData.choices[0].message.content.trim()
      // Parse the JSON from the response
      questions = JSON.parse(contentText)
      
      // Add UUIDs to questions if they don't have them
      questions = questions.map(q => ({
        ...q,
        id: q.id || uuidv4()
      }))
    } catch (error) {
      console.error("Error parsing OpenAI response:", error)
      return new Response(
        JSON.stringify({ error: "Failed to parse generated questions", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
