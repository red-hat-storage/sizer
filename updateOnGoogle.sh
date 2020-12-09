#!/bin/bash

ROOTDIR=$(git rev-parse --show-toplevel)
gsutil -m cp -r "${ROOTDIR}/*.html" "gs://ocs-solver-dev/"
gsutil -m cp -r "${ROOTDIR}/lib/*" "gs://ocs-solver-dev/"
