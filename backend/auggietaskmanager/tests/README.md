# Test Documentation

This directory contains tests for the AuggieTaskManager backend, specifically for the Moodle calendar integration functionality.

## Overview

The test suite includes:
- **Unit Tests** (`test_moodle_calendar_unit.py`) - Tests individual functions in isolation with mocked dependencies
- **Integration Tests** (`test_moodle_calendar_integration.py`) - Tests real-world scenarios and data flows

## Prerequisites

Before running tests, ensure you have:
1. Python 3.10+ installed
2. All dependencies installed from `requirements.txt`
3. Django environment set up

```bash
# Install dependencies (if not already done)
cd backend/auggietaskmanager
pip install -r requirements.txt
```

## Running Tests

### Run All Tests

```bash
# From backend/auggietaskmanager directory
cd backend/auggietaskmanager
python manage.py test tests --verbosity=2
```

### Run Specific Test Files

```bash
# Run only unit tests
python manage.py test tests.test_moodle_calendar_unit --verbosity=2

# Run only integration tests
python manage.py test tests.test_moodle_calendar_integration --verbosity=2
```

### Run Specific Test Classes

```bash
# Run a specific test class
python manage.py test tests.test_moodle_calendar_unit.TestExtractCalendarData --verbosity=2
```

### Run Individual Test Methods

```bash
# Run a single test method
python manage.py test tests.test_moodle_calendar_unit.TestExtractCalendarData.test_single_event --verbosity=2
```

## Test Structure

### Unit Tests (`test_moodle_calendar_unit.py`)

Tests the `extract_calendar_data` function with various scenarios:

**Happy Paths:**
- Single event extraction
- Multiple events extraction
- Timezone conversion
- Course name truncation
- Empty calendar handling

**Error Handling:**
- Network errors (connection failures)
- Invalid iCalendar format
- Missing required fields (summary, description, dtend, categories)
- Timeout errors
- Malformed event data

### Integration Tests (`test_moodle_calendar_integration.py`)

Tests real-world scenarios:
- Realistic semester calendar with multiple courses
- High-volume events (50+ events)
- Mixed timezone events
- Special characters in content
- Long descriptions
- Clustered deadlines
- Duplicate event handling
- End-of-semester scenarios

## Understanding Test Output

### Successful Test Run

```
================================
Running All Tests (unittest)
================================
test_single_event ... ok
test_multiple_events ... ok
...
----------------------------------------------------------------------
Ran 30 tests in 0.234s

OK

✓ All tests passed!
```

### Failed Test Run

```
test_single_event ... FAIL
...
----------------------------------------------------------------------
FAILED (failures=1)

✗ Some tests failed
```

## Verbosity Levels

You can control the amount of output:

```bash
# Minimal output
python manage.py test tests --verbosity=0

# Normal output (default)
python manage.py test tests --verbosity=1

# Detailed output (recommended)
python manage.py test tests --verbosity=2

# Very detailed output
python manage.py test tests --verbosity=3
```

## Continuous Integration

The test suite is designed to be run in CI/CD pipelines. The Django test command returns appropriate exit codes:
- `0` - All tests passed
- `1` - One or more tests failed

Example CI/CD command:
```bash
python manage.py test tests --verbosity=2
```

## Troubleshooting

### Tests Won't Run

**Problem:** `ModuleNotFoundError` or import errors

**Solution:** Make sure you're in the correct directory and have installed dependencies:
```bash
cd backend/auggietaskmanager
pip install -r requirements.txt
```

### Database Errors

**Problem:** Database-related errors during tests

**Solution:** Django automatically creates a test database. Ensure your database settings in `settings.py` are correct.


## Writing New Tests

When adding new tests, follow the existing patterns:

1. **Unit Tests**: Mock external dependencies (network calls, file I/O)
2. **Integration Tests**: Test realistic end-to-end scenarios
3. **Use descriptive test names**: `test_feature_scenario_expected_result`
4. **Follow AAA pattern**: Arrange (GIVEN), Act (WHEN), Assert (THEN)
5. **Add docstrings**: Explain what the test validates

Example:
```python
@patch("moodle.utils.requests.get")
def test_extract_calendar_data_new_feature(self, mock_get):
    """
    Test description of what this validates
    
    Args:
        mock_get (MagicMock): Mocked requests.get function
    """
    # GIVEN: setup test data
    # ...
    
    # WHEN: perform action
    # ...
    
    # THEN: verify expectations
    # ...
```

## Additional Resources

- [Django Testing Documentation](https://docs.djangoproject.com/en/stable/topics/testing/)
- [Python unittest Documentation](https://docs.python.org/3/library/unittest.html)
- [unittest.mock Documentation](https://docs.python.org/3/library/unittest.mock.html)

## Support

If you encounter issues with the tests, please:
1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Review the test output for specific error messages
4. Check that you're using the correct Python version (3.10+)

