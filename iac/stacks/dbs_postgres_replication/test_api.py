# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "fastapi",
#     "uvicorn",
#     "psycopg2-binary",
# ]
# ///

from fastapi import FastAPI, HTTPException
import psycopg2
import uvicorn
import uuid

app = FastAPI(title="Postgres Physical+Logical Replication Test API")

PRIMARY_DSN = "postgresql://postgres:my_password@localhost:15432/my_database"
PHYSICAL_REPLICA_DSN = "postgresql://postgres:my_password@localhost:25432/my_database"
LOGICAL_REPLICA_DSN = "postgresql://postgres:my_password@localhost:35432/my_database"
# Use docker internal hostname for the remote connection since postgres runs isolated!
LOGICAL_SUBSCRIPTION_CONNECTION = "host=postgres-primary port=5432 user=postgres password=my_password dbname=my_database"

def get_conn(dsn, autocommit=False):
    conn = psycopg2.connect(dsn)
    if autocommit:
        conn.autocommit = True
    return conn

@app.on_event("startup")
def startup_event():
    try:
        conn = get_conn(PRIMARY_DSN)
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS test_data (
                id UUID PRIMARY KEY,
                data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        cur.close()
        conn.close()
        print("Table 'test_data' initialized on primary.")
    except Exception as e:
        print(f"Startup initialization failed (primary not ready?): {e}")

@app.post("/write")
def write_data(data: str):
    new_id = str(uuid.uuid4())
    try:
        with get_conn(PRIMARY_DSN) as conn:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO test_data (id, data) VALUES (%s, %s)", (new_id, data))
                conn.commit()
        return {"status": "success", "id": new_id, "data": data, "node": "primary (15432)"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/read-physical")
def read_physical():
    try:
        with get_conn(PHYSICAL_REPLICA_DSN) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, data, created_at FROM test_data ORDER BY created_at DESC")
                rows = cur.fetchall()
        return {
            "node": "physical replica (25432) - streams binary changes matching master",
            "records": [{"id": row[0], "data": row[1], "created_at": row[2]} for row in rows]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/setup-logical")
def setup_logical():
    try:
        # 1. Create matching schema on logical replica
        with get_conn(LOGICAL_REPLICA_DSN) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS test_data (
                        id UUID PRIMARY KEY,
                        data TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                conn.commit()
        
        # 2. Create publication on Primary
        with get_conn(PRIMARY_DSN, autocommit=True) as p_conn:
            with p_conn.cursor() as cur:
                cur.execute("DROP PUBLICATION IF EXISTS my_pub")
                cur.execute("CREATE PUBLICATION my_pub FOR TABLE test_data")
        
        # 3. Create Subscription on Logical Replica
        l_conn = get_conn(LOGICAL_REPLICA_DSN, autocommit=True)
        try:
            with l_conn.cursor() as cur:
                cur.execute("DROP SUBSCRIPTION IF EXISTS my_sub")
                cur.execute(f"CREATE SUBSCRIPTION my_sub CONNECTION '{LOGICAL_SUBSCRIPTION_CONNECTION}' PUBLICATION my_pub")
        finally:
            l_conn.close()

        return {"status": "success", "message": "Logical replication initialized!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/read-logical")
def read_logical():
    try:
        with get_conn(LOGICAL_REPLICA_DSN) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, data, created_at FROM test_data ORDER BY created_at DESC")
                rows = cur.fetchall()
        return {
            "node": "logical replica (35432)",
            "records": [{"id": row[0], "data": row[1], "created_at": row[2]} for row in rows]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.0", port=8000)
