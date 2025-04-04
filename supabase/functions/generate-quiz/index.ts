
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
        correctAnswer (the full text of the correct option), explanation, book, chapter, verse, 
        category (like "Old Testament History", "Gospel", etc.), and
        topic (like "Creation", "Sermon on the Mount", etc.).`
        break
      
      case "true-false":
        systemPrompt += `true/false questions about the following Bible content.
        Format each question as a JSON object with: id, questionText, options (array with just "True" and "False"),
        correctAnswer (either "True" or "False"), explanation, book, chapter, verse, 
        category (like "Old Testament History", "Gospel", etc.), and
        topic (like "Creation", "Sermon on the Mount", etc.).`
        break
        
      case "fill-in-blanks":
        systemPrompt += `fill-in-the-blank questions about the following Bible content.
        Format each question as a JSON object with: id, questionText (with a blank indicated by _____),
        correctAnswer (the word or phrase that belongs in the blank), explanation, book, chapter, verse, 
        category (like "Old Testament History", "Gospel", etc.), and
        topic (like "Creation", "Sermon on the Mount", etc.).`
        break
        
      default:
        systemPrompt += `questions about the following Bible content.
        Format each question as a JSON object with appropriate fields.`
    }

    systemPrompt += `\nReturn ONLY a valid JSON array containing the questions, with no additional text or formatting. Make sure your response starts with '[' and ends with ']'. Do not include any explanation or code block markers.`

    // Call OpenAI API to generate questions
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
        max_tokens: 3000,
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
    
    if (!openAIData || !openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
      console.error("Invalid response from OpenAI:", openAIData)
      return new Response(
        JSON.stringify({ error: "Invalid response from OpenAI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    // Extract the generated questions from the response
    let questions = []
    try {
      const contentText = openAIData.choices[0].message.content.trim()
      
      // Check if response is empty
      if (!contentText) {
        throw new Error("OpenAI returned an empty response")
      }
      
      // Attempt to clean up the response if it's not valid JSON
      let cleanedText = contentText
      
      // Remove any markdown code block indicators
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.substring(7)
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.substring(3)
      }
      
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3)
      }
      
      // Ensure the content is a valid JSON array
      if (!cleanedText.startsWith("[") && !cleanedText.endsWith("]")) {
        if (cleanedText.includes("[") && cleanedText.includes("]")) {
          // Extract the array portion if it exists somewhere in the text
          const startIdx = cleanedText.indexOf("[")
          const endIdx = cleanedText.lastIndexOf("]") + 1
          cleanedText = cleanedText.substring(startIdx, endIdx)
        } else {
          // Try to wrap the content in array brackets
          cleanedText = `[${cleanedText}]`
        }
      }
      
      // Further cleanup: ensure we have valid JSON by escaping quotes in strings
      cleanedText = cleanedText.replace(/\\(?!["\\/bfnrt])/g, "\\\\")
      
      // Trim again after cleanup
      cleanedText = cleanedText.trim()
      
      console.log("Attempting to parse JSON:", cleanedText.substring(0, 100) + "...")
      
      // Parse the JSON from the response
      questions = JSON.parse(cleanedText)
      
      // If the response is not an array, wrap it in an array
      if (!Array.isArray(questions)) {
        if (typeof questions === 'object') {
          questions = [questions]
        } else {
          throw new Error("Response is not a valid JSON array or object")
        }
      }
      
      // Add UUIDs to questions if they don't have them
      questions = questions.map(q => ({
        ...q,
        id: q.id || uuidv4(),
        // Ensure these fields exist, even if empty
        category: q.category || "",
        topic: q.topic || "",
        book: q.book || "",
        chapter: q.chapter || null,
        verse: q.verse || null,
      }))
      
      // Validate that all required fields are present
      questions.forEach(q => {
        if (!q.questionText || !q.correctAnswer) {
          throw new Error("Question missing required fields")
        }
      })
    } catch (error) {
      console.error("Error parsing OpenAI response:", error)
      console.error("Raw response:", openAIData.choices[0].message.content)
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse generated questions", 
          details: error.message,
          rawResponse: openAIData.choices[0].message.content.substring(0, 500) // Include part of the raw response for debugging
        }),
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
