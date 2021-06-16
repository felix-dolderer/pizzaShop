const { Client, logger } = require('camunda-external-task-client-js');
const { Variables } = require("camunda-external-task-client-js");
const axios = require('axios');
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
    var customerEmail = task.variables.get("email");

    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PW
        }
    });
    var mailOptions = {
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

    var pay_token = task.variables.get("paymentID");
    var vars = new Variables()

    // var valid = pay_token === "test"

    var access_token = 'A21AAIOoLxiuw8-3izJELeEmA5Lmq8v_q8Va94ZAUHlRVaD8yvHBCHXLbqIm_kPB5e6DvFx6okEiwh1JCWvbXVt0f2tfr78BQ'

    var url = `https://api-m.sandbox.paypal.com/v2/checkout/orders/${pay_token}`

    var axios = require('axios')
    await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        }
    })
        .then(response => {
            console.log(response.data)

            var valid = response.data.status === 'COMPLETED'
            vars.set('validPayment', valid)

            taskService.complete(task, vars)
        })
        .catch(err => {
            console.error(err);
        })


    // vars.set('validPayment', valid)

    // taskService.complete(task, vars)

    // var url = "https://api.brainblocks.io/api/session/" + pay_token + "/verify";

    // var axios = require('axios');
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
