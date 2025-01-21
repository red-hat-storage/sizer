# ODF Sizing Tool

This repository contains the source code of the ODF 4 Sizing Tool.
The tool is hosted on https://sizer.ocs.ninja and pushes to main automatically update this site.


## Using the source code

### Requirements

The requirements are managed with npm. If you do not have npm yet, please [install it on your platform](https://nodejs.org/en/download/).

Afterwards all dependencies can be installed via `npm install` from within the root of this repository.

### Building the code

If you want to build the code in a one-off way, you can do so with `npm run build`. This will create the build folder with the static site.

### Developing with the code

To develop it is handy to use the `npm run dev` feature that will automatically rebuild the code when there are changes to the source code.
Running `npm run dev` will spawn a server on http://localhost:9001 that you can visit to see the site with your code changes. When the code is rebuild, the browser will automatically refresh the site for you.
