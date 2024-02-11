var $ek9MX$process = require("process");
var $ek9MX$buffer = require("buffer");
var $ek9MX$nodefetch = require("node-fetch");
var $ek9MX$crypto = require("crypto");
var $ek9MX$dotenv = require("dotenv");
var $ek9MX$asyncmqtt = require("async-mqtt");
var $ek9MX$fs = require("fs");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}



var $74b0cf9d3dbd5b46$require$Buffer = $ek9MX$buffer.Buffer;
var $74b0cf9d3dbd5b46$export$426dc07f493a4c47;
(function(ParamType) {
    ParamType["LoadConfiguration"] = "4";
})($74b0cf9d3dbd5b46$export$426dc07f493a4c47 || ($74b0cf9d3dbd5b46$export$426dc07f493a4c47 = {}));
class $74b0cf9d3dbd5b46$export$4029a0f913a6f0c8 {
    constructor(options){
        this.SERVER_PUBLIC_KEY = "04c5c00c4f8d1197cc7c3167c52bf7acb054d722f0ef08dcd7e0883236e0d72a3868d9750cb47fa4619248f3d83f0f662671dadc6e2d31c2f41db0161651c7c076";
        this.ecdh = (0, $ek9MX$crypto.createECDH)("prime256v1");
        this.username = options.username;
        this.password = options.password;
        this.logger = options.logger ?? console;
        this.country = options.country.toUpperCase();
        this.timezone = this.getTimezoneGMTString();
        this.ecdh.generateKeys();
    }
    md5(s) {
        this.logger.log(s);
        return (0, $ek9MX$crypto.createHash)("md5").update($74b0cf9d3dbd5b46$require$Buffer.from(s)).digest("hex");
    }
    getTimezoneGMTString() {
        const tzo = -new Date().getTimezoneOffset();
        const dif = tzo >= 0 ? "+" : "-";
        return `GMT${dif}${this.pad(tzo / 60)}:${this.pad(tzo % 60)}`;
    }
    pad(num) {
        const norm = Math.floor(Math.abs(num));
        return `${norm < 10 ? "0" : ""}${norm}`;
    }
    encryptAPIData(data, key) {
        const cipher = (0, $ek9MX$crypto.createCipheriv)("aes-256-cbc", key, key.slice(0, 16));
        return cipher.update(data, "utf8", "base64") + cipher.final("base64");
    }
    async fetch(endpoint, data, headers) {
        this.logger.log(JSON.stringify(data));
        const urlBuilder = new URL(endpoint, "https://ankerpower-api-eu.anker.com");
        const url = urlBuilder.href;
        return (0, ($parcel$interopDefault($ek9MX$nodefetch)))(url, {
            method: "POST",
            body: data != null ? JSON.stringify(data) : undefined,
            headers: {
                ["Content-Type"]: "application/json",
                Country: this.country,
                Timezone: this.timezone,
                ["Model-Type"]: "DESKTOP",
                ["App-Name"]: "anker_power",
                ["Os-Type"]: "android",
                ...headers
            }
        });
    }
    withLogin(login) {
        const headers = {
            ["X-Auth-Token"]: login.auth_token,
            "gtoken": this.md5(login.user_id)
        };
        const authFetch = async (endpoint, data)=>{
            const response = await this.fetch(endpoint, data, headers);
            return await response.json();
        };
        return {
            getRelateAndBindDevices: async ()=>{
                const data = {};
                return authFetch("/power_service/v1/app/get_relate_and_bind_devices", data);
            },
            getUserMqttInfo: async ()=>{
                return authFetch("/app/devicemanage/get_user_mqtt_info");
            },
            siteHomepage: async ()=>{
                const data = {};
                return authFetch("/power_service/v1/site/get_site_homepage", data);
            },
            getHomeLoadChart: async ({ siteId: siteId, deviceSn: deviceSn = "" })=>{
                const data = {
                    site_id: siteId,
                    device_sn: deviceSn
                };
                return authFetch("/power_service/v1/site/get_home_load_chart", data);
            },
            scenInfo: async (siteId)=>{
                const data = {
                    site_id: siteId
                };
                return authFetch("/power_service/v1/site/get_scen_info", data);
            },
            energyAnalysis: async ({ siteId: siteId, deviceSn: deviceSn, type: type, startTime: startTime = new Date(), endTime: endTime, deviceType: deviceType = "solar_production" })=>{
                const startTimeString = `${startTime.getUTCFullYear()}-${this.pad(startTime.getUTCMonth())}-${this.pad(startTime.getUTCDate())}`;
                const endTimeString = endTime != null ? `${endTime.getUTCFullYear()}-${endTime.getUTCMonth()}-${endTime.getUTCDate()}` : "";
                const data = {
                    site_id: siteId,
                    device_sn: deviceSn,
                    type: type,
                    start_time: startTimeString,
                    device_type: deviceType,
                    end_time: endTimeString
                };
                return authFetch("/power_service/v1/site/energy_analysis", data);
            },
            getSiteDeviceParam: async ({ paramType: paramType, siteId: siteId })=>{
                const data = {
                    site_id: siteId,
                    param_type: paramType
                };
                const response = await authFetch("/power_service/v1/site/get_site_device_param", data);
                if (response.data != null) switch(paramType){
                    case "4":
                        return {
                            ...response,
                            data: {
                                param_data: JSON.parse(response.data.param_data)
                            }
                        };
                    default:
                        return response;
                }
                return response;
            },
            setSiteDeviceParam: async ({ paramType: paramType, siteId: siteId, cmd: cmd = 17, paramData: paramData })=>{
                let data = {
                    site_id: siteId,
                    param_type: paramType,
                    cmd: cmd,
                    param_data: paramData
                };
                switch(paramType){
                    case "4":
                        data = {
                            ...data,
                            param_data: JSON.stringify(paramData)
                        };
                        break;
                    default:
                }
                return authFetch("/power_service/v1/site/set_site_device_param", data);
            }
        };
    }
    async login() {
        const data = {
            ab: this.country,
            client_secret_info: {
                public_key: this.ecdh.getPublicKey("hex")
            },
            enc: 0,
            email: this.username,
            password: this.encryptAPIData(this.password, this.ecdh.computeSecret($74b0cf9d3dbd5b46$require$Buffer.from(this.SERVER_PUBLIC_KEY, "hex"))),
            time_zone: new Date().getTimezoneOffset() !== 0 ? -new Date().getTimezoneOffset() * 60000 : 0,
            transaction: `${new Date().getTime()}`
        };
        const response = await this.fetch("/passport/login", data);
        if (response.status === 200) return await response.json();
        else throw new Error(`Login failed (${response.status}): ${await response.text()}`);
    }
}




function $dba5cd6913742fdd$var$stringEnvVar(envVarName, defaultValue) {
    const value = $ek9MX$process.env[envVarName];
    if (value == null && defaultValue === undefined) {
        console.error(`Missing env var ${envVarName}`);
        $ek9MX$process.exit(1);
    }
    return value ?? defaultValue ?? undefined;
}
function $dba5cd6913742fdd$var$intEnvVar(envVarName, defaultValue) {
    if (defaultValue != null) {
        const value = $dba5cd6913742fdd$var$stringEnvVar(envVarName, null);
        if (value == null) return defaultValue;
        return parseInt(value, 10);
    } else {
        const value = $dba5cd6913742fdd$var$stringEnvVar(envVarName);
        return parseInt(value, 10);
    }
}
function $dba5cd6913742fdd$var$boolEnvVar(envVarName, defaultValue = false) {
    const value = $dba5cd6913742fdd$var$stringEnvVar(envVarName, null);
    if (value == null) return defaultValue;
    return value === "true";
}
function $dba5cd6913742fdd$var$arrayEnvVar(envVarName, defaultValue) {
    if (defaultValue != null) {
        const value = $dba5cd6913742fdd$var$stringEnvVar(envVarName, null);
        if (value == null) return defaultValue;
        return value.split(",");
    } else {
        const value = $dba5cd6913742fdd$var$stringEnvVar(envVarName);
        return value.split(",");
    }
}
function $dba5cd6913742fdd$export$44487a86467333c3() {
    (0, $ek9MX$dotenv.config)();
    return {
        username: $dba5cd6913742fdd$var$stringEnvVar("S2M_USER"),
        password: $dba5cd6913742fdd$var$stringEnvVar("S2M_PASSWORD"),
        country: $dba5cd6913742fdd$var$stringEnvVar("S2M_COUNTRY"),
        loginStore: $dba5cd6913742fdd$var$stringEnvVar("S2M_LOGIN_STORE", "auth.data"),
        pollInterval: $dba5cd6913742fdd$var$intEnvVar("S2M_POLL_INTERVAL", 30),
        mqttUrl: $dba5cd6913742fdd$var$stringEnvVar("S2M_MQTT_URI"),
        mqttClientId: $dba5cd6913742fdd$var$stringEnvVar("S2M_MQTT_CLIENT_ID", "solix2mqtt"),
        mqttUsername: $dba5cd6913742fdd$var$stringEnvVar("S2M_MQTT_USERNAME", null),
        mqttPassword: $dba5cd6913742fdd$var$stringEnvVar("S2M_MQTT_PASSWORD", null),
        mqttRetain: $dba5cd6913742fdd$var$boolEnvVar("S2M_MQTT_RETAIN"),
        mqttTopic: $dba5cd6913742fdd$var$stringEnvVar("S2M_MQTT_TOPIC", "solix"),
        verbose: $dba5cd6913742fdd$var$boolEnvVar("S2M_VERBOSE", false)
    };
}
function $dba5cd6913742fdd$export$f6d07e945cb66980(config) {
    const newConfig = {
        ...config
    };
    const hideKeys = [
        "password"
    ];
    for (const key of hideKeys)if (config[key] != null) newConfig[key] = "***";
    return newConfig;
}


function $477da7269198124e$export$e6cd4f33c0c0769e(verbose) {
    return {
        log (...params) {
            if (verbose) console.log(`[${new Date().toISOString()}]`, ...params);
        },
        warn (...params) {
            if (verbose) console.warn(`[${new Date().toISOString()}]`, ...params);
        },
        error (...params) {
            console.error(`[${new Date().toISOString()}]`, ...params);
        }
    };
}


async function $9ba0f9a5c47c04f2$export$e772c8ff12451969(ms) {
    return new Promise((resolve)=>setTimeout(resolve, ms));
}



class $22a9bae610f63c88$export$9abcd9565debde5d {
    constructor(url, retain, clientId, username, password){
        this.url = url;
        this.retain = retain;
        this.clientId = clientId;
        this.username = username;
        this.password = password;
    }
    async getClient() {
        if (this.client && this.client.connected) return this.client;
        await this.client?.end();
        this.client = await (0, $ek9MX$asyncmqtt.connectAsync)(this.url, {
            clientId: this.clientId,
            username: this.username,
            password: this.password
        });
        return this.client;
    }
    async publish(topic, message) {
        await (await this.getClient()).publish(topic, JSON.stringify(message), {
            retain: this.retain
        });
    }
}



class $a1d708534f620ce9$export$4984da4fad352c04 {
    constructor(path){
        this.path = path;
    }
    async store(data) {
        await (0, $ek9MX$fs.promises).writeFile(this.path, JSON.stringify(data), "utf8");
    }
    async retrieve() {
        try {
            const data = await (0, $ek9MX$fs.promises).readFile(this.path, "utf8");
            return JSON.parse(data);
        } catch (err) {
            if (err.code === "ENOENT") return null;
            else throw err;
        }
    }
}



const $919eefa079760b8d$var$config = (0, $dba5cd6913742fdd$export$44487a86467333c3)();
const $919eefa079760b8d$var$logger = (0, $477da7269198124e$export$e6cd4f33c0c0769e)($919eefa079760b8d$var$config.verbose);
function $919eefa079760b8d$var$isLoginValid(loginData, now = new Date()) {
    return new Date(loginData.token_expires_at * 1000).getTime() > now.getTime();
}
async function $919eefa079760b8d$var$run() {
    $919eefa079760b8d$var$logger.log(JSON.stringify((0, $dba5cd6913742fdd$export$f6d07e945cb66980)($919eefa079760b8d$var$config)));
    const api = new (0, $74b0cf9d3dbd5b46$export$4029a0f913a6f0c8)({
        username: $919eefa079760b8d$var$config.username,
        password: $919eefa079760b8d$var$config.password,
        country: $919eefa079760b8d$var$config.country,
        logger: $919eefa079760b8d$var$logger
    });
    const persistence = new (0, $a1d708534f620ce9$export$4984da4fad352c04)($919eefa079760b8d$var$config.loginStore);
    const publisher = new (0, $22a9bae610f63c88$export$9abcd9565debde5d)($919eefa079760b8d$var$config.mqttUrl, $919eefa079760b8d$var$config.mqttRetain, $919eefa079760b8d$var$config.mqttClientId.length > 0 ? $919eefa079760b8d$var$config.mqttClientId : undefined, $919eefa079760b8d$var$config.mqttUsername, $919eefa079760b8d$var$config.mqttPassword);
    async function fetchAndPublish() {
        $919eefa079760b8d$var$logger.log("Fetching data");
        let loginData = await persistence.retrieve();
        if (loginData == null || !$919eefa079760b8d$var$isLoginValid(loginData)) {
            const loginResponse = await api.login();
            loginData = loginResponse.data ?? null;
            if (loginData) await persistence.store(loginData);
            else $919eefa079760b8d$var$logger.error(`Could not log in: ${loginResponse.msg} (${loginResponse.code})`);
        } else $919eefa079760b8d$var$logger.log("Using cached auth data");
        if (loginData) {
            const loggedInApi = api.withLogin(loginData);
            const siteHomepage = await loggedInApi.siteHomepage();
            let topic = `${$919eefa079760b8d$var$config.mqttTopic}/site_homepage`;
            await publisher.publish(topic, siteHomepage.data);
            for (const site of siteHomepage.data?.site_list ?? []){
                // scen info
                const scenInfo = await loggedInApi.scenInfo(site.site_id);
                topic = `${$919eefa079760b8d$var$config.mqttTopic}/site/${site.site_name}/scenInfo`;
                await publisher.publish(topic, scenInfo.data);
                // schedule
                const deviceParams = await loggedInApi.getSiteDeviceParam({
                    siteId: site.site_id,
                    paramType: (0, $74b0cf9d3dbd5b46$export$426dc07f493a4c47).LoadConfiguration
                });
                const schedule = deviceParams.data.param_data;
                topic = `${$919eefa079760b8d$var$config.mqttTopic}/site/${site.site_name}/schedule`;
                await publisher.publish(topic, schedule);
                const test = await loggedInApi.getSiteDeviceParam({
                    siteId: site.site_id,
                    paramType: "3"
                });
                const test2 = await loggedInApi.getSiteDeviceParam({
                    siteId: site.site_id,
                    paramType: "2"
                });
                const test1 = await loggedInApi.getSiteDeviceParam({
                    siteId: site.site_id,
                    paramType: "1"
                });
                const test5 = await loggedInApi.getSiteDeviceParam({
                    siteId: site.site_id,
                    paramType: "6"
                });
                const test6 = await loggedInApi.getSiteDeviceParam({
                    siteId: site.site_id,
                    paramType: "6"
                });
                var x = 0;
            }
            $919eefa079760b8d$var$logger.log("Published.");
        } else $919eefa079760b8d$var$logger.error("Not logged in");
    }
    for(;;){
        const start = new Date().getTime();
        try {
            await fetchAndPublish();
        } catch (e) {
            $919eefa079760b8d$var$logger.warn("Failed fetching or publishing printer data", e);
        }
        const end = new Date().getTime() - start;
        const sleepInterval = $919eefa079760b8d$var$config.pollInterval * 1000 - end;
        $919eefa079760b8d$var$logger.log(`Sleeping for ${sleepInterval}ms...`);
        await (0, $9ba0f9a5c47c04f2$export$e772c8ff12451969)(sleepInterval);
    }
}
$919eefa079760b8d$var$run().then(()=>{
    $919eefa079760b8d$var$logger.log("Done");
}).catch((err)=>{
    $919eefa079760b8d$var$logger.error(err);
    $ek9MX$process.exit(1);
});


//# sourceMappingURL=index.js.map
