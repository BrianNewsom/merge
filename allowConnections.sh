#!/bin/bash

sudo /sbin/iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
