const express = require('express');
const app = express();
const port = 3001;
var nodemailer = require('nodemailer');
const nashik_district_id = 389;
const pune_district_id = 363;
const axios = require('axios');

app.listen(port, () => {
    findAppointment();
});

function sendAlert(appointment, centerName) {
    let mailOptions = {
        from: 'vaccineupdateforrupesh@gmail.com',
        to: 'vaccineupdateforrupesh@gmail.com;rupesh.kothawade33@gmail.com;tyagamayeebhadra@gmail.com',
        subject: appointment.available_capacity + ' Appointment(s) available in ' + centerName + ' on ' + appointment.date,
        text: appointment
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Error ' + error);
        } else {
            console.log('Email sent: ' + info.response)
        }
    });
}

function parseResponse(response) {
    if (response) {
        let centers = response.centers;
        for (let i in centers) {
            let center = centers[i];
            let sessions = center.sessions;
            for (let j in sessions) {
                let appointment = sessions[j];
                if (appointment.available_capacity > 0) {
                    sendAlert(appointment, center.name);
                }
            }
        }
    }
}

const findAppointment = () => {
    sendApiCall(pune_district_id).then(res => {
        parseResponse(res);
    });
    sendApiCall(nashik_district_id).then(res => {
        parseResponse(res);
    });
    setTimeout(findAppointment, 30000);
}

const sendApiCall = async (district_id) => {
    var url = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=' + district_id + '&date=' + new Date().toLocaleDateString();
    console.log('Checking in ' + district_id + ' at ' + new Date().toLocaleTimeString());
    axios.get(url)
        .then(response => {
            return response;
        })
        .catch(error => {
            console.log('Error ' + district_id + ' at ' + new Date().toLocaleTimeString() + ' -> ' + error.message);
        });
}


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vaccineupdateforrupesh@gmail.com',
        pass: 'Car@1234'
    }
})