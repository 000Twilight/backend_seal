import { HttpContext } from '@adonisjs/core/http'
import Conversation from '#models/conversation'
import Messages from '#models/messages'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

export default class QuestionsController {
  public async send({ request, response }: HttpContext) {
    try {
      const { question, session_id: clientSessionId } = request.only(['question', 'session_id'])
      if (!question) {
        return response.badRequest({ error: 'Question is required' })
      }

      // Use existing session_id or create new
      let session_id = clientSessionId
      let conversation

      if (session_id) {
        conversation = await Conversation.query().where('session_id', session_id).first()
      }

      if (!conversation) {
        session_id = uuidv4()
        conversation = await Conversation.create({
          session_id,
          last_messages: question,
        })
      }

      // Store user message
      const userMessage = await Messages.create({
        sender_type: 'user',
        message: question,
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