# KeyPath
## Install
`npm i --save @darkwolf/keypath`
## Usage
```javascript
// ECMAScript
import KeyPath from '@darkwolf/keypath'
// CommonJS
const KeyPath = require('@darkwolf/keypath')

`${new KeyPath('ave.darkwolf.matrix[0][0][0]')}` // => 'ave.darkwolf.matrix[0][0][0]'
`${new KeyPath('ave.darkwolf', 'matrix[0][0][0]')}` // => 'ave.darkwolf.matrix[0][0][0]'
`${new KeyPath(['ave', 'darkwolf'], `['matrix']`, [0, 0, 0])}` // => 'ave.darkwolf.matrix[0][0][0]'

const object = {
  ave: {
    darkwolf: null
  },
  data: [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]
}
KeyPath.exists(object, 'ave.darkwolf') // => false
KeyPath.set(object, ['ave', 'darkwolf'], 'Ave, Darkwolf!') // => true
KeyPath.get(object, `ave['darkwolf']`) // => 'Ave, Darkwolf!'
KeyPath.delete(object, new KeyPath('ave', 'darkwolf')) // => true
KeyPath.has(object, new KeyPath('ave.darkwolf')) // => false
KeyPath.get(object, 'data[0]') // => 2
KeyPath.get(object, 'data.1') // => 4
KeyPath.get(object, ['data', 2]) // => 8

const matrix = []
KeyPath.set(matrix, '[0][0][0]', Infinity) // => true
KeyPath.get(matrix, [0, 0, 0]) // => Infinity
```
## [API Documentation](https://github.com/Darkwolf/node-keypath/blob/master/docs/API.md)
## Contact Me
#### GitHub: [@PavelWolfDark](https://github.com/PavelWolfDark)
#### Telegram: [@PavelWolfDark](https://t.me/PavelWolfDark)
#### Email: [PavelWolfDark@gmail.com](mailto:PavelWolfDark@gmail.com)
