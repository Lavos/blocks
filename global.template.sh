#!/bin/bash

SCRIPT=$(cat)

cat <<EOF
var Blocks = $SCRIPT;
EOF
