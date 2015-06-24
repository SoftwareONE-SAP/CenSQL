#!/bin/bash
if [[ $EUID -ne 0 ]]; then
  echo "You must be a root user!"
  exit 1
else

	echo "Checking nodejs install..."
	
	node --version &> /dev/null

	if [[ $? -ne 0 ]]; then
	  echo "You must have nodejs installed and located in /usr/local/bin/node to use CenSQL!"
	  exit 1
	else

		echo "Removing old symlink if needed..."
		unlink /usr/bin/censql &> /dev/null
		echo "Removed old symlink if needed!"

		echo "Creating symlink /usr/bin/censql..."
	  ln -s $(pwd)/app.js /usr/bin/censql
	  echo "Created symlink /usr/bin/censql!"

	  echo "Done installing!"
	fi
fi