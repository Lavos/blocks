#!/bin/bash

SCRIPT=$(cat)

cat <<EOF
define(['jquery'], function($){
return $SCRIPT;
});
EOF
