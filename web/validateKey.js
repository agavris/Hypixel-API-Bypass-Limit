const keySchema = require('../models/key')
let cache = {}

/**
 * Validates a key for api requests
 *
 * @param key - an api key.
 * @returns {Promise<object>}
 */

async function validateKey(key) {
    if (cache[key] !== undefined) {
        /**
         * Check to see if they passed
         * their limit per minute
         */
        if (cache[key].requests.filter(time => Date.now() - time <= 60000).length >= cache[key].limit) return {
            success: false,
            reason: 'Request limit has been surpassed.'
        }

        /**
         * The keys refresh every 10 minutes
         * so here it just adds the request
         * and validates it.
         */
        if (Date.now() - cache[key].lastChecked <= 600000) {
            cache[key].requests.push(Date.now())
            return {success: true}
        }
    }

    return (await new Promise(function (resolve) {
        keySchema.findOne(
            {
                key: key
            },
            async (err, res) => {
                if (err) {
                    console.log(err)
                    return resolve({
                        success: false,
                        reason: 'Internal error. Please try again later :)'
                    })
                }

                if (!res) return resolve({
                    success: false,
                    reason: 'Invalid key'
                })


                cache[key] = {
                    lastChecked: Date.now(),
                    limit: res.limit,
                    owner: res.owner,
                    requests: [Date.now()]
                }
                return resolve({success: true})
            });
    }));
}

module.exports = {
    validateKey: validateKey
}