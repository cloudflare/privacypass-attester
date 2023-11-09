import { Bindings } from './bindings';
import { Context } from './context';
import { ChallengeFailedError, HeaderNotDefinedError, IssuerFetchError } from './errors';
import { Router } from './router';
import {
	AttesterConfigurationResponse,
	IssuerConfigurationResponse,
	TurnstileResponse,
} from './types';

import { generateHTML as attesterHTML } from './client-html';

const generateFetchIssuerEndpoint =
	(ctx: Context): ((input: RequestInfo, info?: RequestInit) => Promise<Response>) =>
	(input: RequestInfo, info?: RequestInit) => {
		if (ctx.env.ISSUER) {
			return ctx.env.ISSUER.fetch(input, info);
		}
		return fetch(input, info);
	};

export const handleGetChallenge = (ctx: Context, request: Request) => {
	const body = attesterHTML(ctx, request);

	return new Response(body, { headers: { 'Content-Type': 'text/html' } });
};

export const handlePostChallenge = async (ctx: Context, request: Request) => {
	// Turnstile injects a token in "cf-turnstile-response".
	// The client passes this token in Sec-Token-Turnstile header.
	const turnstileToken = request.headers.get('private-token-attester-data');

	if (!turnstileToken) {
		throw new HeaderNotDefinedError('Header `private-token-attester-data` not defined.');
	}
	const ip = request.headers.get('CF-Connecting-IP');
	if (!ip) {
		throw new HeaderNotDefinedError('Header `CF-Connecting-IP` not defined.');
	}

	// Validate the token by calling the
	// "/siteverify" API endpoint.
	const formData = new FormData();
	formData.append('secret', ctx.env.TURNSTILE_SECRET_KEY);
	formData.append('response', turnstileToken);
	formData.append('remoteip', ip);

	const result = await fetch(ctx.env.TURNSTILE_VERIFICATION_URL, {
		body: formData,
		method: 'POST',
	});

	const outcome: TurnstileResponse = await result.json();
	if (!outcome.success) {
		console.log(`Failed to validate Turnstile response: ${outcome['error-codes']}`);
		throw new ChallengeFailedError();
	}

	// Request token from issuer.
	// TODO: remove service binding, which is a limitation of the attester and the issuer running on the same cloudflare account
	return generateFetchIssuerEndpoint(ctx)(ctx.env.ISSUER_REQUEST_URL, request);
};

export const handleTokenKeyDirectory = async (ctx: Context) => {
	// Proxy request for keys to the issuer from attester, which client trusts
	// TODO: add explicit support for an array of issuers for an attester
	try {
		const response = await generateFetchIssuerEndpoint(ctx)(ctx.env.ISSUER_DIRECTORY_URL);
		const issuerTokenKeyDirectory: IssuerConfigurationResponse = await response.json();

		const { hostname } = new URL(ctx.env.ISSUER_DIRECTORY_URL);

		// only return the issuer's public key details
		// the returned directory enables associating this attester with issuer(s) that trust it
		const tokenKeyDirectory: AttesterConfigurationResponse = {
			[hostname]: {
				'token-keys': issuerTokenKeyDirectory['token-keys'],
			},
		};

		// TODO: in the RFC, it might would be good to have a specific content-type for this response
		return new Response(JSON.stringify(tokenKeyDirectory), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch {
		throw new IssuerFetchError();
	}
};

export default {
	async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
		// router defines all API endpoints
		// this ease testing, as test can be performed on specific handler methods, not necessardily e2e
		const router = new Router();

		router
			.get('/challenge', handleGetChallenge)
			.post('/challenge', handlePostChallenge)
			.get('/v1/private-token-issuer-directory', handleTokenKeyDirectory);

		return router.handle(
			request as Request<Bindings, IncomingRequestCfProperties<unknown>>,
			env,
			ctx
		);
	},
};
