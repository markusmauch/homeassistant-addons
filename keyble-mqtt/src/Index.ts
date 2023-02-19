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
const TOPIC = "homeassistant/lock/keyble";

const subscriptions = [
    `${TOPIC}/command`,
];

const mqttClient = Mqtt.connect( `mqtt://${HOST}`, { username: USERNAME, password: PASSWORD } );
console.log( CYAN, `Connected to MQTT host '${HOST}'` );

mqttClient.on( "connect", async () =>
{
    console.log( CYAN, `Announcing Entity 'command'` );
    await mqttClient.publish( `${TOPIC}/config`, JSON.stringify( {
        "name": "keyble",
        "command_topic": `${TOPIC}/command`
    } ) );
} );

mqttClient.subscribe( subscriptions, {qos: 0}, ( err, res ) =>
{
    if ( err )
    {
        console.error( err) ;
    }
    else
    {
        subscriptions.forEach( topic => console.log( CYAN, `Subscribed to topic "${topic}"` ) );
    }
} );

mqttClient.on( "message", ( topic, message, info ) =>
{
    if ( topic === `${TOPIC}/command` )
    {
        const value = parseInt( message.toString() );
        console.log( CYAN, value );
    }
} );


process.stdin.resume(); //so the program will not close instantly

function exitHandler( options: any, exitCode: any )
{
    if (options.cleanup)
    {
        mqttClient.unsubscribe( subscriptions );
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