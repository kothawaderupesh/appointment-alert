const express = require('express');
const app = express();
var nodemailer = require('nodemailer');
const nashik_district_id = "389";
const pune_district_id = "363";
const axios = require('axios');
const to_pune = "vaccineupdateforrupesh@gmail.com;rupesh.kothawade33@gmail.com;tyagamayeebhadra@gmail.com";
const to_nashik = "vaccineupdateforrupesh@gmail.com;rupesh.kothawade33@gmail.com";
app.listen(process.env.PORT || 5000, () => {
    findAppointment();
});

app.get('/', (req, res) => {
    res.send('Checking vaccine appointments...');
});

function sendAlert(appointment, center, to) {

    let mailOptions = {
        from: "vaccineupdateforrupesh@gmail.com",
        to: to,
        subject: appointment.available_capacity + " Appointment(s) available for " + appointment.min_age_limit +"+ in " + center.district_name + " " + center.name + " on " + appointment.date,
        text: center.json
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Error" + error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });

}

function parseResponse(response) {
    if (response) {
        let centers = response.data.centers;
        for (let i in centers) {
            let center = centers[i];
            let sessions = center.sessions;
            if (Array.isArray(sessions)) {
                for (let j in sessions) {
                    let appointment = sessions[j];
                    if (appointment.available_capacity > 0 && center.district_name === 'Nashik'
                        && center.pincode.toString().startsWith("422")) {
                        sendAlert(appointment, center, to_nashik);
                    } else if (appointment.min_age_limit === 18 & appointment.available_capacity > 0
                        && center.district_name === 'Pune'
                        && center.pincode.toString().startsWith("411")) {
                        sendAlert(appointment, center, to_pune);
                    }
                }
            }

        }
    }
}

const findAppointment = () => {
    sendApiCall(pune_district_id);
    sendApiCall(nashik_district_id);
    setTimeout(findAppointment, 10000);
}

const sendApiCall = (district_id) => {
    var url = 'http://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=' + district_id + '&date=' + new Date().toLocaleDateString();
    let district_name = district_id === "363" ? "Pune" : "Nashik";
    console.log('Checking in ' + district_name + ' at ' + new Date().toLocaleTimeString());
    let config = {
        headers: {
            "user-agent": "Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36"
        }
    }
    axios.get(url, config)
        .then(response => {
            parseResponse(response);
        })
        .catch(error => {
            console.log('Error ' + district_name + ' at ' + new Date().toLocaleTimeString() + ' -> ' + error.message);
        });
}


var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "vaccineupdateforrupesh@gmail.com",
        pass: "Car@1234"
    }
})