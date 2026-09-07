# library_client

Interactive CLI that talks to `library_service` over HTTP/JSON.

- **Server URL:** `http://localhost:9090/library` (configurable at the top of `api.bal`)
- **No shared types** with the server — the client decodes the JSON wire
  format on the fly, so the two modules can evolve independently.

## Files

| File | Purpose |
|------|---------|
| `api.bal` | Thin wrapper around `http:Client` exposing every endpoint as a typed `ApiResult`. |
| `display.bal` | Coloured terminal output helpers and safe JSON accessors. |
| `main.bal` | Menu loop and per-feature flow. |

## Build & run

```bash
# from this folder (the service must be running on :9090)
bal run .
```

or run the **Run library_client** debug configuration in VS Code.
