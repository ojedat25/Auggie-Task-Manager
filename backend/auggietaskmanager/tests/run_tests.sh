#!/bin/bash
# Test runner script for Moodle Calendar tests

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT" || exit 1

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Run unittest tests
run_unittest_all() {
    print_header "Running All Tests (unittest)"
    python -m unittest tests.test_moodle_calendar_unit tests.test_moodle_calendar_integration -v
}


# Main command handler
case "${1:-all}" in
    "all")
        run_unittest_all
        ;;
esac

# Check exit code and print result
if [ $? -eq 0 ]; then
    echo ""
    print_success "All tests passed!"
    exit 0
else
    echo ""
    print_error "Some tests failed"
    exit 1
fi

