
import { supabase } from "@/integrations/supabase/client";

// Define the QA pair interface
export interface QAPair {
  question: string;
  answer: string;
}

// Options for generating QA pairs
export interface QAGenerationOptions {
  numQuestions?: number;
  questionTypes?: string[];
}

/**
 * Generate QA pairs from text content
 */
export async function generateQAPairsFromText(
  text: string,
  options: QAGenerationOptions = {}
): Promise<QAPair[]> {
  try {
    const { numQuestions = 5, questionTypes = ["what", "who", "where", "when", "why", "how"] } = options;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (numQuestions) queryParams.set("num_questions", numQuestions.toString());
    if (questionTypes?.length) queryParams.set("question_types", questionTypes.join(","));
    
    // Call the Supabase edge function
    const { data, error } = await supabase.functions.invoke("generate-qa", {
      body: { text },
      query: queryParams.toString()
    });
    
    if (error) {
      console.error("Error generating QA pairs:", error);
      throw new Error(`Failed to generate QA pairs: ${error.message}`);
    }
    
    return data as QAPair[];
  } catch (error) {
    console.error("Error in generateQAPairsFromText:", error);
    throw error;
  }
}

/**
 * Generate QA pairs from PDF file
 */
export async function generateQAPairsFromPDF(
  file: File,
  options: QAGenerationOptions = {}
): Promise<QAPair[]> {
  try {
    const { numQuestions = 5, questionTypes = ["what", "who", "where", "when", "why", "how"] } = options;
    
    // Validate file type
    if (!file.type.includes("pdf")) {
      throw new Error("Only PDF files are supported");
    }
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (numQuestions) queryParams.set("num_questions", numQuestions.toString());
    if (questionTypes?.length) queryParams.set("question_types", questionTypes.join(","));
    
    // Create form data
    const formData = new FormData();
    formData.append("pdf", file);
    
    // Get the function URL
    const functionUrl = `https://oaffdjrvewnpeghuykoc.supabase.co/functions/v1/generate-qa?${queryParams.toString()}`;
    
    // Call the function directly with formData
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${(supabase.auth as any).autoRefreshToken.currentSession?.access_token || ""}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate QA pairs: ${errorText}`);
    }
    
    const data = await response.json();
    return data as QAPair[];
  } catch (error) {
    console.error("Error in generateQAPairsFromPDF:", error);
    throw error;
  }
}
