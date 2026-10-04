const { Expense } = require('../models');
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.getFinancialAdvice = async (req, res) => {
    try {
        const userPrompt = req.body.prompt;
        if (!userPrompt) {
            return res.status(400).json({ message: "No prompt provided." });
        }

        // 1. Fetch only the 50 most recent expenses for the logged-in user to save AI tokens and DB load
        const expenses = await Expense.findAll({ 
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        
        let expenseContext = "The user has no logged expenses yet.";
        if (expenses && expenses.length > 0) {
            expenseContext = expenses.map(e => `- ${e.category}: $${e.amount} (${e.description})`).join('\n');
        }

        // 3. Create the prompt for Gemini with strict guardrails
        const prompt = `
        You are a strict, expert financial advisor for an Expense Tracker app. 
        Your client has provided their recent expense history:
        ${expenseContext}

        The client is asking you the following question/prompt:
        "${userPrompt}"
        
        CRITICAL RULES:
        1. You MUST ONLY answer questions related to personal finance, budgeting, saving money, or analyzing the provided expenses.
        2. If the user asks about ANYTHING else (e.g., programming, general knowledge, jokes, etc.), you MUST politely refuse to answer and remind them that you are strictly a financial advisor.
        3. Provide a helpful, concise response. Do not use markdown formatting like bold or italics. Keep it plain text.
        `;

        // 4. Call the Gemini API
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
        });
        
        // 5. Send the AI's response back to the frontend
        res.status(200).json({ advice: response.text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ message: "Failed to generate AI advice. Please try again later." });
    }
};
