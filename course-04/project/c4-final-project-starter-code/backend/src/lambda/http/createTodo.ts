import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../helpers/todos'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {   
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    if(! newTodo.name) {
      logger.info('Skipped as Task name is blank')
      return {
        statusCode: 200,
        body: JSON.stringify({
          //item: {"todoId", "userId", "name", "dueDate", new Date().toISOString(), false}
          item: {}
        })
      }
    }

    let userId = getUserId(event)

    // Create new TODO
    const { todoId, name, dueDate, createdAt, done } = await createTodo(userId, newTodo)
    logger.info('Created new TODO for userId', userId)

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        item: { todoId, name, dueDate, createdAt, done }
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
