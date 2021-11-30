const { Client, logger } = require('camunda-external-task-client-js');
const { Variables } = require("camunda-external-task-client-js");
const axios = require('axios');
const nodemailer = require('nodemailer');
const qs = require('qs');

require('dotenv').config();

// configuration for the Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
//  - 'asyncResponseTimeout': long polling timeout (then a new request will be issued)
const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 10000 };

// create a Client instance with custom configuration
const client = new Client(config);

// susbscribe to the topic: 'payment-validation'
client.subscribe('payment-validation', async ({ task, taskService }) => {
  console.log('Found payment-validation task');
  validation(task, taskService);
});

// subscribt to the topic: 'invalid-payment'
client.subscribe('invalid-payment', async ({ task, taskService }) => {
  console.log('Found invalid-payment task');
  sendMail(
    task,
    taskService,
    'Bestellung fehlgeschlagen',
    'Die Bestellung kann leider nicht durchgeführt werden, da die Zahlung nicht bestätigt werden konnte.'
  );
});

// subscribt to the topic: 'order-confirmation'
client.subscribe('order-confirmation', async ({ task, taskService }) => {
  console.log('Found order-confirmation task');
  sendMail(
    task,
    taskService,
    'Bestellung erfolgreich',
    'Die Bestellung wurde erfolgreich empfangen und die Zahlung konnte bestätigt werden.'
  );
});

// subscribt to the topic: 'inform-customer'
client.subscribe('inform-customer', async ({ task, taskService }) => {
  console.log('Found inform-customer task');
  sendMail(
    task,
    taskService,
    'Lieferung ist unterwegs',
    `Deine Pizza wurde eben von ${task.variables.get('chef')} zubereitet und ist jetzt auf dem Weg zu Dir.`
  );
});



async function sendMail(task, taskService, mailSubject, mailText) {
  const customerEmail = task.variables.get("email");

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PW
    }
  });
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: customerEmail,
    subject: mailSubject,
    text: mailText
  }
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      taskService.complete(task);
      console.log('E-Mail sent. ' + info.response);
    }
  });
}

async function validation(task, taskService) {
  console.log("validation")
  // Put your business logic here

  const pay_token = task.variables.get("paymentID");
  const vars = new Variables()

  const data = qs.stringify({
    'grant_type': 'client_credentials'
  });
  const config = {
    method: 'post',
    url: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    headers: {
      'Authorization': 'Basic QVp4aDVjbklFZDluRm5oZ2xpa2Z3Y2QtNmdFUTFyaldFeWVVNW5hNi1mZVFCa2F6dF96NllQVFdhZmVtTkUzb1F4cDdWazUwRno4ZkNlZzQ6RU5KSWNUVjE0azJtMUEzNWdxWmR1NWJzdE1JUmdUS0pteTUzZVlEYmp3UkJRVF9MYjNjOTRuNGpWSEZnOUdDX2QxZ3R0QXRZaUVaVU1hdDM=',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': 'ts=vr%3D442b463916d0a4be405edbf2fff7fa80%26vreXpYrS%3D1663477526%26vteXpYrS%3D1568808549%26vt%3D442b466216d0a4be405edbf2fff7fa7e'
    },
    data,
  };

  let access_token
  const accessTokenResponse = await axios(config)
  console.log(JSON.stringify(accessTokenResponse.data));
  access_token = accessTokenResponse.data.access_token

  const url = `https://api-m.sandbox.paypal.com/v2/checkout/orders/${pay_token}`

  const validationResponse = await axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    }
  })
  console.log(validationResponse.data)
  const valid = validationResponse.data.status === 'COMPLETED'
  vars.set('validPayment', valid)

  taskService.complete(task, vars)

  // vars.set('validPayment', valid)

  // taskService.complete(task, vars)

  // var url = "https://api.brainblocks.io/api/session/" + pay_token + "/verify";

  // await axios.get(url)
  //     .then(response => {
  //         console.log(response);

  //         var vars = new Variables();
  //         var valid = response.data.fulfilled;
  //         vars.set('validPayment', valid);

  //         taskService.complete(task, vars);
  //     })
  //     .catch(error => {
  //         console.log(error);
  //     });

}
