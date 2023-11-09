import { ChallengeFailedError } from '../src/errors';
import { default as workerObject, handleGetChallenge, handlePostChallenge } from '../src/index';
import { ExecutionContextMock, getContext, getEnv } from './mocks';

const sampleURL = 'http://localhost';

describe('challenge handlers', () => {
	const challengeURL = `${sampleURL}/challenge`;
	const mockHeaders = {
		'private-token-attester-data': 'competence-tree-empire', // this is a random token. I don't like to use test or example, because if this somehow appears in the wild, 3 random words are less significant. Turnstile token passage should be controlled by TURNSTILE_SECRET_KEY defined in ../jest.config.js
		'CF-Connecting-IP': '198.51.100.1', // this is a test IP part of 198.51.100.0/24. This is reserved for testing per https://datatracker.ietf.org/doc/html/rfc5737.
	};

	it('should return an html page when a challenge is requested', () => {
		const request = new Request(challengeURL);
		const ctx = getContext({ env: getEnv(), ectx: new ExecutionContextMock() });
		const response = handleGetChallenge(ctx, request);

		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBeDefined();
	});

	it('should return an error when no answer is provided', async () => {
		const request = new Request(challengeURL, { method: 'POST', headers: mockHeaders });
		const ctx = getContext({ env: getEnv(), ectx: new ExecutionContextMock() });
		const response = handlePostChallenge(ctx, request);

		return expect(response).rejects.toThrowError(new ChallengeFailedError());
	});
});

describe('non existing handler', () => {
	const nonExistingURL = `${sampleURL}/non-existing`;

	it('should return 404 when a non GET existing endpoint is requested', async () => {
		const request = new Request(nonExistingURL);
		const response = await workerObject.fetch(request, getEnv(), new ExecutionContextMock());

		expect(response.status).toBe(404);
	});

	it('should return 404 when a non POST existing endpoint is requested', async () => {
		const request = new Request(nonExistingURL, { method: 'POST' });
		const response = await workerObject.fetch(request, getEnv(), new ExecutionContextMock());

		expect(response.status).toBe(404);
	});
});
