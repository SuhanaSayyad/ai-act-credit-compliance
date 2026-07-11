from neo4j import GraphDatabase
from dotenv import load_dotenv
import os

load_dotenv()

NEO4J_URI      = os.getenv("NEO4J_URI", "")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "")

_driver = None

def get_driver():
    global _driver
    if _driver is None:
        if not NEO4J_URI:
            raise RuntimeError(
                "NEO4J_URI is not set. "
                "Add it to Hugging Face Space secrets under Settings."
            )
        _driver = GraphDatabase.driver(
            NEO4J_URI,
            auth=(NEO4J_USERNAME, NEO4J_PASSWORD),
            connection_timeout=10,
            max_connection_lifetime=300,
            max_connection_pool_size=5,
        )
    return _driver

def test_connection():
    d = get_driver()
    with d.session() as session:
        session.run("RETURN 1")
    print("Connected to Neo4j", flush=True)

def close_driver():
    global _driver
    if _driver:
        _driver.close()
        _driver = None