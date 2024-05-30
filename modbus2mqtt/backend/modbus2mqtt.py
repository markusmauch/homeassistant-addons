import asyncio
from datetime import datetime
import json
import re
import schedule
import time
from urllib.parse import urlparse
from pymodbus.client.tcp import ModbusTcpClient as ModbusClient
from pymodbus.constants import Endian
from pymodbus.payload import BinaryPayloadBuilder
from pymodbus.payload import BinaryPayloadDecoder
from paho.mqtt import client as MqttClient
from paho.mqtt import enums as MqttEnums
from paho.mqtt.properties import Properties
from paho.mqtt.packettypes import PacketTypes
from config import deserialize
from logger import Logger

RUNNING = False

async def main() -> None:
    start()

def start():
    global mqtt_client
    global mqtt_config
    global devices
    global RUNNING

    if RUNNING == False:

        try:
            RUNNING = True
            mqtt_config, devices = deserialize("config.json")
            init_mqtt_client()
            announce_sensors()
            start_polling()
            while RUNNING == True:
                schedule.run_pending()
                time.sleep(1)

        except Exception as exception:
            Logger.info(f"{type(exception)}: {exception}")

        finally:
            RUNNING = False
            if mqtt_client != None and mqtt_client.is_connected():
                mqtt_client.loop_stop()
                mqtt_client.disconnect()

def stop():
    
    global mqtt_client
    global mqtt_config
    global devices
    global RUNNING
    
    if RUNNING == True:
    
        RUNNING = False
        schedule.clear()
        if modbus_client != None and modbus_client.connected:
            modbus_client.close()
        if mqtt_client != None:
            mqtt_client.disconnect();

def init_mqtt_client():
    global mqtt_client
    global mqtt_config
    mqtt_host = urlparse(mqtt_config.host).hostname
    mqtt_port = urlparse(mqtt_config.host).port or 1883
    mqtt_username = mqtt_config.username;
    mqtt_password = mqtt_config.password;
    mqtt_client = MqttClient.Client(MqttEnums.CallbackAPIVersion.VERSION2, protocol=MqttEnums.MQTTProtocolVersion.MQTTv5);
    mqtt_client.username_pw_set(mqtt_username, mqtt_password)
    mqtt_client.on_connect = on_connect_mqtt
    mqtt_client.on_disconnect = on_disconnect_mqtt
    mqtt_client.on_message = on_message_mqtt
    mqtt_client.connect(mqtt_host, mqtt_port, properties=None)
    subscribe_mqtt_topics()
    mqtt_client.loop_start()

def subscribe_mqtt_topics():
    global mqtt_client
    global devices
    for device in devices:
        for component in device.components:
            if component.access_mode == "read-write":
                topic = f"{device.topic}/{component.type}/{device.unique_id}/{component.unique_id}/state"
                Logger.info(f"Subscribing to topic '{topic}'")
                mqtt_client.subscribe(topic, properties=None)

def start_polling():
    global devices
    for device in devices:
        for component in device.components:
            schedule.every( component.poll_interval).seconds.do(
                read_and_publish,
                device.host,
                component.modbus_address,
                f"{device.topic}/{component.type}/{device.unique_id}/{component.unique_id}/state",
                component.scale,
                component.precision
            )

def publish_mqtt(topic, value):
    global mqtt_client
    Logger.info(f"Publishing value '{value}' to topic '{topic}'")
    properties = Properties(PacketTypes.PUBLISH)
    properties.UserProperty = [("publisher", "powerbox2mqtt")]
    mqtt_client.publish(topic, str(value), properties=properties)

def on_message_mqtt(client, userdata, message):
    global devices
    if is_own_message(message) == False:
        for device in devices:
            for component in device.components:
                if component.access_mode == "read-write":
                    topic = f"{device.topic}/{component.type}/{device.unique_id}/{component.unique_id}/state"
                    if topic == message.topic:
                        value = int(message.payload.decode("utf-8"))
                        params = parse_topic(message.topic)
                        write(device.host, component.modbus_address, value)

def parse_topic(topic):
    pattern = r"^(?P<device_topic>[^/]+)/(?P<component_type>[^/]+)/(?P<device_name>[^/]+)/(?P<component_topic>[^/]+)/state$"
    match = re.match(pattern, topic)
    if match:
        return match.groupdict()
    else:
        return None

def is_own_message(message):
    if hasattr(message.properties, "UserProperty"):
        for tuple in message.properties.UserProperty:
            key, value = tuple
            if key == "publisher" and value == "powerbox2mqtt":
                return True
    return False

def on_connect_mqtt(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print("Connected to MQTT Broker!")
    else:
        print("Failed to connect, return code %d\n", reason_code)
        stop()

def on_disconnect_mqtt(client, userdata, flags, reason_code, properties):
    stop()

def announce_sensor(topic: str, name: str, unique_id: str, state_topic: str, value_template: str, device_class = None, state_class = None, unit_of_measurement: str = None, json_attributes_topic = None ):
    global mqtt_client
    msg = {
        "name": name,
        "state_topic": state_topic,
        "value_template": value_template,
        "state_class": state_class,
        "unique_id": unique_id
    }
    if device_class != None: msg["device_class"] = device_class
    if unit_of_measurement != None: msg["unit_of_measurement"] = unit_of_measurement
    if json_attributes_topic != None: msg["json_attributes_topic"] = json_attributes_topic
    Logger.info(f"Announcing sensor: {msg}")
    Logger.info("")
    mqtt_client.publish( topic, json.dumps( msg ) )

def announce_sensors():
    global devices
    for device in devices:
        for component in device.components:
            if component.access_mode == "read":
                announce_sensor(
                    topic=f"{device.topic}/{component.type}/{device.unique_id}/{component.unique_id}/config",
                    name=f"{device.unique_id}_{component.unique_id}",
                    unique_id=f"{device.name} {component.name}",
                    state_topic=f"{device.topic}/{component.type}/{device.unique_id}/{component.unique_id}/state",
                    value_template=None,
                    device_class=component.device_class,
                    state_class=component.state_class,
                    unit_of_measurement=component.unit_of_measurement
                )
    
def write(modbus_uri, modbus_address, value):
    global mqtt_client
    Logger.info(f"START Writing value '{value}' to address '{modbus_address}'")
    modbus_host = urlparse(modbus_uri).hostname
    modbus_port = urlparse(modbus_uri).port or 1883
    modbus_client = ModbusClient(modbus_host, port=modbus_port)
    if modbus_client.connect() == True:
        try:
            modbus_client.write_registers(modbus_address, value)
        except Exception as e:
            print(f"Error writing value to address {modbus_address}: {e}")
        finally:
            modbus_client.close()
            modbus_client = None
    time.sleep(1)
    Logger.info(f"END Writing value '{value}' to address '{modbus_address}'")
    Logger.info("")

def read_and_publish(modbus_uri, modbus_address, mqtt_topic, scale=1, precision=1):
    global modbus_client
    Logger.info(f"START Reading value of address '{modbus_address}'")
    modbus_host = urlparse(modbus_uri).hostname
    modbus_port = urlparse(modbus_uri).port or 1883
    modbus_client = ModbusClient(modbus_host, port=modbus_port)
    if modbus_client.connect() == True:
        try:
            result = modbus_client.read_holding_registers(modbus_address, 1)
            if result.isError():
                Logger.error(f"Error reading value from address '{modbus_address}': {result}")
            else:
                value = result.registers[0]
                scaled_value = round(value * scale, precision)
                publish_mqtt(mqtt_topic, scaled_value)
        except Exception as e:
            print(f"Error reading and publishing value from address '{modbus_address}': {e}")
        finally:
            modbus_client.close()
            modbus_client = None
    time.sleep(1)
    Logger.info(f"END Reading value of '{modbus_address}'")
    Logger.info("")

    
# run async main
if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as err:
        Logger.info(f"{type(err)}: {err}")
