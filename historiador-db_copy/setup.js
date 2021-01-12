'use strict'

const debug = require('debug')('historiador:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const minimist = require('minimist')
const db = require('./')

const args = minimist(process.argv)
const prompt = inquirer.createPromptModule()

async function setup () {
  if (!args.yes) {
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy tour database, are you sure?'
      }
    ])

    if (!answer.setup) {
      return console.log('Nothin happened :)')
    }
  }

  const config = {
    database: process.env.DB_NAME || 'Historiador',
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'example',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  }

  await db(config).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}

function handleFatalError (err) {
  console.log(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
