# Neuron Delta

This repository contains the frontend code of Neuron Delta.

## Running

To run, use the following commands:

```sh
bun install
bun run dev
```

## Testing

To run tests, you may do the following:

```sh
bun run test
```

Make sure the path to the API server is in `../DeltaAPI`. If it is in another directory, run:

```sh
API_SERVER_PATH=/path/to/delta-api ./scripts/runTests.sh
```

If you are on Windows, run the API server separately, and run the preview server using:

```sh
bun run preview
```

To run the tests on Windows:

```batch
bun test
bun run test:playwright
```
