import commandLineArgs, { OptionDefinition } from "command-line-args";
import Mqtt from "mqtt";
import Queue from "queue-promise";
import { clearIntervalAsync, setIntervalAsync } from "set-interval-async";
import { lock, status, unlock } from "./Lock";

const CYAN = '\x1b[36m%s\x1b[0m';

const optionDefinitions: OptionDefinition[] = [
    { name: "host", type: String },
    { name: "username", type: String },
    { name: "password", type: String },
    { name: "address", type: String },
    { name: "user_id", type: Number },
    { name: "user_key", type: String },
    { name: "auto_disconnect_time", type: Number },
    { name: "poll_interval", type: Number },
];

const options = commandLineArgs(optionDefinitions);

const HOST = options.host as string;
const USERNAME = options.username as string;
const PASSWORD = options.password as string;
const ADDRESS = options.address as string;
const USER_ID = options.user_id as number;
const USER_KEY = options.user_key as string;
const AUTO_DISCONNECT_TIME = options.auto_disconnect_time as number;
const POLL_INTERVAL = options.poll_interval as number;

const uniqueId = ADDRESS.replace( /:/g, "" ).toLowerCase();
const ENTITY_CONFIG_TOPIC = ( component: "lock" | "binary_sensor" ) => `homeassistant/${component}/keyble/${uniqueId}/config`;
const DEVICE_TOPIC = `keyble/${uniqueId}`;
const subscription = `${DEVICE_TOPIC}/command`;

const queue = new Queue( {
    concurrent: 1,
    interval: 5000,
    start: true,
} );

const timestamp = () => ( new Date().toISOString().substr(0,19) );
const log = ( msg: string ) => console.log( CYAN, `${timestamp()}: ${msg}` );

const mqttClient = Mqtt.connect( `mqtt://${HOST}`, { username: USERNAME, password: PASSWORD } );

const job = setIntervalAsync(() => queue.enqueue( async () => publishCurrentState() ), POLL_INTERVAL * 1000 );

mqttClient.on( "error", error => console.error( error.message ) );

mqttClient.on( "connect", async () =>
{
    log( `Connected to MQTT host '${HOST}'` );

    let name: string;
    
    name = "Eqiva Bluetooth Smart Lock";
    log( `Announcing Entity '${name}'` );
    await mqttClient.publish(
        ENTITY_CONFIG_TOPIC("lock"),
        JSON.stringify( {
            "name": name,
            "unique_id": uniqueId,
            "command_topic": `${DEVICE_TOPIC}/command`,
            "state_topic": `${DEVICE_TOPIC}/state`,
            "value_template": "{{ value_json.locked }}",
            "state_locked": true, 
            "state_unlocked": false,
            "optimistic": true
        } ),
        {
            retain: true,
            qos: 1
        }
    );

    name = "Eqiva Bluetooth Smart Lock Battery Low";
    log( `Announcing Entity '${name}'` );
    await mqttClient.publish(
        ENTITY_CONFIG_TOPIC("binary_sensor"),
        JSON.stringify( {
            "name": name,
            "unique_id": `${uniqueId}_battery_low`,
            "device_class": "battery",
            "entity_category": "diagnostic",
            "state_topic": `${DEVICE_TOPIC}/state`,
            "value_template": "{{ value_json.batteryLow }}",
            "payload_off": false,
            "payload_on": true
        } ),
        {
            retain: true,
            qos: 1
        }
    );

    mqttClient.subscribe( subscription, {qos: 0}, ( err, res ) =>
    {
        if ( err )
        {
            console.error( err) ;
        }
        else
        {
            log( `Subscribed to topic '${subscription}'` );
        }
    } );

    publishCurrentState();
} );

mqttClient.on( "message", ( topic, message, info ) =>
{
    if ( topic === `${DEVICE_TOPIC}/command` )
    {
        const command = message.toString();
        log( `Received command ${command}` );
        if ( command === "LOCK" )
        {
            queue.enqueue( async () => await lock( ADDRESS, USER_ID, USER_KEY, AUTO_DISCONNECT_TIME ) );
        }
        else if ( command === "UNLOCK" )
        {
            queue.enqueue( async () => await unlock( ADDRESS, USER_ID, USER_KEY, AUTO_DISCONNECT_TIME ) );
        }
    }
} );

async function publishCurrentState()
{
    type State = {
        locked: boolean;
        batteryLow: boolean;
    };

    log( `Retrieving lock state...` );
    const state = await status( ADDRESS, USER_ID, USER_KEY, AUTO_DISCONNECT_TIME );

    const json = {
        batteryLow: state.indexOf("BATTERY_LOW") !== -1
    } as State;
    
    if ( state.indexOf( "OPENED" ) !== -1 || state.indexOf( "UNLOCKED" ) !== -1 )
    {
        json.locked = false;
    }
    else if ( state.indexOf( "LOCKED" ) !== -1 )
    {
        json.locked = true;
    }
    else
    {
        log( `Lock state unknown` );
    }

    // publish state object
    const jsonStr = JSON.stringify(json);
    log( `Publishing lock state: ${jsonStr}` );
    mqttClient.publish(`${DEVICE_TOPIC}/state`, jsonStr );
}

process.stdin.resume(); //so the program will not close instantly

function exitHandler( options: any, exitCode: any )
{
    if (options.cleanup)
    {
        mqttClient.unsubscribe( subscription );
        clearIntervalAsync( job );
        queue.stop();
        mqttClient.end();
    }
    if (exitCode || exitCode === 0)
    {
        log( exitCode );
    }
    if (options.exit)
    {
        process.exit();
    }
}

// do something when app is closing
process.on("exit", exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", exitHandler.bind(null, {exit:true}));
process.on("SIGUSR2", exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on("uncaughtException", exitHandler.bind(null, {exit:true}));
