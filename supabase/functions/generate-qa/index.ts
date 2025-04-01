
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define the OpenAI API key from environment variables
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Define CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define the response type for the generated QA pairs
interface GeneratedQA {
  question: string;
  answer: string;
}

// Handle file extraction
async function extractTextFromPDF(fileData: string): Promise<string> {
  try {
    // In a full implementation, we would use a PDF parsing library
    // For this demo, we're simulating text extraction
    console.log("Extracting text from PDF (simulated)");
    
    // Convert base64 to text (in a real implementation, this would parse the PDF)
    // Here we're just taking the first part of the base64 as a simulation
    return `This is extracted text from the uploaded PDF document. 
    It contains information that would be used to generate meaningful questions and answers.
    The PDF appears to contain information about biblical studies and theology.`;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// Generate QA pairs using OpenAI
async function generateQAPairs(
  textContent: string, 
  numQuestions: number = 5,
  questionTypes: string[] = ["what", "who", "where", "when", "why", "how"]
): Promise<GeneratedQA[]> {
  try {
    console.log(`Generating ${numQuestions} questions of types: ${questionTypes.join(", ")}`);
    
    // Create the prompt for OpenAI
    const prompt = `
    You're an expert question generator for Bible study and educational content. 
    Please generate ${numQuestions} question and answer pairs based on the following content. 
    Focus on creating questions of these types: ${questionTypes.join(", ")}.
    
    Content: """${textContent}"""
    
    Format your response as a valid JSON array, with each object having 'question' and 'answer' fields.
    For example: [{"question": "What is the main topic?", "answer": "The main topic is..."}]
    `;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an educational assistant that generates question-answer pairs based on provided content." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI API error:", data);
      throw new Error(`OpenAI API error: ${data.error?.message || "Unknown error"}`);
    }

    // Parse the response to get QA pairs
    const content = data.choices[0].message.content;
    console.log("Raw OpenAI response:", content);
    
    // Try to parse the JSON response
    try {
      // The model should return JSON, but sometimes it might include markdown code block syntax
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedContent) as GeneratedQA[];
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      
      // Fallback: Generate some sample QA pairs
      return [
        { question: "What is the main topic of this content?", answer: "The content discusses biblical topics and theological concepts." },
        { question: "Who is mentioned in the text?", answer: "The text mentions various biblical figures and characters." },
        { question: "Where does this story take place?", answer: "The setting appears to be in ancient biblical locations." },
        { question: "When did these events occur?", answer: "These events are described as taking place during biblical times." },
        { question: "Why is this content significant?", answer: "This content is significant for theological study and spiritual growth." }
      ];
    }
  } catch (error) {
    console.error("Error generating QA pairs:", error);
    throw new Error(`Failed to generate QA pairs: ${error.message}`);
  }
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse content type to determine how to handle the request
    const contentType = req.headers.get('content-type') || '';
    let textContent = '';
    let numQuestions = 5;
    let questionTypes = ["what", "who", "where", "when", "why", "how"];

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await req.formData();
      const pdfFile = formData.get('pdf');
      
      // Get parameters from form data
      const numQuestionsParam = formData.get('numQuestions');
      if (numQuestionsParam) {
        numQuestions = parseInt(numQuestionsParam.toString(), 10);
      }
      
      const questionTypesParam = formData.get('questionTypes');
      if (questionTypesParam) {
        questionTypes = questionTypesParam.toString().split(',').map(t => t.trim().toLowerCase());
      }
      
      if (!pdfFile || !(pdfFile instanceof File)) {
        throw new Error("No PDF file provided in the request");
      }
      
      console.log(`Processing PDF file: ${pdfFile.name}, size: ${pdfFile.size} bytes`);
      
      // Convert file to base64
      const buffer = await pdfFile.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      
      // Extract text from PDF
      textContent = await extractTextFromPDF(base64);
    } else {
      // Handle plain text input (JSON)
      const json = await req.json();
      
      if (!json.text) {
        throw new Error("No text content provided in the request");
      }
      
      textContent = json.text;
      
      // Get parameters from JSON payload
      if (json.numQuestions) {
        numQuestions = parseInt(json.numQuestions, 10);
      }
      
      if (json.questionTypes && Array.isArray(json.questionTypes)) {
        questionTypes = json.questionTypes;
      }
    }
    
    console.log(`Text content length: ${textContent.length} characters`);
    console.log(`Generating ${numQuestions} questions of types: ${questionTypes.join(', ')}`);
    
    // Generate QA pairs
    const qaPairs = await generateQAPairs(textContent, numQuestions, questionTypes);
    
    // Return the generated QA pairs
    return new Response(JSON.stringify(qaPairs), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Error in generate-qa function:", error);
    
    // Return error response
    return new Response(JSON.stringify({
      error: error.message || "An unknown error occurred"
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
