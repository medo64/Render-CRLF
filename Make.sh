#!/bin/sh
#~ VSCE Project
SCRIPT_DIR="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
SCRIPT_NAME=`basename $0`

if [ -t 1 ]; then
    ANSI_RESET="$(tput sgr0)"
    ANSI_RED="`[ $(tput colors) -ge 16 ] && tput setaf 9 || tput setaf 1 bold`"
    ANSI_YELLOW="`[ $(tput colors) -ge 16 ] && tput setaf 11 || tput setaf 3 bold`"
    ANSI_MAGENTA="`[ $(tput colors) -ge 16 ] && tput setaf 13 || tput setaf 5 bold`"
    ANSI_PURPLE="$(tput setaf 5)"
    ANSI_CYAN="`[ $(tput colors) -ge 16 ] && tput setaf 14 || tput setaf 6 bold`"
fi

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $SCRIPT_NAME [target]..."
    echo
    echo "Targets:"
    echo "  upgrade    Upgrades the project packages"
    echo "  publish    Publish the project"
    echo
    echo "Actions with '~' prefix are negated"
    echo
    echo "Examples:"
    echo "  make publish         - Publish the package"
    echo
    exit 0
fi


if ! command -v git >/dev/null; then
    echo "${ANSI_YELLOW}Missing git command${ANSI_RESET}"
fi


HAS_CHANGES=$( git status -s 2>&1 | wc -l )
if [ "$HAS_CHANGES" -gt 0 ]; then
    echo "${ANSI_YELLOW}Uncommitted changes present${ANSI_RESET}"
fi


PROJECT_NAME=$( cat "$SCRIPT_DIR/package.json" | grep name | head -1 | cut -d: -f2 | xargs | sed 's/,$//' )
if [ "$PROJECT_NAME" = "" ]; then
    echo "${ANSI_PURPLE}Project name ........: ${ANSI_RED}not found${ANSI_RESET}"
    exit 113
fi
echo "${ANSI_PURPLE}Project name ........: ${ANSI_MAGENTA}$PROJECT_NAME${ANSI_RESET}"

PROJECT_VERSION=$( cat "$SCRIPT_DIR/package.json" | grep version | head -1 | cut -d: -f2 | xargs | sed 's/,$//' )
if [ "$PROJECT_VERSION" = "" ]; then
    echo "${ANSI_PURPLE}Project version .....: ${ANSI_RED}not found${ANSI_RESET}"
    exit 113
fi
echo "${ANSI_PURPLE}Project version .....: ${ANSI_MAGENTA}$PROJECT_VERSION${ANSI_RESET}"

GIT_INDEX=$( git rev-list --count HEAD 2>/dev/null )
if [ "$GIT_INDEX" = "" ]; then GIT_INDEX=0; fi

GIT_HASH=$( git log -n 1 --format=%h 2>/dev/null )
if [ "$GIT_HASH" = "" ]; then GIT_HASH=alpha; fi

GIT_VERSION=$( git tag --points-at HEAD 2>/dev/null | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sed -n 1p | sed 's/^v//g' | xargs )
if [ "$GIT_VERSION" != "" ]; then
    echo "${ANSI_PURPLE}Git tag version .....: ${ANSI_MAGENTA}$GIT_VERSION${ANSI_RESET}"
else
    echo "${ANSI_PURPLE}Git tag version .....: ${ANSI_MAGENTA}-${ANSI_RESET}"
fi

PUBLISH_VSCE_KEY=$( cat "$SCRIPT_DIR/.meta.private" 2>/dev/null | grep -E "^PUBLISH_VSCE_KEY:" | sed  -n 1p | cut -d: -sf2- | xargs )
if [ "$PUBLISH_VSCE_KEY" = "" ]; then
    echo "${ANSI_PURPLE}VSCE package key ....: ${ANSI_YELLOW}(not configured)${ANSI_RESET}" >&2
else
    echo "${ANSI_PURPLE}VSCE package key ....: ${ANSI_MAGENTA}(configured)${ANSI_RESET}"
fi


prereq_upgrade() {
    if ! command -v npm >/dev/null; then
        echo "${ANSI_RED}Missing npm command${ANSI_RESET}" >&2  # sudo apt-get install -y nodejs
        exit 113
    fi
}

prereq_publish() {
    if ! command -v npm >/dev/null; then
        echo "${ANSI_RED}Missing npm command${ANSI_RESET}" >&2  # sudo apt-get install -y nodejs
        exit 113
    fi

    if ! command -v vsce >/dev/null; then
        echo "${ANSI_RED}Missing vsce command${ANSI_RESET}" >&2  # sudo npm install -g @vscode/vsce
        exit 113
    fi
}


make_upgrade() {
    echo
    echo "${ANSI_MAGENTA}┏━━━━━━━━━┓${ANSI_RESET}"
    echo "${ANSI_MAGENTA}┃ UPGRADE ┃${ANSI_RESET}"
    echo "${ANSI_MAGENTA}┗━━━━━━━━━┛${ANSI_RESET}"
    echo

    npm upgrade || exit 113
    npm update || exit 113
    npm audit fix || exit 113
    echo
}


make_publish() {
    echo
    echo "${ANSI_MAGENTA}┏━━━━━━━━━┓${ANSI_RESET}"
    echo "${ANSI_MAGENTA}┃ PUBLISH ┃${ANSI_RESET}"
    echo "${ANSI_MAGENTA}┗━━━━━━━━━┛${ANSI_RESET}"
    echo

    vsce publish -p $PUBLISH_VSCE_KEY || exit 113
    echo
}


if [ "$1" = "" ]; then ACTIONS="upgrade"; else ACTIONS="$@"; fi

TOKENS=" "
NEGTOKENS=
PREREQ_UPGRADE=0
PREREQ_PUBLISH=0
for ACTION in $ACTIONS; do
    case $ACTION in
        upgrade)    TOKENS="$TOKENS upgrade" ; PREREQ_UPGRADE=1 ;;
        publish)    TOKENS="$TOKENS publish" ; PREREQ_PUBLISH=1 ;;
        ~upgrade)   NEGTOKENS="$NEGTOKENS upgrade"   ;;
        ~publish)   NEGTOKENS="$NEGTOKENS publish"   ;;
        *)         echo "Unknown action $ACTION" >&2 ; exit 113 ;;
    esac
done

if [ $PREREQ_UPGRADE -ne 0 ]; then prereq_upgrade; fi
if [ $PREREQ_PUBLISH -ne 0 ]; then prereq_publish; fi

NEGTOKENS=$( echo $NEGTOKENS | xargs | tr ' ' '\n' | awk '!seen[$0]++' | xargs )  # remove duplicates
TOKENS=$( echo $TOKENS | xargs | tr ' ' '\n' | awk '!seen[$0]++' | xargs )  # remove duplicates

for NEGTOKEN in $NEGTOKENS; do  # remove tokens we specifically asked not to have
    TOKENS=$( echo $TOKENS | tr ' ' '\n' | grep -v $NEGTOKEN | xargs )
done

if [ "$TOKENS" != "" ]; then
    echo "${ANSI_PURPLE}Make targets ........: ${ANSI_MAGENTA}$TOKENS${ANSI_RESET}"
else
    echo "${ANSI_PURPLE}Make targets ........: ${ANSI_RED}not found${ANSI_RESET}"
    exit 113
fi
echo

for TOKEN in $TOKENS; do
    case $TOKEN in
        upgrade)   make_upgrade || exit 113 ;;
        publish)   make_publish || exit 113 ;;
        *)         echo "Unknown token $TOKEN" >&2 ; exit 113 ;;
    esac
done

exit 0
