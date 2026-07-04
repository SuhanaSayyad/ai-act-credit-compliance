from neo4j import GraphDatabase
from dotenv import load_dotenv
import os

load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

driver = None

def get_driver():
    global driver
    if driver is None:
        driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
    return driver

def test_connection():
    try:
        d = get_driver()
        with d.session() as session:
            session.run("RETURN 1")
        print("Connected to Neo4j")
    except Exception as e:
        print(f"Connection failed: {e}")

def close_driver():
    global driver
    if driver:
        driver.close()
        driver = None
