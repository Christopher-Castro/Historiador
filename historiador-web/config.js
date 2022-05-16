'use strict'

module.exports = {
  endpoint: process.env.API_ENDPOINT || 'http://localhost:3000',
  serverHost: process.env.SERVER_HOST || 'http://localhost:8080',
  // apiToken: process.env.API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiYWRtaW4iOnRydWUsInBlcm1pc3Npb25zIjpbIm1ldHJpY3M6cmVhZCJdLCJpYXQiOjE2MDkxODk4ODV9.J_OHmSIPpC62dEJ3_p2GhwGWXGE8oOcjdEWRaiVQMD8'
  apiToken: process.env.API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN1cGVyQWRtaW4iLCJzdXBlckFkbWluIjp0cnVlLCJwZXJtaXNzaW9ucyI6WyJtZXRyaWNzOnJlYWQiXSwiaWF0IjoxNjUyNTQzMTk0fQ.zrp2mYzADnIDZWnYT1jCLUKbvL8E_7b5DAb4BRsoue0'
}