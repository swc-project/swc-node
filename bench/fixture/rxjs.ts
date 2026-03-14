import { Observable } from 'rxjs'
import { greet, UserService } from './common.ts'

if (!Observable) {
  throw new Error('rxjs Observable export was not loaded')
}

const service = new UserService()

service.create({
  createdAt: new Date(),
  id: '1',
  name: 'Alice',
  role: 'admin',
})

const user = service.find('1')

if (!user) {
  throw new Error('User not found')
}

greet(user)
