from flask import Flask, render_template, request, redirect, session
import requests
import json

secret_key = "super_secr3t"
app = Flask(__name__)
app.secret_key = secret_key

headers = {
    'Content-Type': "application/json",
    'Host': "localhost:8080"
}


@app.route('/')
def main():
    return render_template('index.html')


@app.route('/order', methods=['POST'])
def order():
    payload = {
        "variables": {
            "flavour": {
                "value": request.form['Flavour']
            },
            "size": {
                "value": request.form['Size'],
                "type": "integer"
            },
            "email": {
                "value": request.form['Email'],
                "type": "String"
            },
            "delivery": {
                "value": ("Delivery" in request.form),
                "type": "Boolean"
            }
        }
    }

    pi_id_url = "http://localhost:8080/engine-rest/process-definition/key/PizzaShopProcess/start"
    pi_id_response = requests.request(
        "POST", pi_id_url, data=json.dumps(payload), headers=headers)
    pi_id = pi_id_response.json()["id"]
    session['pi_id'] = pi_id

    t_id_url = "http://localhost:8080/engine-rest/task/?processInstanceId=" + pi_id
    t_id_response = requests.request("GET", t_id_url)
    t_id = t_id_response.json()[0]["id"]
    session['t_id'] = t_id

    pi_variables_url = pi_id_response.json()["links"][0]["href"] + "/variables"
    pi_variables_response = requests.request("GET", pi_variables_url).json()

    return render_template(
        'order.html',
        flavour=pi_variables_response["flavour"]["value"],
        size=pi_variables_response["size"]["value"],
        email=pi_variables_response["email"]["value"],
        delivery=pi_variables_response["delivery"]["value"],
        chef=pi_variables_response["chef"]["value"],
        pi_id=pi_id)


@app.route('/order-complete', methods=['POST'])
def order_complete():
    payment_id = request.form['Payment ID']
    data = json.dumps({"value": payment_id, "type": "String"})
    pay_id_url = "http://localhost:8080/engine-rest/process-instance/" + session['pi_id'] + "/variables/paymentID"
    response = requests.request("PUT", pay_id_url, headers=headers, data=data)

    t_id = session['t_id']
    t_complete_url = "http://localhost:8080/engine-rest/task/" + t_id + "/complete"
    t_complete_response = requests.request(
        "POST", t_complete_url, headers=headers)

    return render_template('order_complete.html')


if __name__ == '__main__':
    app.run(debug=True, port=8082)
