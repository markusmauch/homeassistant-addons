import * as Modbus from "./ModbusUtils";
import * as Mqtt from "./MqttUtils";
import Queue from "queue";
import schedule from "node-schedule";
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
const TOPIC = options.topic;
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
    | "einschlaffunktion"
    | "luftungsstufe";

const modbusAddresses: { [key in Address]: number } = {
    "raumtemperatur": 700,
    "aussentemperatur": 703,
    "luftfeuchtigkeit": 750,
    "betriebsart": 550,
    "stossluftung": 551,
    "luftungsstufe": 554,
    "einschlaffunktion": 559,
};

const entityNames: { [key in Address]: string } = {
    aussentemperatur: `${TOPIC}_aussentemperatur`,
    betriebsart: `${TOPIC}_betriebsart`,
    luftfeuchtigkeit: `${TOPIC}_luftfeuchtigkeit`,
    luftungsstufe: `${TOPIC}_luftungsstufe`,
    raumtemperatur: `${TOPIC}_raumtemperatur`,
    stossluftung: `${TOPIC}_stossluftung`,
    einschlaffunktion: `${TOPIC}_einschlaffunktion`,
};

const queue = Queue();
queue.concurrency = 1;
queue.autostart = true;

const mqttClient = Mqtt.connect( `mqtt://${MQTT_HOST}`, MQTT_USERNAME, MQTT_PASSWORD );
console.log( CYAN, `Connected to MQTT host '${MQTT_HOST}'` );

const subscriptions = [
    `homeassistant/sensor/${TOPIC}/betriebsart/state`,
    `homeassistant/sensor/${TOPIC}/luftungsstufe/state`,
    `homeassistant/binary_sensor/${TOPIC}/stossluftung/state`,
    `homeassistant/binary_sensor/${TOPIC}/einschlaffunktion/state`,
];

mqttClient.subscribe(subscriptions, {qos: 0}, ( err, res ) =>
{
    if ( err )
    {
        console.error(err);
    }
    else
    {
        subscriptions.forEach( topic => console.log( CYAN, `Subscribed to topic "${topic}"` ) );
    }
} );

mqttClient.on( "connect", async () =>
{
    console.log( CYAN, `Announcing Entity '${entityNames["raumtemperatur"]}'` );
    await Mqtt.publish( mqttClient, `homeassistant/sensor/${TOPIC}/raumtemperatur/config`, JSON.stringify( {
        "name": entityNames["raumtemperatur"],
        "device_class": "temperature",
        "unit_of_measurement": "°C",
        "state_topic": `homeassistant/sensor/${TOPIC}/raumtemperatur/state`
    } ), true );

    console.log(CYAN, `Announcing Entity '${entityNames["aussentemperatur"]}'`);
    await Mqtt.publish( mqttClient, `homeassistant/sensor/${TOPIC}/aussentemperatur/config`, JSON.stringify( {
        "name": entityNames["aussentemperatur"],
        "device_class": "temperature",
        "unit_of_measurement": "°C",
        "state_topic": `homeassistant/sensor/${TOPIC}/aussentemperatur/state`
    } ), true );

    console.log(CYAN, `Announcing Entity '${entityNames["luftfeuchtigkeit"]}'`);
    await Mqtt.publish( mqttClient, `homeassistant/sensor/${TOPIC}/luftfeuchtigkeit/config`, JSON.stringify( {
        "name": entityNames["luftfeuchtigkeit"],
        "device_class": "humidity",
        "unit_of_measurement": "%",
        "state_topic": `homeassistant/sensor/${TOPIC}/luftfeuchtigkeit/state`
    } ), true );

    console.log(CYAN, `Announcing Entity '${entityNames["betriebsart"]}'`);
    await Mqtt.publish( mqttClient, `homeassistant/sensor/${TOPIC}/betriebsart/config`, JSON.stringify( {
        "name": entityNames["betriebsart"],
        "state_topic": `homeassistant/sensor/${TOPIC}/betriebsart/state`,
        "icon": "mdi:power"
    } ), true );

    console.log(CYAN, `Announcing Entity '${entityNames["stossluftung"]}'`);
    await Mqtt.publish( mqttClient, `homeassistant/binary_sensor/${TOPIC}/stossluftung/config`, JSON.stringify( {
        "name": entityNames["stossluftung"],
        "state_topic": `homeassistant/binary_sensor/${TOPIC}/stossluftung/state`,
        "icon": "mdi:weather-dust",
        "payload_on": 1,
        "payload_off": 0
    } ),true );

    console.log(CYAN, `Announcing Entity '${entityNames["einschlaffunktion"]}'`);
    await Mqtt.publish( mqttClient, `homeassistant/binary_sensor/${TOPIC}/einschlaffunktion/config`, JSON.stringify( {
        "name": entityNames["einschlaffunktion"],
        "state_topic": `homeassistant/binary_sensor/${TOPIC}/einschlaffunktion/state`,
        "icon": "mdi:bed-clock",
        "payload_on": 1,
        "payload_off": 0
    } ), true );

    
    console.log( CYAN, "START Polling Data" );

    schedule.scheduleJob( "0/10 * * * * *", () => { queue.push( () => readAndPublish( "betriebsart", `homeassistant/sensor/${TOPIC}/betriebsart/state`, 1, 0 ) ) } );
    schedule.scheduleJob( "15/10 * * * * *", () => { queue.push( () => readAndPublish( "luftungsstufe", `homeassistant/sensor/${TOPIC}/luftungsstufe/state`, 1, 0 ) ) } );
    schedule.scheduleJob( "30/10 * * * * *", () => { queue.push( () => readAndPublish( "stossluftung", `homeassistant/binary_sensor/${TOPIC}/stossluftung/state`, 1, 0 ) ) } );
    schedule.scheduleJob( "45/10 * * * * *", () => { queue.push( () => readAndPublish( "einschlaffunktion", `homeassistant/binary_sensor/${TOPIC}/einschlaffunktion/state`, 1, 0 ) ) } );
    schedule.scheduleJob( "10/60 * * * * *", () => { queue.push( () => readAndPublish( "raumtemperatur", `homeassistant/sensor/${TOPIC}/raumtemperatur/state`, 0.1, 1 ) ) } );
    schedule.scheduleJob( "20/60 * * * * *", () => { queue.push( () => readAndPublish( "aussentemperatur", `homeassistant/sensor/${TOPIC}/aussentemperatur/state`, 0.1, 1 ) ) } );
    schedule.scheduleJob( "30/60 * * * * *", () => { queue.push( () => readAndPublish( "luftfeuchtigkeit", `homeassistant/sensor/${TOPIC}/luftfeuchtigkeit/state`, 1, 0 ) ) } );
} );

mqttClient.on( "message", ( topic, message, info )=>
{
    const value = parseInt( message.toString() );
    if ( info.properties?.userProperties?.self !== "true" )
    {
        if ( topic === `homeassistant/sensor/${TOPIC}/betriebsart/state` )
        {
            queue.push( () => write( "betriebsart", value ) );
        }
        else if ( topic === `homeassistant/sensor/${TOPIC}/luftungsstufe/state` )
        {
            queue.push( () => write( "luftungsstufe", value ) );
        }
        else if ( topic === `homeassistant/binary_sensor/${TOPIC}/stossluftung/state` )
        {
            queue.push( () => write( "stossluftung", value ) );
        }
        else if ( topic === `homeassistant/binary_sensor/${TOPIC}/einschlaffunktion/state` )
        {
            queue.push( () => write( "einschlaffunktion", value ) );
        }
    }
} );

async function write( address: Address, value: number )
{
    console.log( CYAN, `START Writing value "${value}" to address "${address}"` );
    const connection = await Modbus.connect( POWERBOX_HOST, POWERBOX_PORT, POWERBOX_UNIT_ID );
    connection.on("error", () => connection.close(() => {}));
    const buffer = Buffer.from( [ 0, value ] );
    await Modbus.write( connection, modbusAddresses[address], buffer );
    await Modbus.close( connection );
    await delay(1000);
    console.log( CYAN, `END Writing value "${value}" to address "${address}"` );
}

async function readAndPublish(address: Address, topic: string, scale = 1, precision = 1)
{
    console.log( CYAN, `START Reading value of '${address}'` );
    const connection = await Modbus.connect( POWERBOX_HOST, POWERBOX_PORT, POWERBOX_UNIT_ID );
    connection.on("error", () => connection.close(() => {}));
    const result = await Modbus.read(connection, modbusAddresses[address]);
    if ( result !== null )
    {
        const value = ( parseFloat( result.data[1].toString() ) * scale).toFixed( precision );
        console.log( CYAN, `Publishing value '${value}' to topic '${topic}'` );
        await Mqtt.publish(mqttClient, topic, value.toString());
    }
    await Modbus.close( connection );
    await delay(1000);
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
        mqttClient.unsubscribe(subscriptions);
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