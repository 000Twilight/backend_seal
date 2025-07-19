import { HttpContext } from '@adonisjs/core/http'
import Conversation from '#models/conversation'
import Messages from '#models/messages'
import axios from 'axios'

export default class QuestionsController {
  public async send({ request, response }: HttpContext) {
    try {
      const question = request.input('question')      
      const session_id = request.input('session_id')
      if (!question) {
        return response.badRequest({ error: 'Question is required' })
      }

      // Find or create conversation based on session_id
      let conversation = await Conversation.query()
        .where('session_id', session_id)
        .first()

      if (!conversation) {
        conversation = await Conversation.create({
          session_id,
          last_messages: question,
        })
      }

      // Store user message
      const userMessage = await Messages.create({
        sender_type: 'user',
        message: question,
        session_id,
      })

      // Optionally: associate message with conversation (if you have a relation)
      conversation.messages_id = userMessage.id
      conversation.last_messages = question
      await conversation.save()

      // Call external API
      const apiUrl = 'https://api.majadigidev.jatimprov.go.id/api/external/chatbot/send-message'
      let botAnswer = ''
      try {
        const apiRes = await axios.post(apiUrl, {
          question,
          additional_context: '',
          session_id,
        })
        botAnswer = apiRes.data?.data?.message?.[0]?.text || ''
      } catch (err) {
        botAnswer = 'Failed to get response from bot.'
      }

      // Store bot message
      await Messages.create({
        sender_type: 'bot',
        message: botAnswer,
        session_id,
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