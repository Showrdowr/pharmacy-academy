import {
    buildLearningProgressCacheKey,
    clearLearningProgressCache,
    writeLearningProgressCache,
} from './progress-cache';

describe('progress-cache', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(() => {
        window.localStorage.clear();
    });

    it('clears only learning progress cache entries', () => {
        writeLearningProgressCache('user-1', 12, 101, 45);
        writeLearningProgressCache('user-2', 21, 202, 90);
        window.localStorage.setItem('ontrack_user', '{"id":1}');
        window.localStorage.setItem('unrelated-key', 'keep-me');

        clearLearningProgressCache();

        expect(window.localStorage.getItem(buildLearningProgressCacheKey('user-1', 12))).toBeNull();
        expect(window.localStorage.getItem(buildLearningProgressCacheKey('user-2', 21))).toBeNull();
        expect(window.localStorage.getItem('ontrack_user')).toBe('{"id":1}');
        expect(window.localStorage.getItem('unrelated-key')).toBe('keep-me');
    });
});
