// Packages
import test from 'ava';
import execa from 'execa';
import fileExists from 'file-exists';
import del from 'del';

// Util
import readfileAsync from '../src/util/readfile-async';

const SCRIPT = './cli.js';
const DUMMY_FROM = './test/test-dummies/_unfold.js';
const DUMMY_TARGET_NAME = 'custom-file-name';
const DUMMY_FILE_NAME = `${DUMMY_TARGET_NAME}.png`;
const ABSENT_DUMMY_CONFIG = './non-existent.json';
const PRESENT_DUMMY_CONFIG = './test/test-dummies/_config.json';

test.serial('Running `carbon-now` fails without at least one argument', async t => {
	try {
		await execa.stdout(SCRIPT);
		t.fail();
	} catch (error) {
		t.true(error.failed);
	}
});

test.serial('Allows for custom file name via --target', async t => {
	await execa(SCRIPT, [
		DUMMY_FROM,
		`-t=${DUMMY_TARGET_NAME}`
	]);

	t.true(await fileExists(DUMMY_FILE_NAME));
});

test.serial('Doesn’t create config when --config provided', async t => {
	await execa(SCRIPT, [
		DUMMY_FROM,
		`--config=${ABSENT_DUMMY_CONFIG}`,
		`-t=${DUMMY_TARGET_NAME}`
	]);

	t.false(await fileExists(ABSENT_DUMMY_CONFIG));
});

test.serial('Doesn’t modify local config, treats it as read-only', async t => {
	const BEFORE = await readfileAsync(PRESENT_DUMMY_CONFIG);

	await execa(SCRIPT, [
		DUMMY_FROM,
		`--config=${PRESENT_DUMMY_CONFIG}`,
		`-t=${DUMMY_TARGET_NAME}`
	]);

	const AFTER = await readfileAsync(PRESENT_DUMMY_CONFIG);

	t.is(BEFORE, AFTER);
});

// Cleanup
test.afterEach((async () => {
	await del([
		DUMMY_FILE_NAME
	]);
}));
