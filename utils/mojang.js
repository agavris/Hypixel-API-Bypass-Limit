const p = require('phin');

async function ignToUuid(ign) {
    try {
        const res = await p({
            'url': `https://api.mojang.com/users/profiles/minecraft/${ign}`,
            'method': 'GET',
            'parse': 'json'
        })
        console.log(res.body)
        if (res.body == null) return {success: false};
        return {
            success: true,
            original: ign,
            uuid: res.body.id
        }
    } catch (err) {
        console.log(err)
        return {success: false};
    }
}

module.exports = {
    ignToUuid: ignToUuid
}