# Test Documentation

This directory contains tests for the AuggieTaskManager backend, specifically for the Moodle calendar integration functionality.

## Overview

The test suite includes:

### Moodle Calendar Import Tests
- **Unit Tests** (`test_moodle_calendar_unit.py`) - Tests individual functions in isolation with mocked dependencies
- **Integration Tests** (`test_moodle_calendar_integration.py`) - Tests real-world scenarios and data flows

### Calendar View Tests
- **Unit Tests** (`test_calendar_view_unit.py`) - Tests serializers, models, and queryset filtering in isolation
- **Integration Tests** (`test_calendar_view_integration.py`) - Tests realistic calendar scenarios with Moodle imports
- **System Tests** (`test_calendar_view_system.py`) - Tests API endpoints end-to-end with authentication

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
python manage.py test tests.<filename> --verbosity=2
```
### Run Specific Test Classes

```bash
# Run a specific test class
python manage.py test tests.<filename>.<class> --verbosity=2
```

### Run Individual Test Methods

```bash
# Run a single test method
python manage.py test tests.<filename>.<class>.<method> --verbosity=2
```

## Test Structure

### Moodle Calendar Import Tests

#### Unit Tests (`test_moodle_calendar_unit.py`)

Tests the `extract_calendar_data` function with various scenarios:

**Happy Paths:**
- Single event extraction
- Multiple events extraction
- Timezone conversion
- Course name truncation
- Empty calendar handling

**Sad Paths:**
- Network errors (connection failures)
- Invalid iCalendar format
- Missing required fields (summary, description, dtend, categories)
- Timeout errors
- Malformed event data

#### Integration Tests (`test_moodle_calendar_integration.py`)

Tests real-world scenarios:
- Realistic semester calendar with multiple courses
- High-volume events (50+ events)
- Mixed timezone events
- Special characters in content
- Long descriptions
- Clustered deadlines
- Duplicate event handling
- End-of-semester scenarios

### Calendar View Tests

#### Unit Tests (`test_calendar_view_unit.py`)

Tests individual components in isolation:

**CalendarViewSerializerUnitTests:**
- Verifies `is_imported` field computation for Moodle tasks
- Verifies `is_imported` field computation for manual tasks
- Validates all required fields are present in serializer output
- Tests serialization of mixed task sources

**CalendarViewModelUnitTests:**
- Task creation with Moodle source
- Task creation with manual source
- Default source field behavior
- Task ordering by due_date
- Timestamp auto-update functionality

**CalendarViewQuerysetUnitTests:**
- Filtering tasks by user
- Filtering tasks by source (moodle/manual)
- Date range filtering
- Combined filter operations

#### Integration Tests (`test_calendar_view_integration.py`)

Tests realistic calendar scenarios with Moodle imports:

**Happy Paths:**
- Semester calendar with mixed Moodle and manual tasks
- Multiple courses from Moodle imports
- End-of-semester with many concurrent deadlines
- Completed and incomplete task handling
- User isolation with Moodle imports
- Long descriptions from Moodle
- Date range filtering with Moodle imports

#### System Tests (`test_calendar_view_system.py`)

Tests API endpoints end-to-end:

**CalendarViewEndpointSystemTests - Happy Paths:**
- Returns Moodle imports with proper identification
- Date range filtering
- Response without date range parameters
- User isolation
- Response structure validation
- Multiple Moodle courses handling
- Completed and incomplete tasks

**CalendarViewEndpointSystemTests - Sad Paths:**
- Authentication required for calendar endpoint
- Invalid date format handling
- Malformed start date handling
- Malformed end date handling
- Empty result set handling

**HealthEndpointSystemTests:**
- Health endpoint accessible without authentication
- Health endpoint works with authentication

## Understanding Test Output

### Successful Test Run

```
================================
Running All Tests
================================
test_single_event ... ok
test_multiple_events ... ok
...
----------------------------------------------------------------------
Ran 60 tests in 3.094s

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

1. **Unit Tests**: Mock external dependencies (network calls, file I/O, database queries)
2. **Integration Tests**: Test realistic end-to-end scenarios with real database interactions
3. **System Tests**: Test API endpoints with full HTTP request/response cycle
4. **Use descriptive test names**: `test_feature_scenario_expected_result`
5. **Follow AAA pattern**: Arrange (GIVEN), Act (WHEN), Assert (THEN)
6. **Add docstrings**: Explain what the test validates
7. **Organize tests**: Use comment separators for happy/sad paths: `# ==================== HAPPY PATHS ====================`

### Unit Test Example:
```python
@patch("moodle.utils.requests.get")
def test_extract_calendar_data_new_feature(self, mock_get):
    """
    Test description of what this validates
    
    Args:
        mock_get (MagicMock): Mocked requests.get function
    """
    # GIVEN: setup test data
    cal = Calendar()
    # ...
    
    # WHEN: perform action
    result = extract_calendar_data(url)
    
    # THEN: verify expectations
    self.assertEqual(result[0]['title'], 'Expected Title')
```

### Integration Test Example:
```python
def test_realistic_scenario(self):
    """
    Test realistic scenario description
    
    Verifies end-to-end behavior with real data.
    """
    # GIVEN: Realistic test data setup
    user = User.objects.create_user('testuser')
    Task.objects.create(user=user, title='Task', source='moodle')
    
    # WHEN: Action performed
    tasks = Task.objects.filter(user=user, source='moodle')
    serializer = TaskSerializer(tasks, many=True)
    
    # THEN: Verify expected behavior
    self.assertTrue(all(t['is_imported'] for t in serializer.data))
```

### System Test Example:
```python
def test_api_endpoint(self):
    """
    Test API endpoint behavior
    
    Verifies complete HTTP request/response cycle.
    """
    # GIVEN: Authenticated client
    client = APIClient()
    user = User.objects.create_user('testuser', 'test@example.com', 'password')
    client.force_authenticate(user=user)
    
    # WHEN: API request is made
    response = client.get('/api/endpoint/')
    
    # THEN: Verify response
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.assertIn('expected_field', response.data)
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

