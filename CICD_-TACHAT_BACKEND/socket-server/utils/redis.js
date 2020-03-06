const util = require('util');
const redis = require('redis');
let client = null;

function connect() {
    return new Promise((resolve, reject) => {
        client = redis.createClient({
            host: process.env.REDIS_HOST
        });
        client.on('error', (err) => {
            console.log('Failed connecting to redis', err);
            reject(err);
        });
        client.on('connect', () => {
            // redis connected
            resolve();
        });
    });
}

function set(key, value) {
    const set =  promisify(client.set);
    return set(key, value);
}

function setJSON(key, value) {
    const set =  promisify(client.set);
    return set(key, JSON.stringify(value));
}

function get(key) {
    const get =  promisify(client.get);
    return get(key);
}

function getJSON(key) {
    const get =  promisify(client.get);
    return get(key).then(values => JSON.parse(values));
}

function del(key) {
    const del = promisify(client.del);
    return del(key);
}

function flush() {
    const sendCommand = util.promisify(client.send_command).bind(client);
    return sendCommand('FLUSHALL');
}

function promisify(fn) {
    return util.promisify(fn).bind(client);
}

module.exports = {
    connect,
    set,
    setJSON,
    get,
    getJSON,
    del,
    flush
};