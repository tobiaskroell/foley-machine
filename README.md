# **Automatic Foley Machine**

## **Table of contents**

- [Installation](https://github.com/KevinKroell/avprg-project#installation)  
  - [Node Server](https://github.com/KevinKroell/avprg-project#node-server)
    - [Node.js](https://github.com/KevinKroell/avprg-project#applying-changes)
    - [*Optional:* Installing NVM](https://github.com/KevinKroell/avprg-project#optional-installing-nvm-node-version-manager)
    - [Using NVM](https://github.com/KevinKroell/avprg-project#using-nvm)
    - [Installing dependencies](https://github.com/KevinKroell/avprg-project#installing-dependencies)
  - [Python server](https://github.com/KevinKroell/avprg-project#python-server)
  - [Decrypt API-Tokens](https://github.com/KevinKroell/avprg-project#decrypt-api-tokens) 
    - [Setup git-secret](https://github.com/KevinKroell/avprg-project#setup-git-secret)
    - [(Re)-Encrypt Files](https://github.com/KevinKroell/avprg-project#re-encrypt-files)
- [Run locally](https://github.com/KevinKroell/avprg-project#run-locally)
  - [Start Node server](https://github.com/KevinKroell/avprg-project#start-node-server)
  - [Start Python server](https://github.com/KevinKroell/avprg-project#start-python-server)
- [Deployment](https://github.com/KevinKroell/avprg-project#deployment)
  - [Known Issues & Possible Solutions](https://github.com/KevinKroell/avprg-project#further-requirements)
  - [Installation](https://github.com/KevinKroell/avprg-project#installation-1)
    - [Further Requirements:](https://github.com/KevinKroell/avprg-project#further-requirements)
  - [Setup & Settings](https://github.com/KevinKroell/avprg-project#setup--settings)
    - [NGINX](https://github.com/KevinKroell/avprg-project#nginx)
    - [PM2 (Node)](https://github.com/KevinKroell/avprg-project#pm2-node)
    - [Uvicorn (Python)](https://github.com/KevinKroell/avprg-project#uvicorn-python)
  - [Typical Workflow](https://github.com/KevinKroell/avprg-project#typical-workflow)
    - [Startup](https://github.com/KevinKroell/avprg-project#startup)
    - [Applying Changes](https://github.com/KevinKroell/avprg-project#applying-changes)
- [API Reference](https://github.com/KevinKroell/avprg-project#api-reference)
  - [Upload video to node](https://github.com/KevinKroell/avprg-project#upload-video-to-node)
  - [Hand video to Python server](https://github.com/KevinKroell/avprg-project#hand-video-to-python-server)
- [Authors](https://github.com/KevinKroell/avprg-project#authors)

---
---
## **Installation**

Clone the project

```bash
  git clone https://github.com/KevinKroell/avprg-project
```

---

## Node server
### **Node.js**
The web server is running on **[Node.js](https://nodejs.org/) version 18.12.1 LTS** (requires at least v18.0.0), using its experimental fetch API.  

### *Optional:* Installing NVM (Node Version Manager)
To organize node installations, it is recommended to use a node version manager like [NVM (Windows)](https://github.com/coreybutler/nvm-windows/releases) or [NVM (Linux/Mac)](https://github.com/nvm-sh/nvm/releases).  
⚠️ It is recommended to uninstall Node.js if it is already installed to avoid conflicts.

On Windows, just download the latest installer provided on the link above and follow the process.  
On Linux/Mac use your terminal to run the installer and follow the process as [described here](https://github.com/nvm-sh/nvm#installing-and-updating):
```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

# or (depending on what you are using)

wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

# make sure you are installing the desired version vA.B.C
```

> Running either of the above commands downloads a script and runs it. The script clones the nvm repository to \~/.nvm, and attempts to add the source lines from the snippet below to the correct profile file (\~/.bash_profile, \~/.zshrc, \~/.profile, or \~/.bashrc).

```sh
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

After installing nvm on Windows, Linux oder MacOS, you can check the installation with `nvm -v`, which should return the version installed:

### Using NVM

To install a Node.js version:
```sh
nvm install v18.12.1
# or for the latest
nvm install latest
```
For setting a version as default (Linux/MacOS), use:

```sh
nvm alias default vA.B.C
```

For switching to a specific version, use:
```sh
nvm use vA.B.C
# or
nvm use latest
# or 
nvm use lts
```

Check selected Node version with `nvm current`.

⚠️ **Global npm modules**
> Please note that any global npm modules you may have installed are not shared between the various versions of node.js you have installed. Additionally, some npm modules may not be supported in the version of node you're using, so be aware of your environment as you work.  

(e.g. Nodemon: supported, but needs to be installed again for active version)
### Installing dependencies
Following dependencies are currently existing in this project:
- Express
- Express Fileupload
- FFProbe
- FFProbe-Static
- Finde-Remove
- Nodemon

To install them, follow these two steps:

1. Change into node.js project directory
```sh
  cd ./node_server
```
2. Install dependencies with npm

```sh
  npm install
```

---

## Python server
1. Change to directory with `cd python_server` where `requirements.txt` is located
2. Activate your virtual python environment, e.g. `conda activate YOUR-ENV`
3. Run `pip install -r requirements.txt` in your shell
4. Install PyTorch  
   See [https://pytorch.org/get-started/locally](https://pytorch.org/get-started/locally) to install pytorch.   
   Most of the time the website automatically chooses an installation that is suitable for your system.  
   For installation on AWS (Linux) install with the following command:  
   `pip3 install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cpu`

---

## Decrypt API-Tokens
The API-Tokens used to communicate with the [freesound.org API](https://freesound.org/docs/api/) and the [YouTube Data-API](https://developers.google.com/youtube/v3) have been encrypted with [git-secret](https://git-secret.io/), to prevent it from being available to anybody having access to this repository.  

⚠️If you don't want to use the integrated API-Token, you can skip this step and just insert your own `secret.js` located here: `./node_server/secret.js`  
⚠️Contents of that file should be:
```js
const freesoundToken = 'your-api-token-freesound';
const youtubeToken = 'your-api-token-youtube';
module.exports = {
    freesound: freesoundToken,
    youtube: youtubeToken
};
```
---

### Setup git-secret
In order to decrypt the needed files and use the implemented token you need to install *git-secret*, which requires some additional steps:  
1. Install [git](https://git-scm.com/)
2. Install [gpg](https://www.gnupg.org/) (Linux/Mac)
- Follow [this guide](https://www.devdungeon.com/content/gpg-tutorial#install_gpg) for instructions depending on your OS
3. Install [git-secret (Installation Guide)](https://git-secret.io/installation)
    - Windows Machines require additional unix tools, easiest installed using [Windows Subsystem for Linux ](https://learn.microsoft.com/en-us/windows/wsl/install) on Win10/Win11 (e.g. `wsl --install -d Ubuntu`)  
    - After installing WSL, start the Linux Subsystem and install additional packages by running the command `sudo apt-get install gnupg make man git gawk file`  
    - In your subsystem proceed with the [manual installation](https://git-secret.io/installation#manual-installation):  
      `git clone https://github.com/sobolevn/git-secret.git git-secret`  
      `cd git-secret && make build`  
      `sudo PREFIX="/usr/local" make install`
4. Generate a RSA key-pair: `gpg --gen-key`
5. Export your public key with `gpg --armor --export you@email.com > public_key.txt`
6. Send public key to someone who already has access (On WSL you can reach your Windows Files at `/mnt/`. For example change directory to your C: Drive `cd /mnt/c`)
    - This person needs to import that key with `gpg --import public_key.txt`
    - Add the new person to the secrets repo: `git secret tell you@email.com` (email address associated with their public key)
    - Remove other user's public key from personal keyring with `gpg --delete keys you@email.com`
7. Wait for the protected files to be re-encrypted by a person who already has access, since you can't read these files yet
8. If your access has granted, you now can decrypt the protected files with `git secret reveal`  

### **(Re)-Encrypt Files**  
In order to re-encrypt files, for example when needing to add a user, you shoudl run the following commands:
```sh
git secret reveal; git secret hide -d
# the -d option deletes the unencrypted file after re-encrypting it
```

If you want to add new files for encryption, you can add these by running `git secret add <filenames...>`.
This will also add entries to the `.gitignore` preventing unencrypted files being pushed to the repo.  
Then use `git secret hide` to encrypt these added files.  
**Now it is safe to commit your changes.**

---
---
## **Run Locally**

## Start Node server
Change into node directory
```sh
  cd ./node_server
```

Start the server

```sh
  npm start
```

## Start Python server
Change directory to ../python_server/ in your shell.
```
uvicorn main:app --reload
```
---
---
## **Deployment**
This project was deployed on an AWS Linux Machine (Ubuntu). For reproduction and documentation purposes, the following abstracts will describe the neccessary steps and settings.  

The python model is running on CPU, since the free tier does not offer a CUDA GPU.

## Known Issues & Possible Solutions 
| ISSUE | DESCRIPTION | POSSIBLE SOLUTION |
| :------------ | :---------- | :---------- |
| **Multiple Request Handling** | Maxing out the limited ressources result in crashing the VM instance | Implementation of a job queue or similar |
| **Freesound Request Limit** | freesound.org limits (inexpensive) API calls to 60/Minute & 2000/day which limits sounds and makes multiple user requests almost impossible | Change API provider or create own library of animal sounds (according to detectable objects by python) | 

## Installation

Follow all steps of the [Installation Steps](https://github.com/KevinKroell/avprg-project#installation) from above.

### **Further Requirements:**
- **[PM2](https://pm2.keymetrics.io/):**  
  Production Process Manager for Node.js for keeping the Node Application live
  ```sh
  npm install pm2@latest -g
  ```
- **[nginx:](https://docs.nginx.com/nginx/admin-guide/web-server/)**  
  HTTP and reverse proxy server for forwarding requests to the public IP to node and python
  ```sh
  sudo apt update
  sudo apt install nginx 
  ```
- **[tmux:](https://github.com/tmux/tmux/wiki)** *(optional)*  
  Terminal Multiplexer to manage different virtual terminal sessions in one terminal
  ```sh 
  sudo apt-get install tmux 
  ```

## Setup & Settings

### NGINX
Since we will start Node and Python as local servers, we need to forward incoming requests to each of these two.  
Nginx will do exactly that, if configured correctly.

Located at `/etc/nginx` there is a configuration file named `nginx.conf`. Its content shoud include the following:  
**nginx.conf**  
```sh
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
        worker_connections 768;
}

http {

        ##
        # Basic Settings
        ##

        sendfile on;
        tcp_nopush on;
        tcp_nodelay on;
        keepalive_timeout 65;
        types_hash_max_size 2048;

        ##
        # Filesize Limit
        ##

        client_max_body_size 41M;

        include /etc/nginx/mime.types;
        default_type application/octet-stream;

        ##
        # SSL Settings
        ##

        ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
        ssl_prefer_server_ciphers on;

        ##
        # Logging Settings
        ##

        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;

        ##
        # Gzip Settings
        ##

        gzip on;

        ##
        # Virtual Host Configs
        ##

        include /etc/nginx/conf.d/*.conf;
        include /etc/nginx/sites-enabled/*;
}
```
In addition to that, in directory `/etc/nginx/sites-available` is located another file called `default`. Include the following:  
**default**  
```sh
# Default server configuration
#
server {
        listen 80 default_server;
        listen [::]:80 default_server;

        root /var/www/html;

        # Add index.php to the list if you are using PHP
        index index.html index.htm index.nginx-debian.html;

        location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                # try_files $uri $uri/ =404;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header Host $host;
                proxy_set_header X-NginX-Proxy true;
                proxy_pass http://localhost:8080;
                proxy_redirect http://localhost:8080/ http://$host/;

                # Set Headers to allow browsers sending post requests
                add_header 'Access-Control-Allow-Origin' *;
                add_header 'Access-Control-Allow-Credentials' 'true';
                add_header 'Access-Control-Allow-Methods' 'GET, POST';
                add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Content-Range,Range';
        }

        location /process {
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header Host $host;
                proxy_set_header X-NginX-Proxy true;
                proxy_pass http://localhost:8000;
                proxy_redirect http://localhost:8000/process http://$host/process;
        }

        location /upload {
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header Host $host;
                proxy_set_header X-NginX-Proxy true;
                proxy_pass http://localhost:8080;
                proxy_redirect http://localhost:8080/upload http://$host/upload;
                # Disable bufferin to prevent large files extending buffer limit (memory)
                proxy_request_buffering off;
        }
}
```

To run nginx, you will need the following commands.  
Keep in mind, that whenever you make changes on the configuration files, you need to restart the service.

**Start**  
```sh
sudo systemctl start nginx
```

**Stop**  
```sh
sudo systemctl stop nginx
```

**Restart**  
```sh
sudo systemctl restart nginx
```
---
### PM2 (Node)
PM2 will start the Node application and keep it online. When the server crashes because of an unexpected and not handled error, the process manager will simply restart the application. It can also observe the directories and restart the node server if something changes, which, at this time, is an unwanted feature, since ignoring the directories in which the video files are being uploaded, does not work yet as expected.    
To ensure that PM2 starts the application in the correct environment, there needs to be a configuration file.

**Generate Configuration File**  
This will create a file named `ecosystem.config.js` in the node directory of the project.
```sh
cd ./node_server
pm2 init simple
```

**Configure ecosystem.config.js**  
Make sure the contents of the file match with the following.  
Open the file with your preferred text editor, e.g. `sudo nano ecosystem.config.js`  
```js
module.exports = {
  apps : [{
    name   : "NAME-TO-IDENTIFY",    // Application name shown in PM2 process list
    script : "./server.js",         // Script to execute on start
    watch: false,                   // Set true, if restart on changes is desired
    ignore_watch: ["node_modules", "public/video", "tmp"], // ignores directories listed
    env_production: {               // Production environment
        "PORT": 8080,
        "NODE_ENV": "production"
    },
    env_development: {              // Development environment
      "PORT": 3000,
       "NODE_ENV": "development"
    }
  }]
}
```

**Start Application via PM2 in production environment**  
After changing to the node directory and running the following command, the application should start immediately and confirm this by showing a table of running or stopped processes.
```sh
cd ./node_server
pm2 start ecosystem.config.js --env production // necessary to listen on the correct port
```

**Start application at reboot**  
In order to start the application immediately after rebooting the linux machine type the following and execute the following suggested command showing up in the terminal.
```sh
pm2 startup
``` 

Once the application has been started correctly, save the app list of pm2 so it will respawn after reboot:
```sh
pm2 save
```

**Additional Commands**
Show Logs
```sh
pm2 logs
```

Restart Application
```sh
pm2 restart ecosystem.config.js --env production
```

Stop, Delete from List, Start Application
```sh
# '0' stands for the process id and will be 
# assigned automatically by pm2 on start.
# Alternatively you could use the name shown in pm2
pm2 stop 0
pm2 del 0
pm2 start ecosystem.config.js --env production
```
---
### Uvicorn (Python)  

When using SSH to connect to the remote linux machine, it might help to make use of tmux as mentioned above.  
Except from a few parameters when starting uvicorn, the process does not need any further configuration.  

**Start Uvicorn with TMUX session**  
Change to the python directory with `cd avprg-project/python_server/`, then follow the steps below:  
```sh
# create a new tmux session with name 'python-server'
tmux new-session -s python-server
# start the python application with uvicorn
uvicorn main:app --host localhost --port 8000
# exit the tmux session window with [CTRL+B], [D]
```

**View python output of running session**  
To view the output from python you can enter a running tmux session with the following command: 
```sh
tmux attach -t python-server
```

**List running tmux sessions**  
```sh
tmux ls
```
## Typical Workflow

### Startup
When everything is setup correctly, you would need to follow this command workflow in order to start everything.  
```sh
sudo systemctl start nginx
cd ~avprg-project/node_server/
pm2 start ecosystem.config.js --env production
cd ../python_server/
tmux new-session -s python-server
uvicorn main:app --host localhost --port 8000
# exit the tmux session window with [CTRL+B], [D]
```

### Applying Changes
If you need to change anything in the configuration, pull updates or fix bugs, this workflow ensures you restarted everything correctly.
```sh
sudo systemctl restart nginx

cd ~avprg-project/node_server/
pm2 status    # look for the ID corresponding to the application
pm2 stop [ID] # replace '[ID]' with the correct number
pm2 del [ID]  # replace '[ID]' with the correct number
pm2 start ecosystem.config.js --env production
pm2 save

cd ../python_server/
tmux list-sessions # look for corresponding session
tmux kill-session -t [target-session] # replace '[target-session]' with correct one
tmux new-session -s python-server
uvicorn main:app --host localhost --port 8000
# exit the tmux session window with [CTRL+B], [D]
```

---
---
## **API Reference**

### Upload video to node

```http
  POST /upload
```

| Required Type | Description |
| :------------ | :---------- |
| `file`        | **Required**. Video of type *.mp4 < 40mb |


### Hand video to Python server

```http
  POST /process
```

| Required Type | Description |
| :------------ | :---------- |
| `json`        | **Required**. Information about video to be processed. |

```
  {
      "filepath" : "../../node_server/public/video/"
  }
```
---
---

## **Authors**

[@KevinKroell](https://github.com/KevinKroell)  
[@SirMightyMo](https://github.com/SirMightyMo)  
[@LeanderWernst](https://github.com/LeanderWernst)
