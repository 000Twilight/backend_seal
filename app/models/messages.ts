import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Messages extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sender_type: 'user' | 'bot'

  @column()
  declare message: string

  @column()
  declare session_id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}