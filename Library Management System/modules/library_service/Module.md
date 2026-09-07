# library_service

RESTful backend for the Library & Resource Management System.

- **Port:** 9090
- **Base path:** `/library`
- **Storage:** in-memory `map<Asset>` keyed by `assetTag`; resets on restart,
  re-seeded with 5 representative assets.

## Files

| File | Purpose |
|------|---------|
| `types.bal` | All data model records (`Asset`, `Component`, `Schedule`, `WorkOrder`, `Task`, `LoanRecord`) and HTTP payloads. |
| `store.bal` | In-memory store, seed data, clone/filter/date helpers. |
| `service.bal` | HTTP resource functions (all endpoints documented in the project root `README.md`). |

## Build & run

```bash
# from this folder
bal build
java -jar target/bin/library_service.jar
```

or from the repo root, open this folder in VS Code and run the
**Ballerina: Run service (background)** task / the **Run library_service**
debug configuration.
