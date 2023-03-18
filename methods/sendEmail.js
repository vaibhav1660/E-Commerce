const mailjet = require('node-mailjet').apiConnect(
    "5cd077e0c246aae3934b42a93128a821",
    "5f8485d7616ead1e6d7130cc6ee3e0df"
  )

module.exports=function(email, token ,callback)
{
    const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'vaibhav.wadetwar@ssipmt.com',
              Name: 'why should i tell you',
            },
            To: [
              {
                Email: email,
                Name: 'We dont need you',
              },
            ],
            Subject: 'one last step',
            TextPart: 'If you enjoy purchasing expensive product.verify',
            HTMLPart:
              `<h1>OMG its working</h1> <form action="http://localhost:3000/verifymail/${token}"><button type="submit">Click here</button</form>`
          },
        ],
      })
      request
        .then(result => {
          console.log(result.body)
          callback(null, result.body)
        })
        .catch(err => {
          console.log(err)
          callback(err, null)
        })
}
