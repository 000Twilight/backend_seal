/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import QuestionsController from '#controllers/QuestionsController'
import ConversationsController from '#controllers/ConversationsController'

router.on('/').render('pages/home')

// Questions endpoint
router.post('/questions', [QuestionsController, 'send'])

// Conversations endpoints
router.get('/conversation', [ConversationsController, 'index'])
router.get('/conversation/:id_or_uuid', [ConversationsController, 'show'])
