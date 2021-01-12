# prueba

## Uso
``` js

const setupDatabase = require('prueba-db')

setupDatabase(config).then(db => {
    const { Agent, Metric} = db

}).catch(err => console.error(err))

```