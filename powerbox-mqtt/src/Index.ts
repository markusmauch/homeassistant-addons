import * as Modbus from "./ModbusUtils";
import * as Mqtt from "./MqttUtils";
import Queue from "queue";
import commandLineArgs, { OptionDefinition } from "command-line-args";

const optionDefinitions: OptionDefinition[] = [
    { name: "mqtt_host", type: String, defaultValue: "homeassistant.local" },
    { name: "mqtt_username", type: String, defaultValue: "" },
    { name: "mqtt_password", type: String, defaultValue: "" },
    { name: "topic", type: String, defaultValue: "powerbox" },
    { name: "powerbox_host", type: String, defaultValue: "192.168.0.234" },
    { name: "powerbox_port", type: String, defaultValue: 502 },
    { name: "powerbox_unit_id", type: String, defaultValue: 10 },
  ]

const options = commandLineArgs(optionDefinitions);

const MQTT_HOST = options.mqtt_host;
const MQTT_USERNAME = options.mqtt_username;
const MQTT_PASSWORD = options.mqtt_password;
const TOPIC = `homeassistant/sensor/${options.topic}`;
const POWERBOX_HOST = options.powerbox_host;
const POWERBOX_PORT = options.powerbox_port;
const POWERBOX_UNIT_ID = options.powerbox_unit_id;

const CYAN = '\x1b[36m%s\x1b[0m';
const DELAY = 250;

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

const entityNames: { [key in Address]: string } = {
    aussentemperatur: `${TOPIC.toLowerCase()}_aussentemperatur`,
    betriebsart: `${TOPIC.toLowerCase()}_betriebsart`,
    luftfeuchtigkeit: `${TOPIC.toLowerCase()}_luftfeuchtigkeit`,
    luftungsstufe: `${TOPIC.toLowerCase()}_luftungsstufe`,
    raumtemperatur: `${TOPIC.toLowerCase()}_raumtemperatur`,
    stossluftung: `${TOPIC.toLowerCase()}_stosslüftung`,
};

const queue = Queue();
queue.concurrency = 1;
queue.autostart = true;

const commandTopics = [
    `${TOPIC}/betriebsart/state`,
    `${TOPIC}/luftungsstufe/state`,
];

const mqttClient = Mqtt.connect( `mqtt://${MQTT_HOST}`, MQTT_USERNAME, MQTT_PASSWORD );
console.log( CYAN, `Connected to MQTT host '${MQTT_HOST}'` );

mqttClient.subscribe(commandTopics, {qos: 0}, ( err, res ) =>
{
    if ( err )
    {
        console.error(err);
    }
    else
    {
        commandTopics.forEach( topic => console.log( CYAN, `Subscribed to topic "${topic}"` ) );
    }
} );

mqttClient.on( "connect", async () =>
{
    console.log( CYAN, `Announcing Entity '${entityNames["raumtemperatur"]}'` );
    await Mqtt.publish( mqttClient, `${TOPIC}/raumtemperatur/config`, JSON.stringify( {
        "name": entityNames["raumtemperatur"],
        "device_class": "temperature",
        "unit_of_measurement": "°C",
        "state_topic": `${TOPIC}/raumtemperatur/state`
    } ) );

    console.log(CYAN, `Announcing Entity '${entityNames["aussentemperatur"]}'`);
    await Mqtt.publish( mqttClient, `${TOPIC}/aussentemperatur/config`, JSON.stringify( {
        "name": entityNames["aussentemperatur"],
        "device_class": "temperature",
        "unit_of_measurement": "°C",
        "state_topic": `${TOPIC}/aussentemperatur/state`
    } ) );

    console.log(CYAN, `Announcing Entity '${entityNames["luftfeuchtigkeit"]}'`);
    await Mqtt.publish( mqttClient, `${TOPIC}/luftfeuchtigkeit/config`, JSON.stringify( {
        "name": entityNames["luftfeuchtigkeit"],
        "device_class": "humidity",
        "unit_of_measurement": "%",
        "state_topic": `${TOPIC}/luftfeuchtigkeit/state`
    } ) );

    console.log(CYAN, `Announcing Entity '${entityNames["betriebsart"]}'`);
    await Mqtt.publish( mqttClient, `${TOPIC}/betriebsart/config`, JSON.stringify( {
        "name": entityNames["betriebsart"],
        "state_topic": `${TOPIC}/betriebsart/state`
    } ) );

    console.log(CYAN, `Announcing Entity '${entityNames["luftungsstufe"]}'`);
    await Mqtt.publish( mqttClient, `${TOPIC}/luftungsstufe/config`, JSON.stringify( {
        "name": entityNames["luftungsstufe"],
        "state_topic": `${TOPIC}/luftungsstufe/state`
    } ) );

    console.log( CYAN, "START Polling Data" );
    Promise.all( [
        ( async () =>
        {
            while ( true )
            {
                queue.push( () => readAndPublish( "raumtemperatur", `${TOPIC}/raumtemperatur/state`, 0.1, 1 ) );
                queue.push( () => readAndPublish( "aussentemperatur", `${TOPIC}/aussentemperatur/state`, 0.1, 1 ) );
                queue.push( () => readAndPublish( "luftfeuchtigkeit", `${TOPIC}/luftfeuchtigkeit/state`, 1, 0 ) );
                await delay(60000);
            }
        } )(),
        ( async () =>
        {
            while ( true )
            {
                queue.push( () => readAndPublish( "betriebsart", `${TOPIC}/betriebsart/state`, 1, 0 ) );
                queue.push( () => readAndPublish( "luftungsstufe", `${TOPIC}/luftungsstufe/state`, 1, 0 ) );
                await delay(5000);
            }
        } )(),
    ] );
} );

mqttClient.on( "message", ( topic, message, info )=>
{
    const value = parseInt( message.toString() );
    if ( info.properties?.userProperties?.self !== "true" )
    {
        queue.splice(0);
        if ( topic === `${TOPIC}/betriebsart/state` )
        {
            queue.push( () => write( "betriebsart", value ) );
        }
        else if ( topic === `${TOPIC}/luftungsstufe/state` )
        {
            queue.push( () => write( "luftungsstufe", value ) );
        }
    }
} );

async function write( address: Address, value: number )
{
    const modbusConnection = await Modbus.connect( POWERBOX_HOST, POWERBOX_PORT, POWERBOX_UNIT_ID );
    console.log( CYAN, `START Writing value "${value}" to address "${address}"` );
    const buffer = Buffer.from( [ 0, value ] );
    await Modbus.write( modbusConnection, modbusAddresses[address], buffer );
    await Modbus.close( modbusConnection );
    await delay(DELAY);
    console.log( CYAN, `END Writing value "${value}" to address "${address}"` );
}

async function readAndPublish(address: Address, topic: string, scale = 1, precision = 1)
{
    console.log( CYAN, `START Reading value of '${address}'` );
    const modbusConnection = await Modbus.connect( POWERBOX_HOST, POWERBOX_PORT, POWERBOX_UNIT_ID );
    const result = await Modbus.read(modbusConnection, modbusAddresses[address]);
    if ( result !== null )
    {
        const value = ( parseFloat( result.data[1].toString() ) * scale).toFixed( precision );
        console.log( CYAN, `Publishing value '${value}' to topic '${topic}'` );
        await Mqtt.publish(mqttClient, topic, value.toString());
    }
    await Modbus.close( modbusConnection );
    await delay(DELAY);
    console.log( CYAN, `END Reading value of '${address}'` );
}

async function delay( length: number )
{
    return new Promise<void>( (resolve, reject) =>
    {
        setTimeout( () => resolve(), length );
    } );
}

process.stdin.resume(); //so the program will not close instantly

function exitHandler( options: any, exitCode: any )
{
    if (options.cleanup)
    {
        console.log( CYAN, "END Polling Data" );
        queue.end();
        console.log( CYAN, "Closing MQTT connection." );
        mqttClient.unsubscribe(commandTopics);
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