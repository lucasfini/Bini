#!/bin/bash

# Calendar Testing Script
# Comprehensive testing suite for calendar swipe navigation functionality

set -e

echo "🗓️  Starting Calendar Navigation Testing Suite"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "PASS")
            echo -e "${GREEN}✅ PASS${NC}: $message"
            ((TESTS_PASSED++))
            ;;
        "FAIL")
            echo -e "${RED}❌ FAIL${NC}: $message"
            ((TESTS_FAILED++))
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  INFO${NC}: $message"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  WARN${NC}: $message"
            ;;
    esac
    ((TOTAL_TESTS++))
}

# Function to run test suite
run_test_suite() {
    local test_name=$1
    local test_pattern=$2
    local description=$3
    
    echo ""
    echo -e "${BLUE}Running $test_name${NC}"
    echo "Description: $description"
    echo "Pattern: $test_pattern"
    echo "----------------------------------------"
    
    if npm test -- --testPathPattern="$test_pattern" --verbose --coverage=false; then
        print_status "PASS" "$test_name completed successfully"
    else
        print_status "FAIL" "$test_name failed"
        return 1
    fi
}

# Function to run performance tests
run_performance_tests() {
    echo ""
    echo -e "${BLUE}Running Performance Tests${NC}"
    echo "Description: Benchmarking calendar render and gesture performance"
    echo "----------------------------------------"
    
    # Set environment variables for performance testing
    export NODE_ENV=test
    export PERFORMANCE_TESTING=true
    
    if npm test -- --testPathPattern="CalendarPerformance" --verbose --maxWorkers=1; then
        print_status "PASS" "Performance tests completed successfully"
    else
        print_status "FAIL" "Performance tests failed"
        return 1
    fi
}

# Function to run E2E tests
run_e2e_tests() {
    echo ""
    echo -e "${BLUE}Running E2E Tests${NC}"
    echo "Description: End-to-end gesture and navigation testing"
    echo "----------------------------------------"
    
    # Check if Detox is available
    if ! command -v detox &> /dev/null; then
        print_status "WARN" "Detox not installed, skipping E2E tests"
        return 0
    fi
    
    # Build the app for testing (iOS simulator)
    echo "Building app for E2E testing..."
    if detox build --configuration ios.sim.debug; then
        print_status "PASS" "E2E build completed successfully"
    else
        print_status "FAIL" "E2E build failed"
        return 1
    fi
    
    # Run E2E tests
    if detox test --configuration ios.sim.debug e2e/CalendarSwipeNavigation.e2e.js; then
        print_status "PASS" "E2E tests completed successfully"
    else
        print_status "FAIL" "E2E tests failed"
        return 1
    fi
}

# Function to generate coverage report
generate_coverage_report() {
    echo ""
    echo -e "${BLUE}Generating Coverage Report${NC}"
    echo "Description: Code coverage analysis for calendar components"
    echo "----------------------------------------"
    
    if npm test -- --testPathPattern="Calendar" --coverage --coverageDirectory=coverage/calendar; then
        print_status "PASS" "Coverage report generated successfully"
        echo "Coverage report available at: coverage/calendar/lcov-report/index.html"
    else
        print_status "FAIL" "Coverage report generation failed"
        return 1
    fi
}

# Function to validate test environment
validate_environment() {
    echo ""
    echo -e "${BLUE}Validating Test Environment${NC}"
    echo "----------------------------------------"
    
    # Check Node.js version
    node_version=$(node --version)
    echo "Node.js version: $node_version"
    
    # Check npm version
    npm_version=$(npm --version)
    echo "npm version: $npm_version"
    
    # Check if React Native dependencies are installed
    if [ -d "node_modules/react-native" ]; then
        print_status "PASS" "React Native dependencies found"
    else
        print_status "FAIL" "React Native dependencies missing"
        return 1
    fi
    
    # Check if testing dependencies are installed
    if [ -d "node_modules/jest" ] && [ -d "node_modules/@testing-library/react-native" ]; then
        print_status "PASS" "Testing dependencies found"
    else
        print_status "FAIL" "Testing dependencies missing"
        return 1
    fi
    
    # Check calendar source files
    if [ -f "src/screens/calendar/CalendarScreen.tsx" ]; then
        print_status "PASS" "Calendar source files found"
    else
        print_status "FAIL" "Calendar source files missing"
        return 1
    fi
}

# Function to run linting
run_linting() {
    echo ""
    echo -e "${BLUE}Running Code Quality Checks${NC}"
    echo "Description: ESLint and TypeScript checks for calendar files"
    echo "----------------------------------------"
    
    # Run ESLint on calendar files
    if npx eslint "src/screens/calendar/**/*.{ts,tsx}" "__tests__/**/*Calendar*.{ts,tsx}"; then
        print_status "PASS" "ESLint checks passed"
    else
        print_status "FAIL" "ESLint checks failed"
    fi
    
    # Run TypeScript checks
    if npx tsc --noEmit; then
        print_status "PASS" "TypeScript checks passed"
    else
        print_status "FAIL" "TypeScript checks failed"
    fi
}

# Main execution flow
main() {
    echo "Starting comprehensive calendar testing..."
    echo "Test start time: $(date)"
    
    # Validate environment first
    if ! validate_environment; then
        echo -e "${RED}Environment validation failed. Exiting.${NC}"
        exit 1
    fi
    
    # Run code quality checks
    run_linting
    
    # Run unit tests
    run_test_suite "Unit Tests" "CalendarScreen.test" "Core functionality and component behavior testing"
    
    # Run integration tests
    run_test_suite "Integration Tests" "CalendarIntegration" "Timeline data integration and navigation testing"
    
    # Run performance tests
    run_performance_tests
    
    # Run E2E tests (optional, requires Detox setup)
    if [[ "${RUN_E2E:-false}" == "true" ]]; then
        run_e2e_tests
    else
        print_status "INFO" "E2E tests skipped (set RUN_E2E=true to enable)"
    fi
    
    # Generate coverage report
    if [[ "${GENERATE_COVERAGE:-true}" == "true" ]]; then
        generate_coverage_report
    else
        print_status "INFO" "Coverage report skipped"
    fi
    
    # Print summary
    echo ""
    echo "=============================================="
    echo -e "${BLUE}Test Summary${NC}"
    echo "=============================================="
    echo "Tests passed: $TESTS_PASSED"
    echo "Tests failed: $TESTS_FAILED"
    echo "Total tests: $TOTAL_TESTS"
    echo "Test end time: $(date)"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}💥 Some tests failed!${NC}"
        exit 1
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --e2e)
            export RUN_E2E=true
            shift
            ;;
        --no-coverage)
            export GENERATE_COVERAGE=false
            shift
            ;;
        --performance-only)
            export PERFORMANCE_ONLY=true
            shift
            ;;
        --help)
            echo "Calendar Testing Script"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --e2e             Run E2E tests (requires Detox setup)"
            echo "  --no-coverage     Skip coverage report generation"
            echo "  --performance-only Run only performance tests"
            echo "  --help           Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  RUN_E2E=true         Enable E2E testing"
            echo "  GENERATE_COVERAGE=false  Disable coverage reports"
            echo "  PERFORMANCE_TESTING=true Enable performance mode"
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run performance-only mode if requested
if [[ "${PERFORMANCE_ONLY:-false}" == "true" ]]; then
    echo "Running performance tests only..."
    validate_environment
    run_performance_tests
    exit $?
fi

# Run main test suite
main