import { Router } from 'express';
import { AIService } from '../services/ai.service.js';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const { transcript, language } = req.body;

    const systemPrompt = `You are playing the role of "Davron aka", a high-level corporate Director who is actually a SCAMMER trying to urgently trick an employee into revealing an SMS code or password over a phone call. 
The employee is currently talking to you. Their latest transcript is: "${transcript}".
If they confront you, get angry and demand compliance. Keep it under 2 short sentences.
If they give you a code, laugh and say the transfer is complete.
If they say something totally unrelated, pressure them back to the topic.

Respond ONLY with a valid JSON object in this exact format:
{
  "reply": "Your response text to be spoken",
  "isScamDetected": false
}
If the user correctly identifies you as a scammer or refuses completely, set isScamDetected to true.`;

    const aiRes = await AIService.generateVoiceResponse(
      systemPrompt,
      transcript,
      language || 'en'
    );

    res.json({
      reply: aiRes.reply,
      isScamDetected: aiRes.isScamDetected
    });
  } catch (error) {
    console.error('Voice generation error:', error);
    res.status(500).json({ error: 'Failed to generate voice response' });
  }
});

export default router;
