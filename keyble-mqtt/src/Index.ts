import commandLineArgs, { OptionDefinition } from "command-line-args";
import Mqtt from "mqtt";

const CYAN = '\x1b[36m%s\x1b[0m';

const optionDefinitions: OptionDefinition[] = [
    { name: "host", type: String, defaultValue: "homeassistant.local" },
    { name: "username", type: String, defaultValue: "" },
    { name: "password", type: String, defaultValue: "" },
];

const options = commandLineArgs(optionDefinitions);

const HOST = "192.168.0.4";
const USERNAME = "homeassistant";
const PASSWORD = options.password;
const TOPIC = "keyble";

const mqttClient = Mqtt.connect( `mqtt://${HOST}`, { username: USERNAME, password: PASSWORD } );
console.log( CYAN, `Connected to MQTT host '${HOST}'` );

mqttClient.on( "connect", async () =>
{
    console.log( CYAN, `Announcing Entity ''` );
    await mqttClient.publish( `homeassistant/lock/${TOPIC}/config`, JSON.stringify( {
        "name": "keyble",
        "device_class": "lock",
        "command_topic": `homeassistant/lock/${TOPIC}/command`
    } ) );
} );

console.log("Index.ts");