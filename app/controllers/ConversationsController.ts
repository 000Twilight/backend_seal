import { HttpContext } from '@adonisjs/core/http'
import Conversation from '#models/conversation'
import Messages from '#models/messages'

export default class ConversationsController {
  public async index({ response }: HttpContext) {
    const conversations = await Conversation.all()
    return response.ok(conversations)
  }

  public async show({ params, response }: HttpContext) {
    const { id_or_uuid } = params
    const conversation = await Conversation.query()
      .where('id', id_or_uuid)
      .orWhere('session_id', id_or_uuid)
      .first()
    if (!conversation) {
      return response.notFound({ error: 'Conversation not found' })
    }
    // Get all messages for this conversation (by session_id)
    const messages = await Messages.query()
      .join('conversations', 'messages.id', '=', 'conversations.messages_id')
      .where('conversations.session_id', conversation.session_id)
      .select('messages.*')
    return response.ok(messages)
  }
}
