import test from 'ava';
import path from 'path';
import { Application } from 'spectron';


const electronPath = path.resolve(
    __dirname, '..', 'node_modules', '.bin', 'electron'
);

test.beforeEach(t => {
    t.context.app = new Application({
        path: electronPath
    });

    return t.context.app.start();
});

test.afterEach(t => {
    return t.context.app.stop();
});

test('shows an initial window', t => {
    return t.context.app.client.getWindowCount().then(count => {
        t.is(count, 1);
    });
});
