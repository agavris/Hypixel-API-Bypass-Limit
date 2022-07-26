const p = require('phin'), {ignToUuid} = require('./mojang')

let cache = {};

const rankColors = {
    "ADMIN": "FF5555",
    "MODERATOR": "00AA00",
    "HELPER": "5555FF",
    "JR_HELPER": "5555FF",
    "YOUTUBER": "FF5555",
    "SUPERSTAR": "FFAA00",
    "MVP_PLUS": "55FFFF",
    "MVP": "55FFFF",
    "VIP_PLUS": "55FF55",
    "VIP": "55FF55",
    "DEFAULT": "AAAAAA"
};

const ranks = {
    "ADMIN": "ADMIN",
    "MODERATOR": "MOD",
    "HELPER": "HELPER",
    "JR_HELPER": "JR.HELPER",
    "YOUTUBER": "YOUTUBE",
    "SUPERSTAR": "MVP++",
    "MVP_PLUS": "MVP+",
    "MVP": "MVP",
    "VIP_PLUS": "VIP+",
    "VIP": "VIP",
    "DEFAULT": "Non"
};

const colorsCodes = {
    'dark_red': 'AA0000',
    'red': 'FF5555',
    'gold': 'FFAA00',
    'yellow': 'FFFF55',
    'dark_green': '00AA00',
    'green': '55FF55',
    'aqua': '55FFFF',
    'dark_aqua': '00AAAA',
    'dark_blue': '0000AA',
    'blue': '5555FF',
    'light_purple': 'FF55FF',
    'dark_purple': 'AA00AA',
    'white': 'FFFFFF',
    'gray': 'AAAAAA',
    'dark_gray': '555555',
    'black': '000000'
}

async function getPlayerData(uuid, hypixelKey) {
    if (uuid.includes('-')) uuid = uuid.replace(/-/g, '');
    if (uuid.length !== 32) {
        if (cache[uuid] !== undefined && Date.now() - cache[uuid].lastChecked < 1200000) uuid = cache[uuid].uuid;
        else {
            let res = await ignToUuid(uuid);
            if (res.success === false) return res;
            uuid = res.uuid;
            cache[res.original] = {
                uuid: uuid,
                lastChecked: Date.now()
            }
        }
    }
    console.log(uuid)

    try {

        let [data, newData] = await Promise.all([p({
            url: `https://api.hypixel.net/player?key=${hypixelKey}&uuid=${uuid}`,
            method: 'GET',
            'parse': 'json'
        }), p({
            url: `https://api.hypixel.net/recentgames?key=${hypixelKey}&uuid=${uuid}`,
            method: 'GET',
            'parse': 'json'
        })]);

        if (data.body.success === false) return {success: false};
        data = data.body.player;
        let builder = {
            success: true,
            uuid: data.uuid,
            ign: data.displayname,
            player: {},
            guild: {},
            status: {
                online: data.lastLogin > data.lastLogout,
                game: data.mostRecentGameType
            },
            kit: data.stats.SkyWars.activeKit_RANKED ? data.stats.SkyWars.activeKit_RANKED.replace('kit_ranked_ranked_', '') : 'None',
            fullData: data
        }
        //---------------------------------
        // Gets rank colors used to display
        // inside the leaderboard and rating
        //----------------------------------
        let rankData = getRank(data)
        builder.player = {
            rank: rankData[0],
            pColor: rankData[1],
            rankPlusColor: rankData[0] === 'VIP+' ? colorsCodes['gold'] : data.rankPlusColor ? colorsCodes[data.rankPlusColor.toLowerCase()] : undefined
        }

        await getGuild(uuid, hypixelKey).then((a) => {
            builder.guild = {
                tag: a[0],
                gColor: a[1]
            }
        })

        if (newData.body.success && newData.body.games[0] !== undefined){
            builder.fullMapData = newData.body.games;
            builder.lastMap = newData.body.games[0]['map'];
        } else {
            builder.fullMapData = [];
            builder.lastMap = 'Other';
        }

        return builder;
    } catch (err) {
        console.log(err)
        return {success: false};
    }


}

function getRank(player) {
    let packageRank = player.packageRank;
    let newPackageRank = player.newPackageRank;
    let monthlyPackageRank = player.monthlyPackageRank;
    let rankPlusColor = player.rankPlusColor;
    let monthlyRankColor = player.monthlyRankColor;
    let rank = player.rank;
    let prefix = player.prefix;

    if (rank === "NORMAL") rank = null; // Don't care about normies
    if (monthlyPackageRank === "NONE") monthlyPackageRank = null; // Don't care about cheapos
    if (packageRank === "NONE") packageRank = null;
    if (newPackageRank === "NONE") newPackageRank = null;

    if (prefix && typeof prefix === "string") {
        let splitTag = prefix.split(/§[a-f0-9]/);
        return ([splitTag.join('').replace('[', '').replace(']', ''), 'FF55FF']);
    } else if (rank || monthlyPackageRank || newPackageRank || packageRank) return [(ranks[rank || monthlyPackageRank || newPackageRank || packageRank]), (rankColors[rank || monthlyPackageRank || newPackageRank || packageRank])];
    else return ['Non', 'AAAAAA'];
}

async function getGuild(uuid, hypixelKey) {
    let gData = await p({
        url: `https://api.hypixel.net/guild?key=${hypixelKey}&player=${uuid}`,
        method: 'GET',
        'parse': 'json'
    });
    if (gData.body.success === false) {
        console.log('tf is happening with the API???')
        return ['None', 'ffffff'];
    }
    gData = gData.body.guild;
    return [(gData !== null && gData.tag) ? `[${gData.tag}]` : 'None', (gData !== null && gData.tagColor) ? colorsCodes[gData.tagColor.toLowerCase()] : 'ffffff']
}

module.exports = {
    getPlayerData: getPlayerData
}