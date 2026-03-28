# Mixed PostgreSQL Physical & Logical Replication Walkthrough

Our updated infrastructure deployment is completely operational. This `dbs_postgres_replication` stack runs three parallel concepts side by side, fully simulating an enterprise environment!

## The Architecture Map

1. **Primary Node** (`localhost:15432`)
   The central source of truth. Features `wal_level=logical` so that both streaming basebackups and SQL row decoding can be derived from it.
2. **Physical Standby** (`localhost:25432`)
   Connects via continuous exact-disk streaming. Whatever the primary does, the physical standby exactly mimics byte-for-byte.
3. **Logical Replica** (`localhost:35432`)
   Subscribes selectively via SQL `CREATE SUBSCRIPTION` targeting specific tables. DDL structure isn't cloned instantly, but rather row insertions are replayed transactionally.

## Inspecting WAL Volumes on the Host

As always, all Write-Ahead Logs and internal storage files are completely accessible via your host system to verify exactly how Postgres writes to disk:

- **Primary Storage:** `/tmp/data/primary/`
- **Physical Replica:** `/tmp/data/replica/`
- **Logical Replica:** `/tmp/data/logical_replica/`

> [!TIP]
> Navigating down into the `pg_wal` subdirectory of each will show you the exact transaction strings mirroring. The logical replica's WAL files will appear differently formatted than the physical node's base streaming approach since it parses records completely uniquely!

## Step-by-Step API Verification

We provided a robust verification dashboard directly within `test_api.py`. Start the server with inline dependency handling:

```bash
uv run iac/stacks/dbs_postgres_replication/test_api.py
```

With the API active on port `8000`, process this request path:

### 1. Initialize Logical Replication
Logical architectures require explicit schemas and SQL bindings. Hit the setup endpoint which will initialize schema across nodes and configure the built-in PUBLICATION & SUBSCRIPTION link properly inside the PostgreSQL layer:
```bash
curl -X POST "http://127.0.0.1:8000/setup-logical"
```

### 2. Stream Data to the Primary Node
Insert data arbitrarily into the Master container:
```bash
curl -X POST "http://127.0.0.1:8000/write?data=LogicalTestingRow"
```

### 3. Read it Off Both Endpoints!
Query the physical binary copy:
```bash
curl "http://127.0.0.1:8000/read-physical"
```

Query the active SQL replicated layout (which might take a split-second to propagate!):
```bash
curl "http://127.0.0.1:8000/read-logical"
```

> [!NOTE]
> When done exploring the `logical` WAL data, run `pulumi destroy -s dbs_postgres_replication -y` in the `iac/` folder to clean up background containers!
