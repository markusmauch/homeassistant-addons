import { TCPStream } from "modbus-stream";
import * as Modbus from "./ModbusUtils";
import * as Mqtt from "./MqttUtils";
import Queue from "queue";
import commandLineArgs, { OptionDefinition } from "command-line-args";

const optionDefinitions: OptionDefinition[] = [
    { name: "poll_interval", type: Number, defaultValue: 5000 },
    { name: "mqtt_host", type: String, defaultValue: "homeassistant.local" },
    { name: "mqtt_username", type: String, defaultValue: "" },
    { name: "mqtt_password", type: String, defaultValue: "" },
    { name: "topic", type: String, defaultValue: "powerbox" },
    { name: "powerbox_host", type: String, defaultValue: "192.168.0.234" },
    { name: "powerbox_port", type: String, defaultValue: 502 },
    { name: "powerbox_unit_id", type: String, defaultValue: 10 },
  ]

const options = commandLineArgs(optionDefinitions);

const POLL_INTERVAL = options.poll_interval;
const MQTT_HOST = options.mqtt_host;
const MQTT_USERNAME = options.mqtt_username;
const MQTT_PASSWORD = options.mqtt_password;
const TOPIC = options.topic;
const POWERBOX_HOST = options.powerbox_host;
const POWERBOX_PORT = options.powerbox_port;
const POWERBOX_UNIT_ID = options.powerbox_unit_id;

type Address = 
    | "raumtemperatur"
    | "aussentemperatur"
    | "luftfeuchtigkeit"
    | "betriebsart"
    | "stossluftung"
    | "luftungsstufe";


const modbusAddresses: { [key in Address]: number } = {
    "raumtemperatur": 700,
    "aussentemperatur": 703,
    "luftfeuchtigkeit": 750,
    "betriebsart": 550,
    "stossluftung": 551,
    "luftungsstufe": 554,
};

let counter = 0;
const queue = Queue();
queue.concurrency = 1;
queue.autostart = true;
queue.timeout = 1000;

const mqttClient = Mqtt.connect( `mqtt://${MQTT_HOST}`, MQTT_USERNAME, MQTT_PASSWORD );
console.log( `Connected to MQTT host "${MQTT_HOST}"` );

const commandTopics = [
    `${TOPIC}/betriebsart`,
    `${TOPIC}/luftungsstufe`,
];


mqttClient.subscribe(commandTopics, {qos: 0}, ( err, res ) =>
{
    if ( err )
    {
        console.error(err);
    }
    else
    {
        commandTopics.forEach( topic => console.log( `Subscribed to topic "${topic}"` ) );
    }
} );
mqttClient.on("message", ( topic, message, info )=>
{
    const value = parseInt( message.toString() );
    if ( info.properties?.userProperties?.self !== "true" )
    {
        queue.splice(0);
        if ( topic === `${TOPIC}/betriebsart` )
        {
            queue.push( () => write( "betriebsart", value ) );
        }
        else if ( topic === `${TOPIC}/luftungsstufe` )
        {
            queue.push( () => write( "luftungsstufe", value ) );
        }
    }
} );

async function write( address: Address, value: number )
{
    let modbusConnection: TCPStream | null = null;
    try
    {
        console.log( `Writing value "${value}" to address "${address}"` );
        modbusConnection = await Modbus.connect( POWERBOX_HOST, POWERBOX_PORT, POWERBOX_UNIT_ID );
        const buffer = Buffer.from( [ 0, value ] );
        await Modbus.write( modbusConnection, modbusAddresses[address], buffer );
    }
    catch ( err )
    {
        console.log( err );
    }
    finally
    {
        if ( modbusConnection )
        {
            await Modbus.close( modbusConnection );
        }
    }
}

async function poll()
{
    console.log( `Retrieving data from the Powerbox (${counter++})` );
    let modbusConnection: TCPStream | null = null;
    try
    {
        modbusConnection = await Modbus.connect( POWERBOX_HOST, POWERBOX_PORT, POWERBOX_UNIT_ID );
        await readAndPublish(modbusConnection, "raumtemperatur", `${TOPIC}/raumtemperatur`, 0.1, 1);
        await readAndPublish(modbusConnection, "aussentemperatur", `${TOPIC}/aussentemperatur`, 0.1, 1);
        await readAndPublish(modbusConnection, "luftfeuchtigkeit", `${TOPIC}/luftfeuchtigkeit`, 1, 0);
        await readAndPublish(modbusConnection, "betriebsart", `${TOPIC}/betriebsart`, 1, 0 );
        await readAndPublish(modbusConnection, "stossluftung", `${TOPIC}/stossluftung`, 1, 0 );
        await readAndPublish(modbusConnection, "luftungsstufe", `${TOPIC}/luftungsstufe`, 1, 0 );
    }
    catch ( err )
    {
        console.error( err )
    }
    finally
    {
        if ( modbusConnection )
        {
            await Modbus.close( modbusConnection );
        }
    }
};

async function readAndPublish(modbusConnection: TCPStream, address: Address, topic: string, scale = 1, precision = 1)
{
    const result = await Modbus.read(modbusConnection, modbusAddresses[address]);
    const value = ( parseFloat( result.data[1].toString() ) * scale).toFixed( precision );
    console.log( `Publishing "${topic}": ${value}` );
    await Mqtt.publish(mqttClient, topic, value.toString());
}

async function delay( length: number )
{
    return new Promise<void>( (resolve, reject)=>
    {
        setTimeout( () => resolve(), length );
    } );
}

( async () =>
{
    while ( true )
    {
        queue.push( poll );
        await delay(POLL_INTERVAL);
    }
} )();

process.stdin.resume(); //so the program will not close instantly

function exitHandler( options: any, exitCode: any )
{
    if (options.cleanup)
    {
        console.log( "Closing MQTT connection." )
        mqttClient.unsubscribe(commandTopics);
        mqttClient.end();
    }
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on("exit", exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on("SIGINT", exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", exitHandler.bind(null, {exit:true}));
process.on("SIGUSR2", exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on("uncaughtException", exitHandler.bind(null, {exit:true}));