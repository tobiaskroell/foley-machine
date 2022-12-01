
# Automatic Foley Machine
    
## Installation

Clone the project

```bash
  git clone https://github.com/KevinKroell/avprg-project
```

### Node server
Change into node.js directory
```bash
  cd ./node_server
```
Install dependencies with npm

```bash
  npm install
```

### Python server
    
## Run Locally

### Start Node server
Change into node directory
```bash
  cd ./node_server
```

Start the server

```bash
  npm start
```

### Start Python server


## API Reference

#### Send video to python server

```http
  POST /video
```

| Required Type | Description |
| :------------ | :---------- |
| `json`        | **Required**. Information about video to be processed. |

```
  {
      "video_name" : funnycats.mp4
  }
```
## Authors

- [@KevinKroell](https://github.com/KevinKroell)
- [@SirMightyMo](https://github.com/SirMightyMo)
- [@LeanderWernst](https://github.com/LeanderWernst)