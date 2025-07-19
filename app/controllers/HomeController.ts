
import { HttpContext } from '@adonisjs/core/http'
import { v4 as uuidv4 } from 'uuid'

export default class HomeController {
  public async index({ view, request, response }: HttpContext) {
    let session_id = request.cookie('session_id')
    if (!session_id) {
      session_id = uuidv4()
      response.cookie('session_id', session_id, {
        maxAge: 60 * 5, // 5 minutes in seconds
        httpOnly: false,
        path: '/',
      })
    }
    return view.render('pages/home', { session_id })
  }
}
