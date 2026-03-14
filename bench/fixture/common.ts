/* ---------------------------------------------------
   Basic Types and Interfaces
--------------------------------------------------- */

export type ID = string | number

export interface Timestamped {
  createdAt: Date
  updatedAt?: Date
}

export interface User extends Timestamped {
  id: ID
  name: string
  email?: string
  role: UserRole
  metadata?: Record<string, unknown>
}

export type PartialUser = Partial<User>
export type ReadonlyUser = Readonly<User>

/* ---------------------------------------------------
   Enums
--------------------------------------------------- */

export type UserRole = (typeof UserRole)[keyof typeof UserRole]
export const UserRole = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
}

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel]
export const LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
}

/* ---------------------------------------------------
   Constants
--------------------------------------------------- */

export const APP_NAME = 'MockTSModule'
export const VERSION = '2.3.1'

export const DEFAULT_USER: ReadonlyUser = {
  id: '0',
  name: 'Guest',
  role: UserRole.VIEWER,
  createdAt: new Date(),
}

/* ---------------------------------------------------
   Utility Types
--------------------------------------------------- */

export type Nullable<T> = T | null
export type AsyncResult<T> = Promise<{ ok: true; value: T } | { ok: false; error: Error }>

export type ExtractArrayType<T> = T extends (infer U)[] ? U : never

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

/* ---------------------------------------------------
   Generics + Functions
--------------------------------------------------- */

export function identity<T>(value: T): T {
  return value
}

export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`)
}

export async function simulateAsync<T>(value: T, delay = 50): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), delay)
  })
}

export function mergeObjects<A extends object, B extends object>(a: A, b: B): A & B {
  return { ...a, ...b }
}

export function greet(user: User): string {
  return `Hello ${user.name} (${user.role})`
}

/* ---------------------------------------------------
   Class with Generics
--------------------------------------------------- */

export class Repository<T extends { id: ID }> {
  private items = new Map<ID, T>()

  add(item: T): void {
    this.items.set(item.id, item)
  }

  get(id: ID): T | undefined {
    return this.items.get(id)
  }

  remove(id: ID): boolean {
    return this.items.delete(id)
  }

  list(): T[] {
    return [...this.items.values()]
  }

  clear(): void {
    this.items.clear()
  }

  get size(): number {
    return this.items.size
  }
}

/* ---------------------------------------------------
   Abstract Classes
--------------------------------------------------- */

export abstract class Logger {
  abstract log(level: LogLevel, message: string): void

  info(msg: string) {
    this.log(LogLevel.INFO, msg)
  }

  warn(msg: string) {
    this.log(LogLevel.WARN, msg)
  }

  error(msg: string) {
    this.log(LogLevel.ERROR, msg)
  }
}

export class ConsoleLogger extends Logger {
  log(level: LogLevel, message: string) {
    console.log(`[${LogLevel[level]}] ${message}`)
  }
}

/* ---------------------------------------------------
   Class
--------------------------------------------------- */

export class UserService {
  private repo = new Repository<User>()

  create(user: User) {
    this.repo.add(user)
  }

  find(id: ID) {
    return this.repo.get(id)
  }

  list() {
    return this.repo.list()
  }
}

/* ---------------------------------------------------
   Function Overloads
--------------------------------------------------- */

export function format(value: number): string
export function format(value: Date): string
export function format(value: string): string
export function format(value: number | Date | string): string {
  if (typeof value === 'number') return value.toFixed(2)
  if (value instanceof Date) return value.toISOString()
  return value.trim()
}

/* ---------------------------------------------------
   Symbol Usage
--------------------------------------------------- */

export const INTERNAL_TOKEN = Symbol('internal')

/* ---------------------------------------------------
   Tuple + Advanced Types
--------------------------------------------------- */

export type Point = readonly [number, number]

export function distance([x1, y1]: Point, [x2, y2]: Point): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

/* ---------------------------------------------------
   Async Generator
--------------------------------------------------- */

export async function* asyncCounter(limit: number) {
  for (let i = 0; i < limit; i++) {
    await new Promise((r) => setTimeout(r, 10))
    yield i
  }
}

/* ---------------------------------------------------
   Module Augmentation Example
--------------------------------------------------- */

declare global {
  interface Window {
    __MOCK_TS_MODULE__?: boolean
  }
}

/* ---------------------------------------------------
   Default Export
--------------------------------------------------- */

export default function initialize(): UserService {
  return new UserService()
}

/* ---------------------------------------------------
   Re-exports
--------------------------------------------------- */

export { randomUUID as generateId } from 'crypto'
