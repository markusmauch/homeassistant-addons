import commandLineArgs, { OptionDefinition } from "command-line-args";
import Mqtt from "mqtt";
import schedule from "node-schedule";
import Queue from "queue-promise";
import { lock, status, unlock } from "./Lock";

const CYAN = '\x1b[36m%s\x1b[0m';

const optionDefinitions: OptionDefinition[] = [
    { name: "host", type: String, defaultValue: "homeassistant.local" },
    { name: "username", type: String, defaultValue: "" },
    { name: "password", type: String, defaultValue: "" },
    { name: "address", type: String, defaultValue: "" },
    { name: "user_id", type: Number, defaultValue: 0 },
    { name: "user_key", type: String, defaultValue: "" },
];

const options = commandLineArgs(optionDefinitions);

const HOST = "192.168.0.4";
const USERNAME = "homeassistant";
const PASSWORD = options.password as string;
const ADDRESS = options.address as string;
const USER_ID = options.user_id as number;
const USER_KEY = options.user_key as string;

const uniqueId = `keyble_${ ADDRESS.replace( /:/g, "" ).toLowerCase() }`;
const TOPIC = `homeassistant/lock/${uniqueId}`;

const subscriptions = [
    `${TOPIC}/command`,
];

const queue = new Queue( {
    concurrent: 1,
    interval: 5000,
    start: true,
} );

const timestamp = () => ( new Date().toISOString().substr(0,19) ) + ":";

const mqttClient = Mqtt.connect( `mqtt://${HOST}`, { username: USERNAME, password: PASSWORD } );
console.log( CYAN, `${timestamp()} Connected to MQTT host '${HOST}'` );

mqttClient.on( "connect", async () =>
{
    console.log( CYAN, `${timestamp()} Announcing Keyble Smart Lock` );
    await mqttClient.publish(
        `${TOPIC}/config`,
        JSON.stringify( {
            "name": "Eqiva Bluetooth Smart (keyble)",
            "unique_id": uniqueId,
            "command_topic": `${TOPIC}/command`,
            "state_topic": `${TOPIC}/state`,
            "optimistic": false
        } ),
        {
            retain: true,
            qos: 1
        }
    );
} );

mqttClient.subscribe( subscriptions, {qos: 0}, ( err, res ) =>
{
    if ( err )
    {
        console.error( err) ;
    }
    else
    {
        subscriptions.forEach( topic => console.log( CYAN, `${timestamp()} Subscribed to topic "${topic}"` ) );
    }
} );

mqttClient.on( "message", ( topic, message, info ) =>
{
    if ( topic === `${TOPIC}/command` )
    {
        const command = message.toString();
        console.log( CYAN, `${timestamp()} Received command ${command}` );
        if ( command === "LOCK" )
        {
            queue.enqueue( async () =>
            {
                const state = await lock( ADDRESS, USER_ID, USER_KEY );
                updateState( state );
            } );
        }
        else if ( command === "UNLOCK" )
        {
            queue.enqueue( async () =>
            {
                const state = await unlock( ADDRESS, USER_ID, USER_KEY );
                updateState( state );
            } );
        }
    }
} );

schedule.scheduleJob( "0/60 * * * * *", () =>
{
    queue.enqueue( async () =>
    {
        console.log( CYAN, `${timestamp()} Retrieving lock state...` );
        const state = await status( ADDRESS, USER_ID, USER_KEY );
        updateState( state );
    } );
} );

function updateState( state: string )
{
    if ( state.indexOf( "OPENED" ) !== -1 || state.indexOf( "UNLOCKED" ) !== -1 )
    {
        console.log( CYAN, `${timestamp()} Publishing retrieved state: UNLOCKED` );
        mqttClient.publish(`${TOPIC}/state`, "UNLOCKED" );
    }
    else if ( state.indexOf( "LOCKED" ) !== -1 )
    {
        console.log( CYAN, `${timestamp()} Publishing retrieved state: LOCKED` );
        mqttClient.publish(`${TOPIC}/state`, "LOCKED" );
    }
    else
    {
        console.log( CYAN, `${timestamp()} Lock state unknown` );
    }
}

process.stdin.resume(); //so the program will not close instantly

function exitHandler( options: any, exitCode: any )
{
    if (options.cleanup)
    {
        mqttClient.unsubscribe( subscriptions );
        queue.stop();
        mqttClient.end();
    }
    if (exitCode || exitCode === 0)
    {
        console.log( CYAN, exitCode );
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