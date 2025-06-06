// Simple Test Utilities
let testsRun = 0;
let testsPassed = 0;

function describe(description, fn) {
    console.group(description);
    fn();
    console.groupEnd();
}

function it(description, fn) {
    testsRun++;
    try {
        fn();
        console.log(`%c✓ PASS: ${description}`, 'color: green;');
        testsPassed++;
    } catch (error) {
        console.error(`%c✗ FAIL: ${description}`, 'color: red;');
        console.error(error);
    }
}

function assertEquals(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected} but got ${actual}`);
    }
}

function assertDeepEquals(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    }
}

function assertTrue(value, message) {
    if (!value) {
        throw new Error(message || 'Expected true but got false');
    }
}

function assertFalse(value, message) {
    if (value) {
        throw new Error(message || 'Expected false but got true');
    }
}

function assertNotNull(value, message) {
    if (value === null || value === undefined) {
        throw new Error(message || 'Expected value to not be null/undefined');
    }
}

function printTestSummary() {
    console.log('\n--- Test Summary ---');
    if (testsPassed === testsRun) {
        console.log(`%cAll ${testsRun} tests passed!`, 'color: green; font-weight: bold;');
    } else {
        console.error(`%c${testsPassed} out of ${testsRun} tests passed.`, 'color: red; font-weight: bold;');
    }
    console.log('--------------------');
}
