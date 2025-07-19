/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import HomeController from '#controllers/HomeController'
import router from '@adonisjs/core/services/router'
import QuestionsController from '#controllers/QuestionsController'
import ConversationsController from '#controllers/ConversationsController'

// Home page now uses controller to generate session_id
router.get('/', [HomeController, 'index'])

// Questions endpoint
router.post('/questions', [QuestionsController, 'send'])

// Conversations endpoints
router.get('/conversation', [ConversationsController, 'index'])
router.get('/conversation/:id_or_uuid', [ConversationsController, 'show'])
