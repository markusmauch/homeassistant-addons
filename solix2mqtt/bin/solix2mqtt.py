import asyncio
from datetime import datetime
import json
import logging
import os
import random
import sys
import time
from aiohttp import ClientSession
from api import api
from paho.mqtt import client as mqtt
from paho.mqtt import enums
from urllib.parse import urlparse

_LOGGER: logging.Logger = logging.getLogger(__name__)
_LOGGER.addHandler(logging.StreamHandler(sys.stdout))
CONSOLE: logging.Logger = logging.getLogger("console")
CONSOLE.addHandler(logging.StreamHandler(sys.stdout))
CONSOLE.setLevel(logging.INFO)

S2M_USER = os.getenv( "S2M_USER" )
S2M_PASSWORD = os.getenv( "S2M_PASSWORD" )
S2M_COUNTRY = os.getenv( "S2M_COUNTRY" )
S2M_MQTT_URI = os.getenv( "S2M_MQTT_URI" )
S2M_MQTT_USERNAME = os.getenv( "S2M_MQTT_USERNAME" )
S2M_MQTT_PASSWORD = os.getenv( "S2M_MQTT_PASSWORD" )
S2M_MQTT_TOPIC = os.getenv( "S2M_MQTT_TOPIC" )
S2M_POLL_INTERVAL = int(os.getenv("S2M_POLL_INTERVAL"))
MQTT_HOST = urlparse(S2M_MQTT_URI).hostname
MQTT_PORT = urlparse(S2M_MQTT_URI).port or 1883
CLIENT_ID = f'python-mqtt-{random.randint(0, 1000)}'
FIRST_RECONNECT_DELAY = 1
RECONNECT_RATE = 2
MAX_RECONNECT_COUNT = 12
MAX_RECONNECT_DELAY = 60

def print_env():
    print(f"S2M_USER: {S2M_USER}")
    print(f"S2M_PASSWORD: {S2M_PASSWORD}")
    print(f"S2M_COUNTRY: {S2M_COUNTRY}")
    print(f"S2M_MQTT_URI: {S2M_MQTT_URI}")
    print(f"S2M_MQTT_USERNAME: {S2M_MQTT_USERNAME}")
    print(f"S2M_MQTT_PASSWORD: {S2M_MQTT_PASSWORD}")
    print(f"S2M_MQTT_TOPIC: {S2M_MQTT_TOPIC}")
    print(f"S2M_POLL_INTERVAL: {S2M_POLL_INTERVAL}")
    print(f"MQTT_HOST: {MQTT_HOST}")
    print(f"MQTT_PORT: {MQTT_PORT}")
    print(f"CLIENT_ID: {CLIENT_ID}")
    print(f"FIRST_RECONNECT_DELAY: {FIRST_RECONNECT_DELAY}")
    print(f"RECONNECT_RATE: {RECONNECT_RATE}")
    print(f"MAX_RECONNECT_COUNT: {MAX_RECONNECT_COUNT}")
    print(f"MAX_RECONNECT_DELAY: {MAX_RECONNECT_DELAY}")

def connect_mqtt():
    client = mqtt.Client(enums.CallbackAPIVersion.VERSION2)
    client.username_pw_set(S2M_MQTT_USERNAME, S2M_MQTT_PASSWORD)
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.connect(MQTT_HOST, MQTT_PORT)
    return client

def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print("Connected to MQTT Broker!")
    else:
        print("Failed to connect, return code %d\n", reason_code)

def on_disconnect(client, userdata, flags, reason_code, properties):
    logging.info("Disconnected with result code: %s", reason_code)
    reconnect_count, reconnect_delay = 0, FIRST_RECONNECT_DELAY
    while reconnect_count < MAX_RECONNECT_COUNT:
        logging.info("Reconnecting in %d seconds...", reconnect_delay)
        time.sleep(reconnect_delay)
        try:
            client.reconnect()
            logging.info("Reconnected successfully!")
            return
        except Exception as err:
            logging.error("%s. Reconnect failed. Retrying...", err)
        reconnect_delay *= RECONNECT_RATE
        reconnect_delay = min(reconnect_delay, MAX_RECONNECT_DELAY)
        reconnect_count += 1
    logging.info("Reconnect failed after %s attempts. Exiting...", reconnect_count)

def announce_sensor( client: mqtt.Client, topic: str, name: str, unique_id: str, state_topic: str, value_template: str, device_class = None, state_class = None, unit_of_measurement = None, json_attributes_topic = None ):
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
    CONSOLE.info(f"Announcing sensor: {msg}")
    CONSOLE.info("")
    client.publish( topic, json.dumps( msg ) )

def announce_sensors(client, site_list):
    client.loop_start()
    for site in site_list.get("site_list"):
        site_name = site["site_name"]
        announce_sensors_for_site(client, site_name)
    client.loop_stop()

def announce_sensors_for_site(client: mqtt.Client, site_name: str):
    announce_sensor(
        client,
        "homeassistant/sensor/solarbank_e1600/battery_level/config",
        f"Solarbank E1600 {site_name} Battery Level",
        f"solarbank_e1600_{site_name}_battery_level",
        f"{S2M_MQTT_TOPIC}/{site_name}/scene_info",
        "{{ ( value_json.solarbank_info.total_battery_power | float ) * 100 }}",
        "battery",
        "%"
    )

    # Publish photovoltaic power sensor
    announce_sensor(
        client,
        "homeassistant/sensor/solarbank_e1600/photovoltaic_power/config",
        f"Solarbank E1600 {site_name} Photovoltaic Power",
        f"solarbank_e1600_{site_name}_photovoltaic_power",
        f"{S2M_MQTT_TOPIC}/{site_name}/scene_info",
        "{{ value_json.solarbank_info.total_photovoltaic_power | float }}",
        "power",
        "measurement",
        "W"
    )

    # Publish photovoltaic yield sensor
    announce_sensor(
        client,
        "homeassistant/sensor/solarbank_e1600/photovoltaic_yield/config",
        f"Solarbank E1600 {site_name} Photovoltaic Yield",
        f"solarbank_e1600_{site_name}_photovoltaic_yield",
        f"{S2M_MQTT_TOPIC}/{site_name}/scene_info",
        "{{ value_json.statistics[0].total | float }}",
        "energy",
        "measurement",
        "kWh"
    )

    # Publish output power sensor
    announce_sensor(
        client,
        "homeassistant/sensor/solarbank_e1600/output_power/config",
        f"Solarbank E1600 {site_name} Output Power",
        f"solarbank_e1600_{site_name}_output_power",
        f"{S2M_MQTT_TOPIC}/{site_name}/scene_info",
        "{{ value_json.solarbank_info.total_output_power | float }}",
        "power",
        "measurement",
        "W"
    )

    # Publish charging power sensor
    announce_sensor(
        client,
        "homeassistant/sensor/solarbank_e1600/charging_power/config",
        f"Solarbank E1600 {site_name} Charging Power",
        f"solarbank_e1600_{site_name}_charging_power",
        f"{S2M_MQTT_TOPIC}/{site_name}/scene_info",
        "{{ value_json.solarbank_info.total_charging_power | float }}",
        "power",
        "W"
    )

    # Publish last update
    announce_sensor(
        client,
        "homeassistant/sensor/solarbank_e1600/last_update/config",
        f"Solarbank E1600 {site_name} Last Update",
        f"solarbank_e1600_{site_name}_last_update",
        f"{S2M_MQTT_TOPIC}/{site_name}/scene_info",
        "{{ value_json.solarbank_info.updated_time }}"
    )

    # Publish charging status
    announce_sensor(
        client,
        "homeassistant/sensor/solarbank_e1600/charging_status/config",
        f"Solarbank E1600 {site_name} Charging Status",
        f"solarbank_e1600_{site_name}_charging_status",
        f"{S2M_MQTT_TOPIC}/{site_name}/scene_info",
        "{{ value_json.solarbank_info.solarbank_list[0].charging_status }}"
    )

    # Publish statistics co2 savings
    announce_sensor(
        client,
        "homeassistant/sensor/solarbank_e1600/co2_savings/config",
        f"Solarbank E1600 {site_name} CO2 Savings",
        f"solarbank_e1600_{site_name}_co2_savings",
        f"{S2M_MQTT_TOPIC}/{site_name}/scene_info",
        "{{ value_json.statistics[1].total }}",
        "weight",
        "kg"
    )

    # Publish statistics saved costs
    announce_sensor(
        client,
        "homeassistant/sensor/solarbank_e1600/saved_costs/config",
        f"Solarbank E1600 {site_name} Saved Costs",
        f"solarbank_e1600_{site_name}_saved_costs",
        f"{S2M_MQTT_TOPIC}/{site_name}/scene_info",
        "{{ value_json.statistics[3].total }}",
        "monetary",
        "EUR"
    )

    # Publish schedule
    announce_sensor(
        client,
        "homeassistant/sensor/solarbank_e1600/schedule/config",
        f"Solarbank E1600 {site_name} Schedule",
        f"solarbank_e1600_{site_name}_schedule",
        f"{S2M_MQTT_TOPIC}/{site_name}/schedule",
        "{{value_json.ranges|length}}",
        None,
        None,
        None,
        f"{S2M_MQTT_TOPIC}/{site_name}/schedule"
    )

    # Publish site homepage
    announce_sensor(
        client,
        "homeassistant/sensor/solarbank_e1600/site_homepage/config",
        f"Solarbank E1600 {site_name} Site Homepage",
        f"solarbank_e1600_{site_name}_site_homepage",
        f"{S2M_MQTT_TOPIC}/{site_name}",
        "{{value_json.friendly_name}}",
        None,
        None,
        None,
        f"{S2M_MQTT_TOPIC}/{site_name}"
    )

def get_site_id(site_list, site_name):
    for site in site_list:
        if site["site_name"] == site_name:
            return site["site_id"]
    return None

async def fetch_and_publish_sites(solix: api.AnkerSolixApi, client: mqtt.Client, site_list):
    client.loop_start()
    for site in site_list.get("site_list"):
        site_id = site["site_id"]
        site_name = site["site_name"]

        site_homepage = await solix.get_homepage()
        site_homepage_json = json.dumps( site_homepage )
        CONSOLE.info(f"Site Homepage: {site_homepage_json}")
        client.publish(f"{S2M_MQTT_TOPIC}/{site_name}", site_homepage_json)

        scene_info = await solix.get_scene_info(siteId=site_id)
        scene_info_json = json.dumps( scene_info )
        CONSOLE.info(f"Scene Info: {scene_info_json}")
        client.publish(f"{S2M_MQTT_TOPIC}/{site_name}/scene_info", scene_info_json)

        device_param = await solix.get_device_parm(siteId=site_id)
        device_param_json = json.dumps( device_param )
        CONSOLE.info(f"Device Param: {device_param_json}")
        client.publish(f"{S2M_MQTT_TOPIC}/{site_name}/device_param", device_param_json)

    client.loop_stop()

async def main() -> None:
    try:
        async with ClientSession() as websession:
            solix = api.AnkerSolixApi(
                S2M_USER, S2M_PASSWORD, S2M_COUNTRY, websession, _LOGGER
            )
            client = connect_mqtt()
            site_list = await solix.get_site_list();
            announce_sensors(client, site_list)
            while True:
                await fetch_and_publish_sites(solix, client, site_list)
                time.sleep(S2M_POLL_INTERVAL)

    except Exception as exception:
        CONSOLE.info(f"{type(exception)}: {exception}")

# run async main
if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as err:
        CONSOLE.info(f"{type(err)}: {err}")
