#!/bin/bash

gsutil -m rsync -R -x "node_modules|src" "$(git rev-parse --show-toplevel)/backend" "gs://ocs-solver-dev"
