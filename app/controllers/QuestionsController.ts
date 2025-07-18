import { HttpContext } from '@adonisjs/core/http'
import Conversation from '#models/conversation'
import Messages from '#models/messages'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

export default class QuestionsController {
  public async send({ request, response }: HttpContext) {
    try {
      const { question } = request.only(['question'])
      if (!question) {
        return response.badRequest({ error: 'Question is required' })
      }

      // Create session_id
      const session_id = uuidv4()

      // Store user message
      const userMessage = await Messages.create({
        sender_type: 'user',
        message: question,
      })

      // Create conversation
      const conversation = await Conversation.create({
        session_id,
        messages_id: userMessage.id,
        last_messages: question,
      })

      // Call external API
      const apiUrl = 'https://api.majadigidev.jatimprov.go.id/api/external/chatbot/send-message'
      let botAnswer = ''
      try {
        const apiRes = await axios.post(apiUrl, {
          question,
          additional_context: '',
          session_id,
        })
        // Extract answer from the correct path
        botAnswer = apiRes.data?.data?.message?.[0]?.text || ''
      } catch (err) {
        botAnswer = 'Failed to get response from bot.'
      }

      // Store bot message
      await Messages.create({
        sender_type: 'bot',
        message: botAnswer,
      })

      // Update conversation last message
      conversation.last_messages = botAnswer
      await conversation.save()

      return response.ok({
        session_id,
        question,
        answer: botAnswer,
      })
    } catch (err) {
      console.error('QuestionsController.send error:', err)
      return response.status(500).json({ error: 'Internal server error', details: err.message })
    }
  }
}