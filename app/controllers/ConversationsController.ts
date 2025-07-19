import { HttpContext } from '@adonisjs/core/http'
import Conversation from '#models/conversation'
import Messages from '#models/messages'

export default class ConversationsController {
  public async index({ request, view, response }: HttpContext) {
    const search = request.input('search')
    let query = Conversation.query()
    if (search) {
      query = query
        .where('last_messages', 'like', `%${search}%`)
    }
    const conversations = await query.orderBy('created_at', 'desc')
    // If HTML requested, render view; else return JSON
    if (request.accepts(['html', 'json']) === 'html') {
      return view.render('pages/conversation', { conversations, search })
    }
    return response.ok(conversations)
  }

  public async show({ params, view, response, request }: HttpContext) {
    const { id_or_uuid } = params
    const conversation = await Conversation.query()
      .where('id', id_or_uuid)
      .first()
    if (!conversation) {
      return response.notFound({ error: 'Conversation not found' })
    }
    const messages = await Messages.query()
      .join('conversations', 'messages.id', '=', 'conversations.messages_id')
      .where('conversations.session_id', conversation.session_id)
      .select('messages.*')
    if (request.accepts(['html', 'json']) === 'html') {
      return view.render('pages/conversation_messages', { conversation, messages })
    }
    return response.ok(messages)
  }
}
