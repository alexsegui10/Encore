#!/usr/bin/env sh
# wait-for-it.sh: wait for a service to be available before executing a command
# Usage: ./wait-for-it.sh host:port [-t timeout] [-- command args]

set -e

TIMEOUT=15
QUIET=0
HOST=""
PORT=""
CMD=""

usage() {
  echo "Usage: $0 host:port [-t timeout] [-q] [-- command args]"
  echo "  -h HOST:PORT                 Host and port to test"
  echo "  -t TIMEOUT                   Timeout in seconds (default: 15)"
  echo "  -q                           Quiet mode"
  echo "  -- COMMAND ARGS              Execute command with args after the test"
  exit 1
}

wait_for() {
  if [ "$QUIET" -ne 1 ]; then echo "Waiting for $HOST:$PORT..."; fi
  
  for i in $(seq $TIMEOUT); do
    if nc -z "$HOST" "$PORT" > /dev/null 2>&1; then
      if [ "$QUIET" -ne 1 ]; then echo "$HOST:$PORT is available!"; fi
      return 0
    fi
    sleep 1
  done
  
  echo "Timeout waiting for $HOST:$PORT" >&2
  return 1
}

# Parse arguments
while [ $# -gt 0 ]; do
  case "$1" in
    -h)
      HOST=$(echo "$2" | cut -d: -f1)
      PORT=$(echo "$2" | cut -d: -f2)
      shift 2
      ;;
    --host=*)
      HOST=$(echo "$1" | sed 's/--host=//' | cut -d: -f1)
      PORT=$(echo "$1" | sed 's/--host=//' | cut -d: -f2)
      shift 1
      ;;
    -t)
      TIMEOUT="$2"
      shift 2
      ;;
    --timeout=*)
      TIMEOUT=$(echo "$1" | sed 's/--timeout=//')
      shift 1
      ;;
    -q)
      QUIET=1
      shift 1
      ;;
    --quiet)
      QUIET=1
      shift 1
      ;;
    --strict)
      shift 1
      ;;
    --)
      shift
      CMD="$@"
      break
      ;;
    *)
      if [ -z "$HOST" ]; then
        HOST=$(echo "$1" | cut -d: -f1)
        PORT=$(echo "$1" | cut -d: -f2)
      fi
      shift 1
      ;;
  esac
done

if [ -z "$HOST" ] || [ -z "$PORT" ]; then
  usage
fi

wait_for

if [ -n "$CMD" ]; then
  exec $CMD
fi
