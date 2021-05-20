'use strict'
const {
  applyBind,
  Object,
  ObjectDefineProperties,
  ObjectPrototypeHasOwnProperty,
  FunctionPrototypeBind,
  FunctionPrototypeSymbolHasInstance,
  Symbol,
  SymbolIterator,
  SymbolToStringTag,
  SymbolSafeIterator,
  SymbolPrototypeToString,
  TypeError,
  String,
  StringPrototypeReplace,
  StringPrototypeSplit,
  StringPrototypeSafeMatchAll,
  RegExpPrototypeTest,
  ArrayFrom,
  ArrayIsArray,
  ArrayPrototypeEntries,
  ArrayPrototypeKeys,
  ArrayPrototypePush,
  ArrayPrototypeValues,
  ArrayPrototypePushApply,
  ArrayPrototypeSafeEntries,
  ArrayPrototypeSafeKeys,
  ArrayPrototypeSafeValues,
  ReflectDeleteProperty,
  ReflectGet,
  ReflectHas,
  ReflectSet,
  PrimitivesIsSymbol,
  TypesIsPrimitive,
  TypesIsIndexKey,
  TypesToPropertyKey
} = require('@darkwolf/primordials')

const pathSymbol = Symbol('path')

const parse = string => {
  string = String(string)
  if (!RegExpPrototypeTest(/[[\]]/, string)) {
    return StringPrototypeSplit(string, '.')
  }
  const result = []
  if (string[0] === '.') {
    ArrayPrototypePush(result, '')
  }
  const matches = StringPrototypeSafeMatchAll(string, /[^.[\]]+|\[([^'"][^[]*|(['"])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g)
  for (const match of matches) {
    const [key, expression, quote, property] = match
    ArrayPrototypePush(result,
      property !== undefined ? StringPrototypeReplace(property, /\\(\\)?/g, '$1') :
      expression !== undefined ? expression : key
    )
  }
  return result
}

const toPath = (...paths) => {
  const result = []
  for (const path of ArrayPrototypeSafeValues(paths)) {
    if (isKeyPath(path)) {
      ArrayPrototypePushApply(result, path[pathSymbol])
    } else if (ArrayIsArray(path)) {
      for (const key of ArrayPrototypeSafeValues(path)) {
        ArrayPrototypePush(result, TypesToPropertyKey(key))
      }
    } else {
      const key = TypesToPropertyKey(path)
      if (PrimitivesIsSymbol(key)) {
        ArrayPrototypePush(result, key)
      } else {
        ArrayPrototypePushApply(result, parse(key))
      }
    }
  }
  return result
}
const toPathApply = applyBind(toPath, null)

const get = (target, path) => {
  if (target == null) {
    throw new TypeError('The target cannot be undefined or null')
  }
  path = isKeyPath(path) ? path[pathSymbol] : toPath(path)
  const lastIndex = path.length - 1
  let index = 0
  for (const key of ArrayPrototypeSafeValues(path)) {
    const property = ReflectGet(Object(target), key)
    if (index < lastIndex) {
      if (property == null) {
        return
      }
      target = property
    } else {
      return property
    }
    index++
  }
}

const set = (target, path, value) => {
  if (TypesIsPrimitive(target)) {
    throw new TypeError('The target must be an object')
  }
  path = isKeyPath(path) ? path[pathSymbol] : toPath(path)
  const lastIndex = path.length - 1
  let index = 0
  for (const key of ArrayPrototypeSafeValues(path)) {
    if (index < lastIndex) {
      const property = ReflectGet(target, key)
      if (TypesIsPrimitive(property)) {
        const nextKey = path[index + 1]
        const set = ReflectSet(target, key, TypesIsIndexKey(nextKey) ? [] : {})
        if (!set) {
          return false
        }
        target = ReflectGet(target, key)
      } else {
        target = property
      }
    } else {
      return ReflectSet(target, key, value)
    }
    index++
  }
}

const $delete = (target, path) => {
  if (TypesIsPrimitive(target)) {
    throw new TypeError('The target must be an object')
  }
  path = isKeyPath(path) ? path[pathSymbol] : toPath(path)
  const lastIndex = path.length - 1
  let index = 0
  for (const key of ArrayPrototypeSafeValues(path)) {
    if (index < lastIndex) {
      const property = ReflectGet(target, key)
      if (TypesIsPrimitive(property)) {
        return false
      }
      target = property
    } else {
      return ReflectDeleteProperty(target, key)
    }
    index++
  }
}

const has = (target, path) => {
  if (target == null) {
    throw new TypeError('The target cannot be undefined or null')
  }
  path = isKeyPath(path) ? path[pathSymbol] : toPath(path)
  const lastIndex = path.length - 1
  let index = 0
  for (const key of ArrayPrototypeSafeValues(path)) {
    if (index < lastIndex) {
      const property = ReflectGet(Object(target), key)
      if (property == null) {
        return false
      }
      target = property
    } else {
      return ObjectPrototypeHasOwnProperty(target, key)
    }
    index++
  }
}

const hasIn = (target, path) => {
  if (target == null) {
    throw new TypeError('The target cannot be undefined or null')
  }
  path = isKeyPath(path) ? path[pathSymbol] : toPath(path)
  const lastIndex = path.length - 1
  let index = 0
  for (const key of ArrayPrototypeSafeValues(path)) {
    if (index < lastIndex) {
      const property = ReflectGet(Object(target), key)
      if (property == null) {
        return false
      }
      target = property
    } else {
      return ReflectHas(Object(target), key)
    }
    index++
  }
}

const exists = (target, path) => get(target, path) != null

class KeyPath {
  constructor(...paths) {
    this[pathSymbol] = toPathApply(paths)
  }

  get length() {
    return this[pathSymbol].length
  }

  concat(...paths) {
    return new KeyPath(this, toPathApply(paths))
  }

  push(...paths) {
    return ArrayPrototypePushApply(this[pathSymbol], toPathApply(paths))
  }

  entries() {
    return ArrayPrototypeEntries(this[pathSymbol])
  }

  keys() {
    return ArrayPrototypeKeys(this[pathSymbol])
  }

  values() {
    return ArrayPrototypeValues(this[pathSymbol])
  }

  safeEntries() {
    return ArrayPrototypeSafeEntries(this[pathSymbol])
  }

  safeKeys() {
    return ArrayPrototypeSafeKeys(this[pathSymbol])
  }

  safeValues() {
    return ArrayPrototypeSafeValues(this[pathSymbol])
  }

  toString() {
    let result = ''
    for (const key of ArrayPrototypeSafeValues(this[pathSymbol])) {
      const expression = (
        PrimitivesIsSymbol(key) ? `[${SymbolPrototypeToString(key)}]` :
        TypesIsIndexKey(key) ? `[${key}]` :
        RegExpPrototypeTest(/[.[\['"]/, key) ? `['${StringPrototypeReplace(key, /([[\]'"])/g, '\\$1')}']` : undefined
      )
      result += expression !== undefined ? (
        !result && result[result.length - 1] === '.' ? `.${expression}` : expression
      ) : key ? (
        result && result[result.length - 1] !== '.' ? `.${key}` : key
      ) : '.'
    }
    return result
  }

  toArray() {
    return ArrayFrom(this[pathSymbol])
  }
}

const isKeyPath = FunctionPrototypeBind(FunctionPrototypeSymbolHasInstance, null, KeyPath)

ObjectDefineProperties(KeyPath, {
  isKeyPath: {
    value: isKeyPath
  },
  parse: {
    value: parse
  },
  toPath: {
    value: toPath
  },
  toPathApply: {
    value: toPathApply
  },
  get: {
    value: get
  },
  set: {
    value: set
  },
  delete: {
    value: $delete
  },
  has: {
    value: has
  },
  hasIn: {
    value: hasIn
  },
  exists: {
    value: exists
  }
})
ObjectDefineProperties(KeyPath.prototype, {
  [SymbolIterator]: {
    value: KeyPath.prototype.values
  },
  [SymbolSafeIterator]: {
    value: KeyPath.prototype.safeValues
  },
  [SymbolToStringTag]: {
    value: 'KeyPath'
  }
})

module.exports = KeyPath
