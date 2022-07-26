const express = require("express"), app = express(), {getPlayerData} = require('../utils/hypixel'),
    {validateKey} = require('./validateKey'), chalk = require('chalk'),
    {ignToUuid} = require('../utils/mojang')

app.get("/hypixelAPI/:key/:apikey/:ign?", async (req, res) => {

    if (!req.params.apikey || !req.params.key || !req.params.ign) return res.end(JSON.stringify({success: false, reason: 'Arguments missing!'}));

    let keyResponse = await validateKey(req.params.key);
    if (keyResponse.success === false) return res.end(JSON.stringify({success: false, reason: keyResponse.reason}));
    console.log(req.params.apikey)
    const apiResponse = await getPlayerData(req.params.ign, req.params.apikey)
    res.end(JSON.stringify(apiResponse));
});

app.get("/ignToUuid/:key/:ign?", async (req, res) => {

    if (!req.params.key || !req.params.ign) return res.end(JSON.stringify({success: false, reason: 'Arguments missing!'}));

    let keyResponse = await validateKey(req.params.key);
    if (keyResponse.success === false) return res.end(JSON.stringify({success: false, reason: keyResponse.reason}));

    const apiResponse = await ignToUuid(req.params.ign)
    res.end(JSON.stringify(apiResponse));
});

let server = app.listen(25567, function () {
    console.log(`The web server is running at http://${server.address().address}:${server.address().port}`);
});