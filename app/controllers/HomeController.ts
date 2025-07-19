import { HttpContext } from '@adonisjs/core/http'
import { v4 as uuidv4 } from 'uuid'

export default class HomeController {
  public async index({ view }: HttpContext) {
    // Generate a new session_id for each page load
    const session_id = uuidv4()
    return view.render('pages/home', { session_id })
  }
}
