#!/bin/bash

SCRIPT=$(cat)

cat <<EOF
CLARITY.provide('blocks', [], function(){
return $SCRIPT;
});
EOF
