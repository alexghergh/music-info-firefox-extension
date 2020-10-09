## Music info extension

### Introduction

Simple firefox extension to send the currently audio playing tab to a local server.

The server then writes the audio to a file locally, which you can then use in whatever application you want (for example displaying the song playing in tmux statusline_).

The file is written to /tmp. This has 2 benefits:

1. It gets automatically deleted on reboot.

2. If the /tmp is mounted in RAM, then nothing gets written on disk.

### How it works

The extension gets every tab playing audio and processes them through a regex to filter out just the song name (currently only Nextcloud and YouTube audio are processed, other audio tabs are displayed in full). It then sends the tab to the local server (by default running on localhost:17565) every few seconds. If the song changes, then the local server updates the file.

#### Running the server locally

To run the server, you can use systemd if your system supports it.

You can use a systemd unit file similar to this (you should place it in ~/.config/sytemd/user):

```
[Unit]
Description=music info node.js server (this server interacts with the browser extension to get information about the currently playing song)
After=network.target

[Service]
Type=simple
ExecStartPre=/usr/bin/bash -c "echo 'Not playing' > /tmp/mozilla_song"
ExecStart=/path/to/node /path/to/server/server.js
Restart=on-failure


[Install]
WantedBy=default.target
```

Substitue the path to node and the path to server.js to suit your configuration.

Then just start the service with `systemctl --user start <systemd-unit-name>.service` or enable the service on boot with `systemctl --user enable <systemd-unit-name.service` (where <systemd-unit-name> is the name you gave to the systemd unit file). All regular systemctl commands like `start`, `stop`, `status` etc. work as expected.
